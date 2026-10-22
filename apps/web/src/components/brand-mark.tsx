import type { SVGProps } from 'react';

/** A geometric W with a separated terminal, drawn for small application sizes. */
export function WorkbenchMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 34 32" fill="currentColor"
      aria-hidden="true" focusable="false" {...props}>
      <path d="M3 7h4.4l4.2 13.6L15.7 10h3.7l3.7 10.6 2.4-7.6h4.1l-4.7 13h-4.2l-3.3-9.1-3.6 9.1H9Z" />
      <path d="M27 6h4v4h-4Z" />
    </svg>
  );
}
