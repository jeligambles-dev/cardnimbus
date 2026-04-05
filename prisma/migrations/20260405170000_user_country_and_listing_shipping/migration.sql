-- Add country to users
ALTER TABLE "users" ADD COLUMN "country" TEXT;

-- Add shipsToCountries (array of ISO codes) to listings
ALTER TABLE "listings" ADD COLUMN "shipsToCountries" TEXT[] DEFAULT ARRAY[]::TEXT[];
