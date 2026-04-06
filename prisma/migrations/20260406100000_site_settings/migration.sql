CREATE TABLE "site_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);

-- Default: enable Stripe, disable PayPal
INSERT INTO "site_settings" ("key", "value", "updatedAt") VALUES
  ('payments.stripe.enabled', 'true', NOW()),
  ('payments.paypal.enabled', 'false', NOW());
