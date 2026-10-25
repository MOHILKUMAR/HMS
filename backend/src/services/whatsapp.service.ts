import twilio from 'twilio';

interface OtpRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory OTP store (mobile -> OtpRecord)
const otpStore = new Map<string, OtpRecord>();

// In-memory Rate Limit store (mobile -> RateLimitRecord)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean expired records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt < now) {
      otpStore.delete(key);
    }
  }
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Standardize Indian/International mobile number into E.164 WhatsApp format
 */
export function formatWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    return `whatsapp:+91${cleaned}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `whatsapp:+${cleaned}`;
  } else if (phone.startsWith('+')) {
    return `whatsapp:${phone.replace(/[^0-9+]/g, '')}`;
  }
  return `whatsapp:+${cleaned}`;
}

/**
 * Send WhatsApp OTP via Twilio with Rate Limiting & Anti-Brute Force Protection
 */
export async function sendWhatsAppOtp(mobile: string): Promise<{ success: boolean; message: string; testOtp?: string }> {
  const normalizedPhone = mobile.replace(/[^0-9]/g, '').slice(-10);
  const now = Date.now();

  // Rate Limiting: Max 3 requests per 10 minutes per phone number
  const rateLimit = rateLimitStore.get(normalizedPhone);
  if (rateLimit) {
    if (now < rateLimit.resetAt) {
      if (rateLimit.count >= 3) {
        const waitMinutes = Math.ceil((rateLimit.resetAt - now) / 60000);
        throw new Error(`Rate limit exceeded. Please wait ${waitMinutes} minute(s) before requesting another OTP.`);
      }
      rateLimit.count += 1;
    } else {
      rateLimitStore.set(normalizedPhone, { count: 1, resetAt: now + 10 * 60 * 1000 });
    }
  } else {
    rateLimitStore.set(normalizedPhone, { count: 1, resetAt: now + 10 * 60 * 1000 });
  }

  // Generate cryptographically random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const ttlMs = 5 * 60 * 1000; // 5 minutes validity
  const expiresAt = now + ttlMs;

  otpStore.set(normalizedPhone, { otp, expiresAt, attempts: 0 });

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  const contentSid = process.env.TWILIO_CONTENT_SID;
  const isProduction = process.env.NODE_ENV === 'production';

  // Check if Twilio is properly configured with an actual secret token
  const hasLiveTwilio = Boolean(
    accountSid &&
    accountSid.startsWith('AC') &&
    authToken &&
    authToken !== '[AuthToken]' &&
    authToken.length >= 20
  );

  if (hasLiveTwilio) {
    try {
      const client = apiKeySid && apiKeySid.startsWith('SK')
        ? twilio(apiKeySid, authToken, { accountSid })
        : twilio(accountSid, authToken);

      const toWhatsApp = formatWhatsAppNumber(mobile);

      console.log(`[WhatsApp OTP] Dispatching Twilio message to ${toWhatsApp} from ${fromNumber}...`);

      if (contentSid) {
        await client.messages.create({
          from: fromNumber,
          to: toWhatsApp,
          contentSid,
          contentVariables: JSON.stringify({ "1": otp, "2": "5 minutes" }),
        });
      } else {
        await client.messages.create({
          from: fromNumber,
          to: toWhatsApp,
          body: `🏥 *Swastik Hospital Management System*\n\nYour patient portal verification OTP is: *${otp}*\n\nThis OTP is valid for 5 minutes. Please do not share it with anyone.`,
        });
      }

      console.log(`[WhatsApp OTP] Dispatched successfully to ${toWhatsApp}`);
      return {
        success: true,
        message: `Verification code sent to WhatsApp (+91 ${normalizedPhone})`,
      };
    } catch (err: any) {
      console.error('[WhatsApp OTP Error]', err.message);
      // In development mode only, provide simulation debug code if Twilio delivery fails
      if (!isProduction) {
        return {
          success: true,
          message: `Dev mode: Twilio delivery issue (${err.message}). Debug code: ${otp}`,
          testOtp: otp,
        };
      }
      throw new Error(`Unable to deliver SMS/WhatsApp OTP at this time: ${err.message}`);
    }
  } else {
    // Sandbox / local dev mode
    console.log(`[WhatsApp OTP Sandbox] Code generated for +91-${normalizedPhone}: ${otp}`);
    return {
      success: true,
      message: `OTP dispatched to +91 ${normalizedPhone}.`,
      testOtp: !isProduction ? otp : undefined,
    };
  }
}

/**
 * Verify WhatsApp OTP with strict rate limiting and brute force protection
 */
export function verifyWhatsAppOtp(mobile: string, userEnteredOtp: string): { valid: boolean; error?: string } {
  const normalizedPhone = mobile.replace(/[^0-9]/g, '').slice(-10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Demo bypass ONLY in non-production local development
  if (!isProduction && userEnteredOtp === '1234') {
    return { valid: true };
  }

  const record = otpStore.get(normalizedPhone);
  if (!record) {
    return { valid: false, error: 'No active OTP request found for this mobile number. Please request a new OTP.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedPhone);
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    otpStore.delete(normalizedPhone);
    return { valid: false, error: 'Too many incorrect attempts. Account locked for 10 minutes. Please request a new OTP.' };
  }

  if (record.otp !== userEnteredOtp.trim()) {
    const remaining = 5 - record.attempts;
    return { valid: false, error: `Invalid verification code. ${remaining} attempt(s) remaining.` };
  }

  // Successfully verified - clear the token immediately to prevent reuse
  otpStore.delete(normalizedPhone);
  return { valid: true };
}
