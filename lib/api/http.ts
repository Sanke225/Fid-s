import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import type { ApiError, ErrorCode } from "@/lib/contracts";

// Erreur métier : levée n'importe où dans une route, convertie en réponse { error } par handle().
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

function errorResponse(status: number, code: ErrorCode, message: string, details?: Record<string, unknown>) {
  const body: ApiError = { error: { code, message, ...(details ? { details } : {}) } };
  return Response.json(body, { status });
}

// Enveloppe toutes les routes : une seule forme d'erreur, et jamais de détail interne renvoyé au navigateur.
export function handle<C>(fn: (request: Request, context: C) => Promise<Response>) {
  return async (request: Request, context: C): Promise<Response> => {
    try {
      return await fn(request, context);
    } catch (error) {
      if (error instanceof HttpError) {
        return errorResponse(error.status, error.code, error.message, error.details);
      }
      if (error instanceof z.ZodError) {
        return errorResponse(422, "VALIDATION_ERROR", "Certaines informations sont invalides.", {
          fields: z.flattenError(error).fieldErrors,
        });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return errorResponse(409, "CONFLICT", "Cet élément existe déjà.");
      }
      console.error(error);
      return errorResponse(500, "INTERNAL_ERROR", "Une erreur inattendue est survenue. Réessayez dans un instant.");
    }
  };
}

export async function parseJson<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new HttpError(422, "VALIDATION_ERROR", "Le corps de la requête doit être du JSON valide.");
  }
  return schema.parse(body);
}

export function notFound(message = "Élément introuvable.") {
  return new HttpError(404, "NOT_FOUND", message);
}
