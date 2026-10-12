import type { BuildStage, SpaceStage } from "@/lib/contracts";

// Échec rattaché à une étape : le message est montré tel quel au dev (jamais au client).
export class StageError extends Error {
  constructor(
    readonly stage: BuildStage | SpaceStage,
    message: string,
  ) {
    super(message);
  }
}
