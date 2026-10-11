# contracts

Types partagés entre le front et l'API (section 6 du cahier des charges). Fait foi en cas de désaccord.
Ne se modifie que par une PR approuvée par les trois.

Pour le front : importer les types depuis `@/lib/contracts` et appeler l'API réelle (`/api/v1`)
via `lib/api/client.ts` et les hooks de `lib/queries/`. Il n'y a plus de fausses données : un seul backend.
