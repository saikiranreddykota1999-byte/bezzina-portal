import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RippleButton } from '@/components/ui/ripple-button';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('framer-motion', () => ({
  motion: {
    button: ({
      children,
      ...props
    }: React.ComponentProps<'button'> & { whileTap?: unknown }) => {
      delete props.whileTap;
      return <button {...props}>{children}</button>;
    },
    span: ({ children, ...props }: React.ComponentProps<'span'>) => (
      <span {...props}>{children}</span>
    ),
  },
}));

describe('RippleButton', () => {
  it('renders a link when href is provided', () => {
    render(<RippleButton href="/products">Browse products</RippleButton>);

    expect(screen.getByRole('link', { name: 'Browse products' })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('calls onClick for button mode', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<RippleButton onClick={onClick}>Continue</RippleButton>);

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
