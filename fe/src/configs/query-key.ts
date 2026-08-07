/**
 * Query key terpusat untuk React Query.
 *
 * Setiap module memiliki hierarki:
 *   <module>Root → ["<module>"]
 *   <module>     → daftar key spesifik (list / detail / resource)
 *
 * Hook query/mutation TIDAK boleh membuat query key inline — selalu
 * gunakan konstanta di file ini agar invalidation konsisten.
 */
export const queryKey = {
  authRoot: () => ['auth'] as const,

  auth: {
    me: () => ['auth', 'me'] as const,

    sessions: () => ['auth', 'sessions'] as const,
  },
} as const;
