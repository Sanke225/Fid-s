/** Clés React Query : un seul endroit pour invalider proprement après une écriture. */
export const queryKeys = {
  me: ['me'] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  payoutMethods: ['payout-methods'] as const,
  tickets: ['tickets'] as const,
};
