// Deterministic Israeli income-tax refund calculator (employees: 106 / 867 / Bituach Leumi).
// Pure functions — no DOM, no network — so they run under `node --test` too.

import {
  CAPITAL_RATES,
  CPI_INDEX,
  DONATIONS,
  LIFE_INSURANCE,
  PENSION,
  REFUND_ANNUAL_INTEREST,
  RESIDENT_CREDIT_POINTS,
  TAX_YEARS,
} from './taxConstants.js';

/**
 * Parses a user-typed amount ("12,500", "₪ 300", "") into a number.
 * Returns { value, error } — empty input is 0, invalid/negative input is an error.
 */
export function parseAmount(raw) {
  if (raw === null || raw === undefined) return { value: 0, error: null };
  if (typeof raw === 'number') {
    return Number.isFinite(raw) && raw >= 0 ? { value: raw, error: null } : { value: 0, error: 'ערך לא תקין' };
  }
  const cleaned = String(raw).replace(/[,\s₪]/g, '');
  if (cleaned === '') return { value: 0, error: null };
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return { value: 0, error: 'יש להזין מספר' };
  if (value < 0) return { value: 0, error: 'לא ניתן להזין ערך שלילי' };
  return { value, error: null };
}

const amount = (raw) => parseAmount(raw).value;
const sumBy = (items = [], key) => items.reduce((total, item) => total + amount(item?.[key]), 0);

export function getYearConstants(year) {
  return TAX_YEARS[Number(year)] ?? null;
}

/** Progressive tax. Accumulates unrounded and rounds once at the end. */
export function calculateBracketTax(income, brackets) {
  let tax = 0;
  let previousLimit = 0;
  const details = [];

  for (const { limit, rate } of brackets) {
    if (income <= previousLimit) break;
    const taxable = Math.min(income, limit) - previousLimit;
    const bracketTax = taxable * rate;
    details.push({
      from: previousLimit,
      to: Math.min(income, limit),
      rate,
      taxable,
      tax: Math.round(bracketTax),
    });
    tax += bracketTax;
    previousLimit = limit;
  }

  const marginalRate = details.length ? details[details.length - 1].rate : 0;
  return { tax: Math.round(tax), brackets: details, marginalRate };
}

/** 35% credit on contributions up to 7% of the eligible (insured) income, capped by the yearly ceiling. */
export function calculatePensionCredit(contributions, eligibleIncome, ceiling) {
  if (contributions <= 0 || eligibleIncome <= 0) return { credit: 0, eligible: 0 };
  const maxEligible = Math.min(eligibleIncome, ceiling) * PENSION.maxIncomeRate;
  const eligible = Math.min(contributions, maxEligible);
  return { credit: Math.floor(eligible * PENSION.creditRate), eligible };
}

/** 25% credit on premiums up to min(5% of income, annual cap). */
export function calculateLifeInsuranceCredit(premiums, income) {
  if (premiums <= 0 || income <= 0) return { credit: 0, eligible: 0 };
  const ceiling = Math.min(income * LIFE_INSURANCE.maxIncomeRate, LIFE_INSURANCE.annualCap);
  const eligible = Math.min(premiums, ceiling);
  return { credit: Math.round(eligible * LIFE_INSURANCE.creditRate), eligible };
}

/** 35% credit on donations above the minimum, up to 30% of income. */
export function calculateDonationCredit(donations, income) {
  if (donations < DONATIONS.minimum || income <= 0) return { credit: 0, eligible: 0 };
  const eligible = Math.min(donations, income * DONATIONS.maxIncomeRate);
  return { credit: Math.round(eligible * DONATIONS.creditRate), eligible };
}

/**
 * 867 capital income. Capital losses offset gains first; a remaining loss offsets
 * dividends, then interest, of the same year (amount-for-amount, simplified), and the
 * rest carries forward. Each component's tax is rounded separately.
 */
