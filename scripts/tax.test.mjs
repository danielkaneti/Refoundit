import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateAllYears,
  calculateBracketTax,
  calculateCapitalTax,
  calculateDonationCredit,
  calculateInterestAndIndexation,
  calculateLifeInsuranceCredit,
  calculatePensionCredit,
  calculateTaxYear,
  getYearConstants,
  parseAmount,
} from '../src/pages/admin/utils/tax/taxEngine.js';
import { SUPPORTED_YEARS, TAX_YEARS } from '../src/pages/admin/utils/tax/taxConstants.js';

const AS_OF = new Date(2026, 10, 8); // 2026-11-08
const brackets2024 = TAX_YEARS[2024].brackets;
const brackets2021 = TAX_YEARS[2021].brackets;

const year = (overrides = {}) => ({
  year: 2024,
  creditPoints: '2.25',
  employers: [{ income: 300000, taxWithheld: 60000, pension: 15000 }],
  ...overrides,
});

test('bracket tables match published monthly limits × 12', () => {
  const monthly = {
    2020: [6330, 9080, 14580, 20270, 42160, 54300],
    2021: [6290, 9030, 14490, 20140, 41910, 53970],
    2022: [6450, 9240, 14840, 20620, 42910, 55270],
    2023: [6790, 9730, 15620, 21710, 45180, 58190],
    2024: [7010, 10060, 16150, 22440, 46690, 60130],
    2025: [7010, 10060, 16150, 22440, 46690, 60130],
  };
  for (const [y, limits] of Object.entries(monthly)) {
    const actual = TAX_YEARS[y].brackets.slice(0, 6).map((b) => b.limit);
    assert.deepEqual(actual, limits.map((m) => m * 12), `year ${y}`);
    assert.equal(TAX_YEARS[y].brackets.at(-1).limit, Infinity);
  }
});

test('credit point values (monthly × 12)', () => {
  const monthly = { 2020: 219, 2021: 218, 2022: 223, 2023: 235, 2024: 242, 2025: 242 };
  for (const [y, m] of Object.entries(monthly)) assert.equal(TAX_YEARS[y].creditPoint, m * 12, `year ${y}`);
});

test('unsupported year is an error, not a silent fallback', () => {
  assert.equal(getYearConstants(2019), null);
  assert.match(calculateTaxYear(year({ year: 2019 })).error, /אינה נתמכת/);
  assert.deepEqual(SUPPORTED_YEARS.slice(-1), [2020]);
});

test('parseAmount', () => {
  assert.deepEqual(parseAmount('12,500'), { value: 12500, error: null });
  assert.deepEqual(parseAmount('₪ 300'), { value: 300, error: null });
  assert.deepEqual(parseAmount(''), { value: 0, error: null });
  assert.equal(parseAmount('abc').error, 'יש להזין מספר');
  assert.equal(parseAmount('-5').error, 'לא ניתן להזין ערך שלילי');
});

test('bracket tax boundaries (2024)', () => {
  assert.equal(calculateBracketTax(0, brackets2024).tax, 0);
  assert.equal(calculateBracketTax(-100, brackets2024).tax, 0);
  assert.equal(calculateBracketTax(84120, brackets2024).tax, 8412);
  assert.equal(calculateBracketTax(84121, brackets2024).tax, 8412);
  assert.equal(calculateBracketTax(300000, brackets2024).tax, 62303);
  assert.equal(calculateBracketTax(300000, brackets2024).marginalRate, 0.35);
  // top bracket: 47% tier + 50% above 721,560
  const top = calculateBracketTax(800000, brackets2024);
  assert.equal(top.brackets.length, 7);
  assert.equal(top.brackets.at(-1).taxable, 800000 - 721560);
});

test('pension credit — floor rounding and ceilings', () => {
  assert.equal(calculatePensionCredit(0, 100000, 116400).credit, 0);
  assert.equal(calculatePensionCredit(371, 95880, 104400).credit, 129); // 129.85 → 129
  assert.equal(calculatePensionCredit(15000, 300000, 116400).credit, 2851);
  assert.equal(calculatePensionCredit(15000, 50000, 116400).credit, 1225); // 7% of 50,000
});

test('life insurance and donation credits', () => {
  assert.equal(calculateLifeInsuranceCredit(10000, 100000).credit, 1250);
  assert.equal(calculateLifeInsuranceCredit(10000, 500000).credit, 1470); // cap 5,880
  assert.equal(calculateDonationCredit(100, 100000).credit, 0);
  assert.equal(calculateDonationCredit(1000, 100000).credit, 350);
  assert.equal(calculateDonationCredit(50000, 100000).credit, 10500); // 30% of income
});

test('TC-A1 — single 106, 2024', () => {
  const r = calculateTaxYear(year(), { asOf: AS_OF });
  assert.equal(r.incomeTax, 62303);
  assert.equal(r.credits.pointsValue, 6534);
  assert.equal(r.credits.pension, 2851);
  assert.equal(r.credits.total, 9385);
  assert.equal(r.taxDue, 52918);
  assert.equal(r.refund, 7082);
});

test('TC-A2 — empty input', () => {
  const r = calculateTaxYear({ year: 2024, creditPoints: 0, employers: [] }, { asOf: AS_OF });
  assert.equal(r.taxDue, 0);
  assert.equal(r.refund, 0);
  assert.equal(r.interest.total, 0);
});

