import { normalizePhone, phoneToSyntheticEmail } from '@/lib/otp/phone-helpers';

export { normalizePhone, phoneToSyntheticEmail };

export {
  buildOtpForStorage,
  generateOtpCode,
  getOtpExpiryDate,
  getSendWindowStart,
  hashOtpCode,
  otpConfig,
} from '@/lib/otp/core';
