// ───────────────────────────────────────────────────────────────
// Versioned tax bracket datasets.
//
// WHY THIS FILE EXISTS: tax brackets change every year. Hard-coding a
// single year silently goes stale and hurts credibility. Instead, each
// tax year is stored separately with its official source, and tax tools
// let the user pick the year. When a new year is published, add a new
// entry here — no tool code changes needed.
//
// Each bracket is [rate (decimal), upperLimit (taxable income)]. The top
// bracket uses Infinity. Amounts are for TAXABLE income (after the
// standard/itemized deduction). standardDeduction is provided for
// reference and to show a helper note.
//
// Sources are cited per year so every number is traceable.
// ───────────────────────────────────────────────────────────────

export const usFederalTax = {
  country: 'United States',
  authority: 'IRS',
  // Verified against IRS / Tax Foundation published tables.
  years: {
    2026: {
      verified: '2026-07-01',
      sourceUrl: 'https://taxfoundation.org/data/all/federal/2026-tax-brackets/',
      standardDeduction: { single: 16100, married: 32200, hoh: 24150 },
      brackets: {
        single:  [[0.10, 12400], [0.12, 50400], [0.22, 105700], [0.24, 201775], [0.32, 256225], [0.35, 640600], [0.37, Infinity]],
        married: [[0.10, 24800], [0.12, 100800], [0.22, 211400], [0.24, 403550], [0.32, 512450], [0.35, 768700], [0.37, Infinity]],
        hoh:     [[0.10, 17700], [0.12, 67450], [0.22, 105700], [0.24, 201775], [0.32, 256200], [0.35, 640600], [0.37, Infinity]],
      },
    },
    2025: {
      verified: '2026-07-01',
      sourceUrl: 'https://taxfoundation.org/data/all/federal/2025-tax-brackets/',
      standardDeduction: { single: 15000, married: 30000, hoh: 22500 },
      brackets: {
        single:  [[0.10, 11925], [0.12, 48475], [0.22, 103350], [0.24, 197300], [0.32, 250525], [0.35, 626350], [0.37, Infinity]],
        married: [[0.10, 23850], [0.12, 96950], [0.22, 206700], [0.24, 394600], [0.32, 501050], [0.35, 751600], [0.37, Infinity]],
        hoh:     [[0.10, 17000], [0.12, 64850], [0.22, 103350], [0.24, 197300], [0.32, 250525], [0.35, 626350], [0.37, Infinity]],
      },
    },
    2024: {
      verified: '2026-07-01',
      sourceUrl: 'https://taxfoundation.org/data/all/federal/2024-tax-brackets/',
      standardDeduction: { single: 14600, married: 29200, hoh: 21900 },
      brackets: {
        single:  [[0.10, 11600], [0.12, 47150], [0.22, 100525], [0.24, 191950], [0.32, 243725], [0.35, 609350], [0.37, Infinity]],
        married: [[0.10, 23200], [0.12, 94300], [0.22, 201050], [0.24, 383900], [0.32, 487450], [0.35, 731200], [0.37, Infinity]],
        hoh:     [[0.10, 16550], [0.12, 63100], [0.22, 100500], [0.24, 191950], [0.32, 243700], [0.35, 609350], [0.37, Infinity]],
      },
    },
  },
};

