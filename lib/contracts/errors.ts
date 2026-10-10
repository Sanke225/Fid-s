import { z } from "zod";

// Le code fait partie du contrat ; le message (en français) est affichable tel quel mais peut changer.
export const ErrorCode = z.enum([
  // Toute route
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "RATE_LIMITED",
  "CONFLICT",
  "INTERNAL_ERROR",
  // Comptes
  "ROLE_ALREADY_CHOSEN",
  // Livraisons
  "DELIVERY_NOT_FOUND",
  "DELIVERY_NOT_EDITABLE",
  "INVALID_TRANSITION",
  // Code déposé
  "ARCHIVE_TOO_LARGE",
  "ARCHIVE_INVALID",
  "BUILD_IN_PROGRESS",
  "INSUFFICIENT_STORAGE",
  // Paiements
  "DELIVERY_NOT_PAYABLE",
  "PAYOUT_METHOD_NOT_FOUND",
  "PAYMENT_ALREADY_DECLARED",
  "TRANSACTION_REF_ALREADY_USED",
  "PAYMENT_NOT_DECIDABLE",
  // Tickets
  "TICKET_NOT_ALLOWED",
  "TICKET_ALREADY_OPEN",
  "TICKET_NOT_OPEN",
  "TICKET_DEV_DELAY_RUNNING",
  // Espace client
  "ACCESS_TOKEN_INVALID",
  "SOURCE_NOT_INCLUDED",
]);
export type ErrorCode = z.infer<typeof ErrorCode>;

export const ApiError = z.object({
  error: z.object({
    code: ErrorCode,
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});
export type ApiError = z.infer<typeof ApiError>;
