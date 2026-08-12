'use client';

import 'goey-toast/styles.css';

import type { GooeyToasterProps } from 'goey-toast';
import { GooeyToaster as GooeyToasterPrimitive, gooeyToast } from 'goey-toast';
import { useTheme } from 'next-themes';

export { gooeyToast };
export type { GooeyToasterProps };
export type {
  GooeyPromiseData,
  GooeyToastAction,
  GooeyToastClassNames,
  GooeyToastOptions,
  GooeyToastTimings,
} from 'goey-toast';

function GooeyToaster(props: GooeyToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <GooeyToasterPrimitive
      position="top-right"
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      preset="bouncy"
      showProgress
      {...props}
    />
  );
}

export { GooeyToaster };
