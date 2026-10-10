# contracts

Types partagés entre le front et l'API (section 6 du cahier des charges). Fait foi en cas de désaccord.
Ne se modifie que par une PR approuvée par les trois.

Pour le front : importer les types depuis `@/lib/contracts` et les fausses données depuis `@/lib/fixtures`
(un état par écran : `publicDeliveryDemoReady`, `publicDeliveryAwaitingConfirmation`, `publicDeliveryDelivered`…).
Au branchement, on remplace l'import des fixtures par l'appel à `/api/v1`, sans toucher aux composants.
