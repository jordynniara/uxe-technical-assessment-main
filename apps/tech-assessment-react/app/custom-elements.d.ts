import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type CustomElementProps<T extends HTMLElement, P = {}> = DetailedHTMLProps<
  HTMLAttributes<T> & P,
  T
>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'atp-header': CustomElementProps<HTMLElementTagNameMap['atp-header']>;
      'atp-sidebar': CustomElementProps<HTMLElementTagNameMap['atp-sidebar']>;
      'atp-breadcrumbs': CustomElementProps<HTMLElementTagNameMap['atp-breadcrumbs']>;
      'atp-input': CustomElementProps<
        HTMLElementTagNameMap['atp-input'],
        { isError?: boolean }
      >;
      'atp-dropdown': CustomElementProps<HTMLElementTagNameMap['atp-dropdown']>;
      'atp-checkbox': CustomElementProps<
        HTMLElementTagNameMap['atp-checkbox'],
        { label?: string; name?: string; value?: string }
      >;
      'atp-alert': CustomElementProps<
        HTMLElementTagNameMap['atp-alert'],
        {
          label?: string;
          icon?: string;
          appearance?: 'full' | 'page' | 'expandable' | 'toast';
          color?: 'danger' | 'warning' | 'info';
          hasClose?: boolean;
        }
      >;
      'atp-card': CustomElementProps<HTMLElement>;
      'atp-card-header': CustomElementProps<HTMLElement>;
      'atp-card-footer': CustomElementProps<HTMLElement>;
      'atp-button': CustomElementProps<HTMLElement, { label?: string }>;
    }
  }
}

export {};
