import { httpApi, type PublicApi } from './api'

/** Un seul backend : l'API réelle (/api/v1). */
export const api: PublicApi = httpApi