export function calculateCapitalTax({ gains = 0, losses = 0, dividends = 0, interest = 0, taxWithheld = 0 } = {}) {
  const netGains = gains - losses;
  let remainingLoss = Math.max(0, -netGains);
  const taxableGains = Math.max(0, netGains);

  const dividendsOffset = Math.min(remainingLoss, dividends);
  remainingLoss -= dividendsOffset;
  const interestOffset = Math.min(remainingLoss, interest);
  remainingLoss -= interestOffset;

  const taxableDividends = dividends - dividendsOffset;
  const taxableInterest = interest - interestOffset;

  const gainsTax = Math.round(taxableGains * CAPITAL_RATES.capitalGains);
  const dividendsTax = Math.round(taxableDividends * CAPITAL_RATES.dividends);
  const interestTax = Math.round(taxableInterest * CAPITAL_RATES.interest);
  const tax = gainsTax + dividendsTax + interestTax;

  return {
    gains,
    losses,
    netGains,
    taxableGains,
    taxableDividends,
    taxableInterest,
    dividendsOffset,
    interestOffset,
    lossCarryForward: remainingLoss,
    income: taxableGains + taxableDividends + taxableInterest,
    gainsTax,
    dividendsTax,
    interestTax,
    tax,
    taxWithheld,
    balance: taxWithheld - tax,
  };
}

/**
 * Estimated CPI indexation + 4% annual interest (monthly compounding) on a refund,
 * counted from July 1st of the year after the tax year until `asOf`.
 */
export function calculateInterestAndIndexation(refund, taxYear, asOf = new Date()) {
  if (refund <= 0) {
    return { refund, indexation: 0, interest: 0, total: refund, monthsElapsed: 0, indexationFactor: 1 };
  }

  const asOfYear = asOf.getFullYear();
  const monthsElapsed = Math.max(0, (asOfYear - (taxYear + 1)) * 12 + (asOf.getMonth() + 1 - 7));
  const knownYears = Object.keys(CPI_INDEX).map(Number);
  const latestCpi = CPI_INDEX[Math.max(...knownYears)];
  const startCpi = CPI_INDEX[taxYear + 1] ?? latestCpi;
  const currentCpi = CPI_INDEX[asOfYear] ?? latestCpi;

  const indexationFactor = monthsElapsed > 0 ? Math.max(1, currentCpi / startCpi) : 1;
  const indexed = refund * indexationFactor;
  const withInterest = indexed * (1 + REFUND_ANNUAL_INTEREST / 12) ** monthsElapsed;

  return {
    refund: Math.round(refund),
    indexation: Math.round(indexed - refund),
    interest: Math.round(withInterest - indexed),
    total: Math.round(withInterest),
    monthsElapsed,
    indexationFactor: Math.round(indexationFactor * 1000) / 1000,
  };
}

/**
 * Calculates one tax year.
 *
 * input: {
 *   year, creditPoints,
 *   employers: [{ name, income (158/172), taxWithheld (042), pension (045/086), insuredIncome (244) }],
 *   bituachLeumiIncome, bituachLeumiTax, lifeInsurance, donations, otherCredits,
 *   capital: { gains, losses, dividends, interest, taxWithheld }
 * }
 */
