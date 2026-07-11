'use server';

import { revalidatePath } from 'next/cache';
import { requireAuthenticatedUser } from '@/lib/auth/server-session';
import { updateProfileSchema } from '@/lib/validators/profile';
import type { ActionResult } from '@/types/pickup';

export type ProfileFormData = {
  fullName: string;
  phone: string;
  contactEmail: string;
  billingAddress: string;
  vatNumber: string;
};

export async function getProfileFormDataAction(): Promise<ActionResult<ProfileFormData>> {
  try {
    const { supabase, user, profile } = await requireAuthenticatedUser();

    const { data: freshProfile, error } = await supabase
      .from('profiles')
      .select('full_name, phone, contact_email, email, billing_address, vat_number')
      .eq('id', user!.id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };

    const source = freshProfile ?? profile;
    const metadata = (user!.user_metadata ?? {}) as Record<string, unknown>;

    return {
      success: true,
      data: {
        fullName:
          source?.full_name ??
          (typeof metadata.full_name === 'string' ? metadata.full_name : '') ??
          '',
        phone:
          source?.phone ??
          user!.phone ??
          (typeof metadata.phone === 'string' ? metadata.phone : '') ??
          '',
        contactEmail: resolveEditableContactEmail(
          source?.contact_email,
          source?.email,
          user!.email,
        ),
        billingAddress: source?.billing_address ?? '',
        vatNumber: source?.vat_number ?? '',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load profile',
    };
  }
}

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid profile data',
      };
    }

    const { supabase, user } = await requireAuthenticatedUser();
    const payload = parsed.data;

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: payload.fullName,
        phone: payload.phone,
        contact_email: payload.contactEmail || null,
      },
    });

    if (authError) return { success: false, error: authError.message };

    const profilePayload = {
      full_name: payload.fullName,
      phone: payload.phone,
      contact_email: payload.contactEmail || null,
      billing_address: payload.billingAddress || null,
      vat_number: payload.vatNumber || null,
    };

    const { data: existingProfile, error: lookupError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user!.id)
      .maybeSingle();

    if (lookupError) return { success: false, error: lookupError.message };

    const profileError = existingProfile
      ? (
          await supabase.from('profiles').update(profilePayload).eq('id', user!.id)
        ).error
      : (
          await supabase.from('profiles').insert({
            id: user!.id,
            email: user!.email ?? payload.contactEmail ?? '',
            role: 'customer',
            ...profilePayload,
          })
        ).error;

    if (profileError) return { success: false, error: profileError.message };

    revalidatePath('/account/profile');
    revalidatePath('/account/orders');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
}

function resolveEditableContactEmail(
  contactEmail: string | null | undefined,
  profileEmail: string | null | undefined,
  authEmail: string | null | undefined,
): string {
  const candidates = [contactEmail, profileEmail, authEmail];
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed && !trimmed.includes('@phone.otp.bezzina')) {
      return trimmed;
    }
  }
  return '';
}
