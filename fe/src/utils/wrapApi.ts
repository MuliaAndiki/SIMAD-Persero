type AsyncFn = (...args: any[]) => Promise<any>;

type WrappedApi<T> = {
  [K in keyof T]: T[K] extends AsyncFn ? (...args: Parameters<T[K]>) => ReturnType<T[K]> : T[K];
};

export function WrapApi<T extends Record<string, any>>(apiModule: T): WrappedApi<T> {
  const wrapped = {} as WrappedApi<T>;
  const keys = new Set<string>();

  for (const key in apiModule) {
    keys.add(key);
  }

  let currentObj = apiModule;
  while (currentObj && currentObj !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(currentObj)) {
      if (key !== 'constructor') {
        keys.add(key);
      }
    }
    currentObj = Object.getPrototypeOf(currentObj);
  }

  for (const key of keys) {
    const value = (apiModule as any)[key];

    if (typeof value === 'function') {
      (wrapped as any)[key] = (async (...args: any[]) => {
        const res = await value.apply(apiModule, args);

        if (res?.status === 'error') {
          const errorMessage =
            typeof res.message === 'string' && res.message.trim() !== ''
              ? res.message
              : 'Terjadi kesalahan saat memproses data.';
          throw new Error(errorMessage);
        }

        return res;
      }) as WrappedApi<T>[keyof T];
    } else {
      (wrapped as any)[key] = value as WrappedApi<T>[keyof T];
    }
  }

  return wrapped;
}