export function calculateTaxYear(input, { asOf = new Date() } = {}) {
  const year = Number(input?.year);
  const constants = getYearConstants(year);
  if (!constants) return { year, error: `שנת המס ${input?.year ?? ''} אינה נתמכת` };

  const employers = input.employers ?? [];
  const salaryIncome = sumBy(employers, 'income');
  const salaryWithheld = sumBy(employers, 'taxWithheld');
  const pensionContributions = sumBy(employers, 'pension');
  // Pension credit base: insured income (244) when given, otherwise the salary itself.
  const pensionEligibleIncome = employers.reduce(
    (total, e) => total + (amount(e.insuredIncome) || amount(e.income)),
    0
  );

  const bituachLeumiIncome = amount(input.bituachLeumiIncome);
  const bituachLeumiTax = amount(input.bituachLeumiTax);
  const taxableIncome = salaryIncome + bituachLeumiIncome;

  const capitalInput = input.capital ?? {};
  const capital = calculateCapitalTax({
    gains: amount(capitalInput.gains),
    losses: amount(capitalInput.losses),
    dividends: amount(capitalInput.dividends),
    interest: amount(capitalInput.interest),
    taxWithheld: amount(capitalInput.taxWithheld),
  });

  const { tax: incomeTax, brackets, marginalRate } = calculateBracketTax(taxableIncome, constants.brackets);

  const rawPoints = parseAmount(input.creditPoints);
  const creditPoints = input.creditPoints === '' || input.creditPoints == null ? RESIDENT_CREDIT_POINTS : rawPoints.value;
  const pointsValue = Math.round(creditPoints * constants.creditPoint);
  const pension = calculatePensionCredit(pensionContributions, pensionEligibleIncome, constants.pensionCeiling);
  const lifeInsurance = calculateLifeInsuranceCredit(amount(input.lifeInsurance), taxableIncome);
  const donations = calculateDonationCredit(amount(input.donations), taxableIncome);
  const otherCredits = amount(input.otherCredits);
  const totalCredits = pointsValue + pension.credit + lifeInsurance.credit + donations.credit + otherCredits;

  const taxBeforeCredits = incomeTax + capital.tax;
  const taxDue = Math.max(0, taxBeforeCredits - totalCredits);
  const unusedCredits = Math.max(0, totalCredits - taxBeforeCredits);
  const totalWithheld = salaryWithheld + bituachLeumiTax + capital.taxWithheld;
  const refund = totalWithheld - taxDue;
  const interest = calculateInterestAndIndexation(refund, year, asOf);

  const warnings = [];
  if (!constants.verified) warnings.push(`ערכי המס לשנת ${year} טרם אומתו מול פרסום רשמי של רשות המסים.`);
  if (year >= asOf.getFullYear()) warnings.push(`שנת המס ${year} טרם הסתיימה — ניתן להגיש בקשה להחזר רק לאחר סיומה.`);
  if (asOf.getFullYear() - year > 6) warnings.push(`חלפו יותר מ-6 שנים מסוף שנת ${year} — ייתכן שההחזר התיישן.`);
  if (salaryWithheld > salaryIncome && salaryIncome > 0) warnings.push('המס שנוכה גבוה מההכנסה משכר — כדאי לבדוק את הנתונים.');
  if (salaryWithheld > 0 && salaryIncome === 0) warnings.push('הוזן מס שנוכה ללא הכנסה משכר.');
  const donationAmount = amount(input.donations);
  if (donationAmount > 0 && donationAmount < DONATIONS.minimum)
    warnings.push(`סך התרומות נמוך מהסף המזכה (${DONATIONS.minimum} ₪) ולכן לא חושב זיכוי.`);
  if (unusedCredits > 0) warnings.push(`זיכויים בסך ${unusedCredits.toLocaleString('he-IL')} ₪ לא נוצלו (זיכוי אינו מוחזר מעבר למס).`);
  if (capital.dividendsOffset + capital.interestOffset > 0)
    warnings.push('הפסד הון קוזז מול דיבידנד/ריבית בחישוב מפושט — מומלץ לאמת מול טופס 867.');
  if (capital.lossCarryForward > 0)
    warnings.push(`הפסד הון של ${capital.lossCarryForward.toLocaleString('he-IL')} ₪ מועבר לשנים הבאות.`);
  if (rawPoints.error) warnings.push('ערך נקודות הזיכוי אינו תקין — חושב כ-0.');

  return {
    year,
    verified: constants.verified,
    creditPointValue: constants.creditPoint,
    salaryIncome,
    bituachLeumiIncome,
    taxableIncome,
    capitalIncome: capital.income,
    totalIncome: taxableIncome + capital.income,
    incomeTax,
    marginalRate,
    brackets,
    capital,
    credits: {
      points: creditPoints,
      pointsValue,
      pension: pension.credit,
      pensionEligible: pension.eligible,
      lifeInsurance: lifeInsurance.credit,
      donations: donations.credit,
      other: otherCredits,
      total: totalCredits,
    },
    taxBeforeCredits,
    taxDue,
    unusedCredits,
    withheld: {
      salary: salaryWithheld,
      bituachLeumi: bituachLeumiTax,
      capital: capital.taxWithheld,
      total: totalWithheld,
    },
    refund,
    interest,
    warnings,
  };
}

/** Calculates every year and sums them. Results are sorted newest first. */
export function calculateAllYears(inputs = [], options) {
  const years = inputs.map((input) => calculateTaxYear(input, options)).sort((a, b) => b.year - a.year);
  const valid = years.filter((y) => !y.error);
  return {
    years,
    totals: {
      refund: valid.reduce((s, y) => s + y.refund, 0),
      withInterest: valid.reduce((s, y) => s + y.interest.total, 0),
    },
  };
}
