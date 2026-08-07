/** Store request-scoped di Elysia context (idempotency / logging). */
export interface RequestStore {
  startedAt?: number;
  requestId?: string;
}
