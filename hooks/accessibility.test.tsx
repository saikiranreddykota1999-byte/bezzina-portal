import { render } from '@testing-library/react';
import type { AxeResults } from 'axe-core';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CookieConsent } from '@/components/legal/cookie-consent';
import { FulfillmentSelector } from '@/components/checkout/fulfillment-selector';
import { ConfirmDestructiveDialog } from '@/components/admin/confirm-destructive-dialog';

function expectNoViolations(results: AxeResults) {
  expect(results.violations).toEqual([]);
}

describe('accessibility smoke', () => {
  it('cookie consent banner has no serious axe violations', async () => {
    window.localStorage.removeItem('bezzina-cookie-consent');
    const { container } = render(<CookieConsent />);
    const results = await axe(container, {
      rules: {
        'link-in-text-block': { enabled: false },
        'color-contrast': { enabled: false },
      },
    });
    expectNoViolations(results);
  });

  it('fulfillment selector exposes a fieldset legend and radios', async () => {
    const { container, getByRole } = render(
      <FulfillmentSelector value="delivery" onChange={() => undefined} />,
    );

    expect(getByRole('group', { name: /fulfillment method/i })).toBeInTheDocument();
    expect(getByRole('radio', { name: /delivery/i })).toBeChecked();

    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expectNoViolations(results);
  });

  it('confirm dialog uses alertdialog semantics when open', async () => {
    const { container, getByRole } = render(
      <ConfirmDestructiveDialog
        open
        onOpenChange={() => undefined}
        title="Delete item?"
        description="This cannot be undone."
        onConfirm={() => undefined}
      />,
    );

    expect(getByRole('alertdialog', { name: /delete item/i })).toBeInTheDocument();
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expectNoViolations(results);
  });
});