export const ukIncomeTax = {
  country: 'United Kingdom',
  authority: 'HMRC / Scottish Government',
  // Bands are cumulative upper limits of TAXABLE income (the loop starts at the
  // personal allowance). Top band uses Infinity. rUK = England, Wales & N. Ireland.
  // Personal allowance tapers by £1 per £2 of income over £100,000 (handled in tool).
  years: {
    '2026/27': {
      verified: '2026-07-01',
      sourceUrl: 'https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/2026-to-2027/',
      personalAllowance: 12570,
      ni: { primaryThreshold: 12570, upperEarningsLimit: 50270, mainRate: 0.08, upperRate: 0.02 },
      rUK: { bands: [50270, 125140, Infinity], rates: [0.20, 0.40, 0.45] },
      scotland: { bands: [16537, 29526, 43662, 75000, 125140, Infinity], rates: [0.19, 0.20, 0.21, 0.42, 0.45, 0.48] },
    },
    '2025/26': {
      verified: '2026-07-01',
      sourceUrl: 'https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/proposed-rates-and-bands-2025-to-2026/',
      personalAllowance: 12570,
      ni: { primaryThreshold: 12570, upperEarningsLimit: 50270, mainRate: 0.08, upperRate: 0.02 },
      rUK: { bands: [50270, 125140, Infinity], rates: [0.20, 0.40, 0.45] },
      scotland: { bands: [15397, 27491, 43662, 75000, 125140, Infinity], rates: [0.19, 0.20, 0.21, 0.42, 0.45, 0.48] },
    },
    '2024/25': {
      verified: '2026-07-01',
      sourceUrl: 'https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/rates-and-bands-2024-to-2025/',
      personalAllowance: 12570,
      ni: { primaryThreshold: 12570, upperEarningsLimit: 50270, mainRate: 0.08, upperRate: 0.02 },
      rUK: { bands: [50270, 125140, Infinity], rates: [0.20, 0.40, 0.45] },
      scotland: { bands: [14876, 26561, 43662, 75000, 125140, Infinity], rates: [0.19, 0.20, 0.21, 0.42, 0.45, 0.48] },
    },
  },
};

export const auIncomeTax = {
  country: 'Australia',
  authority: 'ATO',
  // Resident rates. [rate, upperLimit of taxable income]; first band is the
  // tax-free threshold (rate 0). Medicare levy is a separate 2% (tool checkbox).
  // Verified vs ATO. 2024-25 introduced the Stage-3 cuts (16%/30%); the 16% rate
  // drops to 15% from 1 July 2026 (2026-27).
  years: {
    '2026-27': {
      verified: '2026-07-01',
      sourceUrl: 'https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents',
      medicareLevy: 0.02,
      brackets: [[0, 18200], [0.15, 45000], [0.30, 135000], [0.37, 190000], [0.45, Infinity]],
    },
    '2025-26': {
      verified: '2026-07-01',
      sourceUrl: 'https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents',
      medicareLevy: 0.02,
      brackets: [[0, 18200], [0.16, 45000], [0.30, 135000], [0.37, 190000], [0.45, Infinity]],
    },
    '2024-25': {
      verified: '2026-07-01',
      sourceUrl: 'https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents',
      medicareLevy: 0.02,
      brackets: [[0, 18200], [0.16, 45000], [0.30, 135000], [0.37, 190000], [0.45, Infinity]],
    },
    '2023-24': {
      verified: '2026-07-01',
      sourceUrl: 'https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents',
      medicareLevy: 0.02,
      brackets: [[0, 18200], [0.19, 45000], [0.325, 120000], [0.37, 180000], [0.45, Infinity]],
    },
  },
};

export const pkIncomeTax = {
  country: 'Pakistan',
  authority: 'FBR',
  // Salaried-person slabs. [marginalRate, upperLimit of annual taxable income].
  // Verified vs FBR Finance Acts. The June-2025 budget cut the lower slabs; the
  // June-2026 budget cut four middle slabs and split the top into more bands.
  years: {
    '2026-27': {
      verified: '2026-07-01',
      sourceUrl: 'https://www.fbr.gov.pk/',
      brackets: [[0, 600000], [0.01, 1200000], [0.11, 2200000], [0.20, 3200000], [0.25, 4100000], [0.29, 5600000], [0.32, 7000000], [0.35, Infinity]],
    },
    '2025-26': {
      verified: '2026-07-01',
      sourceUrl: 'https://www.fbr.gov.pk/',
      brackets: [[0, 600000], [0.01, 1200000], [0.11, 2200000], [0.23, 3200000], [0.30, 4100000], [0.35, Infinity]],
    },
    '2024-25': {
      verified: '2026-07-01',
      sourceUrl: 'https://www.fbr.gov.pk/',
      brackets: [[0, 600000], [0.05, 1200000], [0.15, 2200000], [0.25, 3200000], [0.30, 4100000], [0.35, Infinity]],
    },
  },
};

// Serialize a year map to JSON for embedding in an inline <script>.
// JSON can't represent Infinity, so the top bracket's limit becomes null;
// the client treats null as "no upper limit".
export function taxYearsToJson(taxset) {
  return JSON.stringify(taxset.years, (k, v) => (v === Infinity ? null : v));
}
