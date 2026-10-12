import { createHash } from "node:crypto";
import { HttpError } from "@/lib/api/http";
import { prisma } from "@/lib/db";
import { encryptBlob } from "@/lib/crypto/envelope";
import { writeStored } from "@/lib/storage";
import { transition } from "./transitions";

// Dépôt du code d'une livraison : l'archive est chiffrée sur disque, puis une installation est mise en file
// pour le worker. Une seule installation à la fois par livraison.

export const MAX_ARCHIVE_BYTES = 50 * 1024 * 1024;

// En-tête d'un fichier zip (« PK\x03\x04 »).
const isZip = (b: Buffer) => b.length > 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;

// git : présent quand le code vient de GitHub (dépôt et commit exacts, affichés au dev).
export async function submitSource(
  deliveryId: string,
  devId: string,
  file: { name: string; data: Buffer },
  git?: { repo: string; sha: string; message: string },
) {
  if (file.data.length > MAX_ARCHIVE_BYTES) {
    throw new HttpError(413, "ARCHIVE_TOO_LARGE", "L’archive dépasse 50 Mo. Retirez node_modules, .next et les fichiers lourds.");
  }
  if (!isZip(file.data)) throw new HttpError(422, "ARCHIVE_INVALID", "Envoyez le projet sous forme d’archive .zip.");

  const delivery = await prisma.delivery.findFirst({
    where: { id: deliveryId, project: { ownerId: devId } },
    select: { id: true, status: true, project: { select: { status: true } } },
  });
  if (!delivery) throw new HttpError(404, "DELIVERY_NOT_FOUND", "Livraison introuvable.");
  // Après « Terminé », la version montrée au client est figée.
  if (delivery.project.status !== "assigned" && delivery.project.status !== "in_progress") {
    throw new HttpError(409, "INVALID_TRANSITION", "Le code ne peut être envoyé que pendant le développement du projet.");
  }
  if (delivery.status === "building") {
    throw new HttpError(409, "BUILD_IN_PROGRESS", "Une installation est déjà en cours. Attendez la fin pour renvoyer le code.");
  }

  const sealed = encryptBlob(file.data);
  const sha256 = createHash("sha256").update(file.data).digest("hex");
  const archive = await prisma.sourceArchive.create({
    data: {
      deliveryId,
      originalFilename: file.name.slice(0, 200),
      sizeBytes: BigInt(file.data.length),
      sha256,
      storagePath: "",
      wrappedKey: sealed.wrappedKey,
      iv: sealed.iv,
      authTag: sealed.authTag,
      gitRepo: git?.repo ?? null,
      gitCommitSha: git?.sha ?? null,
      gitCommitMessage: git?.message ?? null,
    },
  });
  const storagePath = `archives/${archive.id}.enc`;
  await writeStored(storagePath, sealed.ciphertext);

  return prisma.$transaction(async (tx) => {
    await tx.sourceArchive.update({ where: { id: archive.id }, data: { storagePath } });
    const build = await tx.build.create({ data: { deliveryId, sourceArchiveId: archive.id } });
    await transition(
      deliveryId,
      { type: "source.submitted", actor: `user:${devId}`, payload: { buildId: build.id, sizeBytes: file.data.length, sha256, ...(git ? { repo: git.repo, commit: git.sha } : {}) } },
      { tx },
    );
    return build;
  });
}