test('empty credit points default to 2.25', () => {
  const r = calculateTaxYear(year({ creditPoints: '' }), { asOf: AS_OF });
  assert.equal(r.credits.points, 2.25);
});

test('multiple employers are summed', () => {
  const r = calculateTaxYear(
    year({
      employers: [
        { income: 200000, taxWithheld: 30000, pension: 10000 },
        { income: 100000, taxWithheld: 30000, pension: 5000 },
      ],
    }),
    { asOf: AS_OF }
  );
  assert.equal(r.salaryIncome, 300000);
  assert.equal(r.refund, 7082);
});

test('pension credit uses insured income (244) when given', () => {
  const r = calculateTaxYear(
    year({ employers: [{ income: 300000, taxWithheld: 60000, pension: 15000, insuredIncome: 100000 }] }),
    { asOf: AS_OF }
  );
  assert.equal(r.credits.pension, Math.floor(7000 * 0.35));
});

test('TC-A7 — 867 with capital losses', () => {
  const c = calculateCapitalTax({ gains: 218553, losses: 12506, dividends: 2558, taxWithheld: 52151 });
  assert.equal(c.netGains, 206047);
  assert.equal(c.gainsTax, 51512);
  assert.equal(c.dividendsTax, 640);
  assert.equal(c.tax, 52152);
  assert.equal(c.balance, -1);
});

test('TC-A8 — 106 + 867 combined', () => {
  const r = calculateTaxYear(
    year({ capital: { gains: 218553, losses: 12506, dividends: 2558, taxWithheld: 52151 } }),
    { asOf: AS_OF }
  );
  assert.equal(r.taxBeforeCredits, 114455);
  assert.equal(r.taxDue, 105070);
  assert.equal(r.withheld.total, 112151);
  assert.equal(r.refund, 7081);
});

test('capital loss larger than gains offsets dividends, then interest, then carries forward', () => {
  const c = calculateCapitalTax({ gains: 1000, losses: 5000, dividends: 3000, interest: 2000 });
  assert.equal(c.taxableGains, 0);
  assert.equal(c.dividendsOffset, 3000);
  assert.equal(c.interestOffset, 1000);
  assert.equal(c.taxableInterest, 1000);
  assert.equal(c.lossCarryForward, 0);
  assert.equal(c.tax, 150);

  const big = calculateCapitalTax({ gains: 0, losses: 10000, dividends: 1000 });
  assert.equal(big.lossCarryForward, 9000);
  assert.equal(big.tax, 0);
});

test('TC-A11 — Bituach Leumi income produces a debt', () => {
  const r = calculateTaxYear(
    year({
      employers: [{ income: 100000, taxWithheld: 10000 }],
      bituachLeumiIncome: 50000,
      bituachLeumiTax: 2000,
    }),
    { asOf: AS_OF }
  );
  assert.equal(r.taxableIncome, 150000);
  assert.equal(r.incomeTax, 19392);
  assert.equal(r.taxDue, 12858);
  assert.equal(r.refund, -858);
  assert.equal(r.interest.interest, 0);
});

test('TC-B2 — 2021 manual reference case matches the tax authority (1,330)', () => {
  const r = calculateTaxYear(
    { year: 2021, creditPoints: 2.25, employers: [{ income: 95880, taxWithheld: 5719, pension: 371 }] },
    { asOf: AS_OF }
  );
  assert.equal(r.incomeTax, 10404);
  assert.equal(r.taxDue, 4389);
  assert.equal(r.refund, 1330);
});

test('unused credits are reported, not refunded', () => {
  const r = calculateTaxYear(
    { year: 2024, creditPoints: 2.75, employers: [{ income: 50000, taxWithheld: 3000 }] },
    { asOf: AS_OF }
  );
  assert.equal(r.taxDue, 0);
  assert.equal(r.refund, 3000);
  assert.ok(r.unusedCredits > 0);
  assert.ok(r.warnings.some((w) => w.includes('לא נוצלו')));
});

test('TC-A12 — interest and indexation are deterministic for a given date', () => {
  const i = calculateInterestAndIndexation(7082, 2024, AS_OF);
  assert.equal(i.monthsElapsed, 16);
  assert.equal(i.indexationFactor, 1);
  assert.equal(i.indexation, 0);
  assert.equal(i.total, Math.round(7082 * (1 + 0.04 / 12) ** 16));
  assert.equal(i.interest, i.total - 7082);

  const older = calculateInterestAndIndexation(1000, 2021, AS_OF);
  assert.ok(older.indexationFactor > 1);
  assert.ok(older.indexation > 0);
});

test('warnings: unverified year, open year, limitation period', () => {
  const open = calculateTaxYear(year({ year: 2026 }), { asOf: AS_OF });
  assert.ok(open.warnings.some((w) => w.includes('טרם אומתו')));
  assert.ok(open.warnings.some((w) => w.includes('טרם הסתיימה')));
  const old = calculateTaxYear(year({ year: 2020 }), { asOf: new Date(2027, 5, 1) });
  assert.ok(old.warnings.some((w) => w.includes('התיישן')));
});

test('calculateAllYears sorts newest first and totals valid years', () => {
  const { years, totals } = calculateAllYears(
    [year({ year: 2022 }), year(), { year: 2019, employers: [] }],
    { asOf: AS_OF }
  );
  assert.deepEqual(years.map((y) => y.year), [2024, 2022, 2019]);
  assert.equal(totals.refund, years[0].refund + years[1].refund);
});
