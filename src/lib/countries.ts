// ISO 3166-1 alpha-2 codes grouped by continent.
// Kept to countries with meaningful shipping volume for collectibles.

export interface Country {
  code: string;
  name: string;
  continent: Continent;
}

export type Continent =
  | "North America"
  | "South America"
  | "Europe"
  | "Asia"
  | "Africa"
  | "Oceania";

export const CONTINENTS: Continent[] = [
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Oceania",
  "Africa",
];

export const COUNTRIES: Country[] = [
  // North America
  { code: "US", name: "United States", continent: "North America" },
  { code: "CA", name: "Canada", continent: "North America" },
  { code: "MX", name: "Mexico", continent: "North America" },
  { code: "CR", name: "Costa Rica", continent: "North America" },
  { code: "PA", name: "Panama", continent: "North America" },
  { code: "GT", name: "Guatemala", continent: "North America" },
  { code: "DO", name: "Dominican Republic", continent: "North America" },
  { code: "JM", name: "Jamaica", continent: "North America" },

  // South America
  { code: "BR", name: "Brazil", continent: "South America" },
  { code: "AR", name: "Argentina", continent: "South America" },
  { code: "CL", name: "Chile", continent: "South America" },
  { code: "CO", name: "Colombia", continent: "South America" },
  { code: "PE", name: "Peru", continent: "South America" },
  { code: "UY", name: "Uruguay", continent: "South America" },
  { code: "EC", name: "Ecuador", continent: "South America" },
  { code: "VE", name: "Venezuela", continent: "South America" },

  // Europe
  { code: "GB", name: "United Kingdom", continent: "Europe" },
  { code: "IE", name: "Ireland", continent: "Europe" },
  { code: "DE", name: "Germany", continent: "Europe" },
  { code: "FR", name: "France", continent: "Europe" },
  { code: "ES", name: "Spain", continent: "Europe" },
  { code: "IT", name: "Italy", continent: "Europe" },
  { code: "PT", name: "Portugal", continent: "Europe" },
  { code: "NL", name: "Netherlands", continent: "Europe" },
  { code: "BE", name: "Belgium", continent: "Europe" },
  { code: "LU", name: "Luxembourg", continent: "Europe" },
  { code: "CH", name: "Switzerland", continent: "Europe" },
  { code: "AT", name: "Austria", continent: "Europe" },
  { code: "DK", name: "Denmark", continent: "Europe" },
  { code: "SE", name: "Sweden", continent: "Europe" },
  { code: "NO", name: "Norway", continent: "Europe" },
  { code: "FI", name: "Finland", continent: "Europe" },
  { code: "IS", name: "Iceland", continent: "Europe" },
  { code: "PL", name: "Poland", continent: "Europe" },
  { code: "CZ", name: "Czech Republic", continent: "Europe" },
  { code: "SK", name: "Slovakia", continent: "Europe" },
  { code: "HU", name: "Hungary", continent: "Europe" },
  { code: "RO", name: "Romania", continent: "Europe" },
  { code: "BG", name: "Bulgaria", continent: "Europe" },
  { code: "GR", name: "Greece", continent: "Europe" },
  { code: "HR", name: "Croatia", continent: "Europe" },
  { code: "SI", name: "Slovenia", continent: "Europe" },
  { code: "EE", name: "Estonia", continent: "Europe" },
  { code: "LV", name: "Latvia", continent: "Europe" },
  { code: "LT", name: "Lithuania", continent: "Europe" },
  { code: "MT", name: "Malta", continent: "Europe" },
  { code: "CY", name: "Cyprus", continent: "Europe" },
  { code: "UA", name: "Ukraine", continent: "Europe" },

  // Asia
  { code: "JP", name: "Japan", continent: "Asia" },
  { code: "KR", name: "South Korea", continent: "Asia" },
  { code: "CN", name: "China", continent: "Asia" },
  { code: "HK", name: "Hong Kong", continent: "Asia" },
  { code: "TW", name: "Taiwan", continent: "Asia" },
  { code: "SG", name: "Singapore", continent: "Asia" },
  { code: "MY", name: "Malaysia", continent: "Asia" },
  { code: "TH", name: "Thailand", continent: "Asia" },
  { code: "ID", name: "Indonesia", continent: "Asia" },
  { code: "PH", name: "Philippines", continent: "Asia" },
  { code: "VN", name: "Vietnam", continent: "Asia" },
  { code: "IN", name: "India", continent: "Asia" },
  { code: "AE", name: "United Arab Emirates", continent: "Asia" },
  { code: "SA", name: "Saudi Arabia", continent: "Asia" },
  { code: "IL", name: "Israel", continent: "Asia" },
  { code: "TR", name: "Turkey", continent: "Asia" },

  // Oceania
  { code: "AU", name: "Australia", continent: "Oceania" },
  { code: "NZ", name: "New Zealand", continent: "Oceania" },
  { code: "FJ", name: "Fiji", continent: "Oceania" },

  // Africa
  { code: "ZA", name: "South Africa", continent: "Africa" },
  { code: "EG", name: "Egypt", continent: "Africa" },
  { code: "MA", name: "Morocco", continent: "Africa" },
  { code: "KE", name: "Kenya", continent: "Africa" },
  { code: "NG", name: "Nigeria", continent: "Africa" },
  { code: "GH", name: "Ghana", continent: "Africa" },
  { code: "TN", name: "Tunisia", continent: "Africa" },
];

const CODE_MAP: Record<string, Country> = COUNTRIES.reduce(
  (acc, c) => {
    acc[c.code] = c;
    return acc;
  },
  {} as Record<string, Country>
);

export function countryByCode(code: string): Country | undefined {
  return CODE_MAP[code];
}

export function countriesByContinent(continent: Continent): Country[] {
  return COUNTRIES.filter((c) => c.continent === continent);
}

export function groupByContinent(codes: string[]): Map<Continent, Country[]> {
  const out = new Map<Continent, Country[]>();
  for (const code of codes) {
    const country = CODE_MAP[code];
    if (!country) continue;
    const arr = out.get(country.continent) ?? [];
    arr.push(country);
    out.set(country.continent, arr);
  }
  return out;
}
