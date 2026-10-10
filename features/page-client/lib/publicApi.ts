import { mockApi } from '../mocks/mockApi'
import { httpApi, type PublicApi } from './api'
import { USE_MOCK } from './env'

export { USE_MOCK }

export const api: PublicApi = USE_MOCK ? mockApi : httpApi
