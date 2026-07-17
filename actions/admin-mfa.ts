'use server';

import type { ActionResult } from '@/types/action';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdminAuthenticatedUser } from '@/lib/auth/server-session';
import { isSuperAdminRole } from '@/lib/auth/roles';
import {
  ADMIN_MFA_SETUP_PATH,
  ADMIN_MFA_VERIFY_PATH,
  getSuperAdminMfaStatus,
  isSuperAdminMfaRequired,
} from '@/lib/auth/super-admin-mfa';
import { mfaCodeSchema, mfaFactorIdSchema } from '@/lib/validators/mfa';
import { logActivity } from '@/services/activity-log.service';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';


export type MfaEnrollmentPayload = {
  factorId: string;
  qrCode: string;
  secret: string;
};

async function requireSuperAdminSession() {
  const session = await requireAdminAuthenticatedUser('/admin');

  if (!isSuperAdminRole(session.profile?.role)) {
    throw new Error('Super Admin access required');
  }

  if (!isSuperAdminMfaRequired()) {
    throw new Error('MFA is not required for this environment');
  }

  return session;
}

async function assertMfaRateLimit(userId: string, action: string): Promise<ActionResult | null> {
  const ip = (await getClientIp()) ?? 'unknown';
  const allowed = await enforceRateLimit({
    action,
    identifier: `${ip}:${userId}`,
    maxAttempts: 10,
    windowMinutes: 15,
  });

  if (!allowed) {
    return { success: false, error: 'Too many attempts. Please wait and try again.' };
  }

  return null;
}

export async function getSuperAdminMfaStatusAction(): Promise<
  ActionResult<{
    required: boolean;
    enrolled: boolean;
    verified: boolean;
    setupPath: string;
    verifyPath: string;
  }>
> {
  try {
    await requireSuperAdminSession();
    const supabase = await createClient();
    const status = await getSuperAdminMfaStatus(supabase);

    return {
      success: true,
      data: {
        required: status.required,
        enrolled: status.enrolled,
        verified: status.verified,
        setupPath: ADMIN_MFA_SETUP_PATH,
        verifyPath: ADMIN_MFA_VERIFY_PATH,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to load MFA status',
    };
  }
}

export async function enrollSuperAdminMfaAction(): Promise<ActionResult<MfaEnrollmentPayload>> {
  try {
    const session = await requireSuperAdminSession();
    const supabase = await createClient();
    const status = await getSuperAdminMfaStatus(supabase);

    if (status.verified) {
      return { success: false, error: 'MFA is already enabled for this account.' };
    }

    const { data: factors } = await supabase.auth.mfa.listFactors();
    const staleFactors =
      factors?.all?.filter(
        (factor) => factor.factor_type === 'totp' && factor.status !== 'verified',
      ) ?? [];

    for (const factor of staleFactors) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Bezzina Super Admin',
      issuer: 'Joseph Bezzina Admin',
    });

    if (error || !data?.id || !data.totp) {
      return { success: false, error: 'Unable to start MFA enrollment. Please try again.' };
    }

    await logActivity({
      userId: session.user!.id,
      action: 'mfa.enroll_started',
      entity: 'auth',
      entityId: data.id,
    });

    return {
      success: true,
      data: {
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'MFA enrollment failed',
    };
  }
}

export async function verifySuperAdminMfaEnrollmentAction(
  factorId: string,
  code: string,
): Promise<ActionResult> {
  const factorParsed = mfaFactorIdSchema.safeParse(factorId);
  const codeParsed = mfaCodeSchema.safeParse(code);

  if (!factorParsed.success) {
    return { success: false, error: factorParsed.error.issues[0]?.message ?? 'Invalid factor' };
  }

  if (!codeParsed.success) {
    return { success: false, error: codeParsed.error.issues[0]?.message ?? 'Invalid code' };
  }

  try {
    const session = await requireSuperAdminSession();
    const rateLimited = await assertMfaRateLimit(session.user!.id, 'mfa_enroll_verify');
    if (rateLimited) return rateLimited;

    const supabase = await createClient();
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factorParsed.data,
      code: codeParsed.data,
    });

    if (error) {
      await logActivity({
        userId: session.user!.id,
        action: 'mfa.enroll_failed',
        entity: 'auth',
        entityId: factorParsed.data,
      });
      return { success: false, error: 'Invalid verification code. Please try again.' };
    }

    await logActivity({
      userId: session.user!.id,
      action: 'mfa.enroll_completed',
      entity: 'auth',
      entityId: factorParsed.data,
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'MFA verification failed',
    };
  }
}

export async function verifySuperAdminMfaLoginAction(code: string): Promise<ActionResult> {
  const codeParsed = mfaCodeSchema.safeParse(code);
  if (!codeParsed.success) {
    return { success: false, error: codeParsed.error.issues[0]?.message ?? 'Invalid code' };
  }

  try {
    const session = await requireSuperAdminSession();
    const rateLimited = await assertMfaRateLimit(session.user!.id, 'mfa_login_verify');
    if (rateLimited) return rateLimited;

    const supabase = await createClient();
    const status = await getSuperAdminMfaStatus(supabase);

    if (!status.factorId) {
      return { success: false, error: 'No verified MFA factor found. Set up MFA first.' };
    }

    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: status.factorId,
      code: codeParsed.data,
    });

    if (error) {
      await logActivity({
        userId: session.user!.id,
        action: 'mfa.verify_failed',
        entity: 'auth',
        entityId: status.factorId,
      });
      return { success: false, error: 'Invalid verification code. Please try again.' };
    }

    await logActivity({
      userId: session.user!.id,
      action: 'mfa.verify_success',
      entity: 'auth',
      entityId: status.factorId,
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'MFA verification failed',
    };
  }
}
