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
      'atp-card': CustomElementProps<HTMLElement>;
      'atp-card-header': CustomElementProps<HTMLElement>;
      'atp-card-footer': CustomElementProps<HTMLElement>;
      'atp-button': CustomElementProps<HTMLElement, { label?: string }>;
    }
  }
}

export {};
