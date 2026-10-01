import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "phantom-ui": DetailedHTMLProps<
          HTMLAttributes<HTMLElement>,
          HTMLElement
        > & {
          loading?: string | boolean;
          animation?: "shimmer" | "pulse" | "breathe" | "solid" | string;
          mode?: "skeleton" | "overlay" | string;
          count?: string | number;
          "count-gap"?: string | number;
          "shimmer-direction"?: string;
          "shimmer-color"?: string;
          "background-color"?: string;
          duration?: string | number;
          stagger?: string | number;
          reveal?: string | number;
          "fallback-radius"?: string | number;
          debug?: boolean | string;
          "loading-label"?: string;
          "pierce-shadow"?: boolean | string;
        };
      }
    }
  }
}
