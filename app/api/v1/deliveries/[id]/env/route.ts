import { SetEnvVarInput } from "@/lib/contracts";
import { assertEnvEditable, findEditableDelivery } from "@/lib/core/env-vars";
import { encryptValue } from "@/lib/crypto/envelope";
import { prisma } from "@/lib/db";
import { handle, parseJson } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// GET /api/v1/deliveries/:id/env — noms seulement : une valeur enregistrée n'est jamais renvoyée.
export const GET = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;
  const delivery = await findEditableDelivery(id, dev.id);
  const vars = await prisma.deliveryEnvVar.findMany({
    where: { deliveryId: delivery.id },
    select: { name: true, createdAt: true },
    orderBy: { name: "asc" },
  });
  return Response.json({ items: vars.map((v) => ({ name: v.name, createdAt: v.createdAt.toISOString() })) });
});

// PUT /api/v1/deliveries/:id/env — crée ou remplace. Prise en compte au prochain envoi du code.
export const PUT = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;
  const input = await parseJson(request, SetEnvVarInput);
  const delivery = await findEditableDelivery(id, dev.id);
  assertEnvEditable(delivery.project.status);

  const valueEncrypted = encryptValue(input.value);
  const saved = await prisma.deliveryEnvVar.upsert({
    where: { deliveryId_name: { deliveryId: delivery.id, name: input.name } },
    create: { deliveryId: delivery.id, name: input.name, valueEncrypted },
    update: { valueEncrypted },
  });
  return Response.json({ name: saved.name, createdAt: saved.createdAt.toISOString() });
});
