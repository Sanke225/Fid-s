import { prisma } from "@/lib/db";
import { handle, notFound } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string; buildId: string }> };

// GET /api/v1/deliveries/:id/builds/:buildId/logs?after=<seq> — journal d'installation, réservé au dev.
export const GET = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id, buildId } = await params;
  const raw = Number(new URL(request.url).searchParams.get("after") ?? -1);
  const after = Number.isInteger(raw) ? raw : -1;

  const build = await prisma.build.findFirst({
    where: { id: buildId, deliveryId: id, delivery: { project: { ownerId: dev.id } } },
    select: { status: true, failureStage: true, failureMessage: true },
  });
  if (!build) throw notFound("Installation introuvable.");

  const lines = await prisma.buildLog.findMany({
    where: { buildId, seq: { gt: after } },
    orderBy: { seq: "asc" },
    take: 500,
  });
  return Response.json({
    lines: lines.map((l) => ({ seq: l.seq, stream: l.stream, line: l.line, at: l.at.toISOString() })),
    nextAfter: lines.at(-1)?.seq ?? after,
    done: build.status === "succeeded" || build.status === "failed",
    status: build.status,
    failure: build.failureStage ? { stage: build.failureStage, message: build.failureMessage ?? "" } : null,
  });
});
