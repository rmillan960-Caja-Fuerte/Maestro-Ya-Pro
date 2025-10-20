import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      className={cn('text-primary', className)}
      {...props}
    >
      <g fill="currentColor">
        <path d="M163.53 79.44-32.22 55.81-32.22-55.81a8 8 0 0 0-13.84 8l39.14 67.79a8 8 0 0 0 13.84 0l39.14-67.79a8 8 0 0 0-13.84-8Z" />
        <path d="m184.28 155.23-16.11-27.9-16.11-27.9a8 8 0 1 0-13.84 8l9.19 15.92-39.14 67.79a8 8 0 0 0 6.92 12h78.28a8 8 0 0 0 6.92-12l-16.11-27.9Z" opacity={0.7} />
        <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z" opacity={0.3} />
      </g>
    </svg>
  );
}
