export const BASE_URL =
  process.env.BASE_URL || process.env.__NEXT_PRIVATE_ORIGIN;

// Stripe
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// AWS S3
export const FILES3_REGION = process.env.FILES3_REGION;
export const FILES3_ACCESS_KEY_ID = process.env.FILES3_ACCESS_KEY_ID;
export const FILES3_SECRET_ACCESS_KEY = process.env.FILES3_SECRET_ACCESS_KEY;
export const FILES3_BUCKET_NAME = process.env.FILES3_BUCKET_NAME;
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
export const SMTP_EMAIL = process.env.SMTP_EMAIL;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
export const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME;
export const SMTP_TO_EMAIL = process.env.SMTP_TO_EMAIL;
export const API_URL = process.env.API_URL;
