import type { HTMLAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'atp-header': HTMLAttributes<HTMLElement>;
      'atp-sidebar': HTMLAttributes<HTMLElement>;
      'atp-breadcrumbs': HTMLAttributes<HTMLElement>;
      'atp-card': HTMLAttributes<HTMLElement>;
      'atp-card-header': HTMLAttributes<HTMLElement>;
      'atp-card-footer': HTMLAttributes<HTMLElement>;
      'atp-button': HTMLAttributes<HTMLElement> & {
        label?: string;
      };
    }
  }
}

export {};
