// Israeli income-tax constants per tax year. All amounts are annual NIS.
// Brackets: `limit` is the cumulative annual income ceiling of each marginal rate.
// The top 50% tier is 47% + 3% surtax (מס יסף).

const brackets = (limits) =>
  [0.1, 0.14, 0.2, 0.31, 0.35, 0.47, 0.5].map((rate, i) => ({ limit: limits[i] ?? Infinity, rate }));

const BRACKETS_2024 = brackets([84120, 120720, 193800, 269280, 560280, 721560]);

export const TAX_YEARS = {
  2020: {
    creditPoint: 2628,
    pensionCeiling: 104400,
    brackets: brackets([75960, 108960, 174960, 243240, 505920, 651600]),
    verified: true,
  },
  2021: {
    creditPoint: 2616,
    pensionCeiling: 104400,
    brackets: brackets([75480, 108360, 173880, 241680, 502920, 647640]),
    verified: true,
  },
  2022: {
    creditPoint: 2676,
    pensionCeiling: 106800,
    brackets: brackets([77400, 110880, 178080, 247440, 514920, 663240]),
    verified: true,
  },
  2023: {
    creditPoint: 2820,
    pensionCeiling: 112800,
    brackets: brackets([81480, 116760, 187440, 260520, 542160, 698280]),
    verified: true,
  },
  2024: { creditPoint: 2904, pensionCeiling: 116400, brackets: BRACKETS_2024, verified: true },
  // Brackets and credit-point value were frozen for 2025 (Arrangements Law) — same as 2024.
  2025: { creditPoint: 2904, pensionCeiling: 116400, brackets: BRACKETS_2024, verified: true },
  // Not yet checked against an official publication — the UI warns when this year is used.
  2026: { creditPoint: 2904, pensionCeiling: 116400, brackets: BRACKETS_2024, verified: false },
};

export const SUPPORTED_YEARS = Object.keys(TAX_YEARS)
  .map(Number)
  .sort((a, b) => b - a);

/** Every Israeli resident gets 2.25 points (includes the resident credit). */
export const RESIDENT_CREDIT_POINTS = 2.25;
/** Additional points for a woman. */
export const WOMAN_CREDIT_POINTS = 0.5;

export const CAPITAL_RATES = { capitalGains: 0.25, dividends: 0.25, interest: 0.15 };

/** Section 45A — employee pension contributions. */
export const PENSION = { maxIncomeRate: 0.07, creditRate: 0.35 };

/** Section 45A — life insurance premiums. */
export const LIFE_INSURANCE = { maxIncomeRate: 0.05, annualCap: 5880, creditRate: 0.25 };

/** Section 46 — donations to approved institutions. */
export const DONATIONS = { minimum: 190, maxIncomeRate: 0.3, creditRate: 0.35 };

export const REFUND_ANNUAL_INTEREST = 0.04;

/** Annual CPI averages, base 2020 = 100. 2025 is an estimate. */
export const CPI_INDEX = { 2020: 100.0, 2021: 101.5, 2022: 106.2, 2023: 110.5, 2024: 113.8, 2025: 116.5 };
