import { RESIDENT_CREDIT_POINTS, SUPPORTED_YEARS } from '../../utils/tax/taxConstants';

let sequence = 0;
const uid = (prefix) => `${prefix}-${(sequence += 1)}`;

export const createEmployer = () => ({
  id: uid('employer'),
  name: '',
  income: '',
  taxWithheld: '',
  pension: '',
  insuredIncome: '',
});

export const createYear = (year) => ({
  id: uid('year'),
  year,
  creditPoints: String(RESIDENT_CREDIT_POINTS),
  employers: [createEmployer()],
  bituachLeumiIncome: '',
  bituachLeumiTax: '',
  lifeInsurance: '',
  donations: '',
  otherCredits: '',
  capital: { gains: '', losses: '', dividends: '', interest: '', taxWithheld: '' },
});

const EMPLOYER_VALUE_KEYS = ['name', 'income', 'taxWithheld', 'pension', 'insuredIncome'];
export const isBlankEmployer = (employer) => EMPLOYER_VALUE_KEYS.every((key) => !String(employer[key] ?? '').trim());

/** Latest tax year that already ended and is supported. */
export function defaultYear(now = new Date()) {
  return SUPPORTED_YEARS.find((y) => y < now.getFullYear()) ?? SUPPORTED_YEARS[0];
}

export function initialState() {
  const year = createYear(defaultYear());
  return { years: [year], activeId: year.id };
}

const mapYear = (state, yearId, update) => ({
  ...state,
  years: state.years.map((y) => (y.id === yearId ? update(y) : y)),
});

export function taxCalculatorReducer(state, action) {
  switch (action.type) {
    case 'addYear': {
      const year = createYear(action.year);
      return { years: [...state.years, year], activeId: year.id };
    }
    case 'removeYear': {
      const years = state.years.filter((y) => y.id !== action.yearId);
      if (!years.length) return initialState();
      const activeId = state.activeId === action.yearId ? years[0].id : state.activeId;
      return { years, activeId };
    }
    case 'selectYear':
      return { ...state, activeId: action.yearId };
    case 'setField':
      return mapYear(state, action.yearId, (y) => ({ ...y, [action.field]: action.value }));
    case 'setCapitalField':
      return mapYear(state, action.yearId, (y) => ({
        ...y,
        capital: { ...y.capital, [action.field]: action.value },
      }));
    case 'addEmployer':
      return mapYear(state, action.yearId, (y) => ({ ...y, employers: [...y.employers, createEmployer()] }));
    case 'removeEmployer':
      return mapYear(state, action.yearId, (y) => ({
        ...y,
        employers: y.employers.filter((e) => e.id !== action.employerId),
      }));
    case 'setEmployerField':
      return mapYear(state, action.yearId, (y) => ({
        ...y,
        employers: y.employers.map((e) => (e.id === action.employerId ? { ...e, [action.field]: action.value } : e)),
      }));
    case 'importEmployer': {
      // action: { year, employer: { name, income, ... }, lifeInsurance, donations }
      const employer = { ...createEmployer(), ...action.employer };
      const existing = state.years.find((y) => y.year === action.year);
      const addAmount = (current, extra) => (extra ? String((Number(current) || 0) + extra) : current);
      const merge = (y) => ({
        ...y,
        // Replace the blank placeholder row the year starts with.
        employers: [...y.employers.filter((e) => !isBlankEmployer(e)), employer],
        lifeInsurance: addAmount(y.lifeInsurance, action.lifeInsurance),
        donations: addAmount(y.donations, action.donations),
      });
      if (existing) return { ...mapYear(state, existing.id, merge), activeId: existing.id };
      const year = merge(createYear(action.year));
      return { years: [...state.years, year], activeId: year.id };
    }
    case 'reset':
      return initialState();
    default:
      return state;
  }
}
