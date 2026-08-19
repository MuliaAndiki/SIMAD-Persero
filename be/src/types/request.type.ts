/** Store request-scoped di Elysia context (idempotency / logging). */
export interface RequestStore {
  startedAt?: number;
  requestId?: string;
  /** Route pattern yang cocok (contoh `/api/v1/internships/:id`), untuk label metrik. */
  route?: string;
  /** Guard agar metrics/log request hanya diproses sekali (onAfterHandle / onError). */
  finalized?: boolean;
}
