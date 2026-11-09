import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import { Input } from '@components/ui';
import { RESIDENT_CREDIT_POINTS, TAX_YEARS, WOMAN_CREDIT_POINTS } from '../../utils/tax/taxConstants';
import { formatCurrency } from '../../utils/tax/format';
import { FieldLabel, IconButton, Muted, Row, Select } from '../styles';
import AmountField from './AmountField';

const Fieldset = styled.fieldset`
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Legend = styled.legend`
  padding: 0 8px;
  font-weight: 700;
  font-size: 16px;
`;

const Fields = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
`;

const EmployerCard = styled.div`
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.offWhite};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EmployerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 700;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EMPLOYER_FIELDS = [
  { key: 'income', label: 'הכנסה ממשכורת (158/172)' },
  { key: 'taxWithheld', label: 'מס שנוכה (042)' },
  { key: 'pension', label: 'הפקדות עובד לקצבה (045/086)' },
  { key: 'insuredIncome', label: 'הכנסה מבוטחת (244)', hint: 'ריק = לפי המשכורת' },
];

const CAPITAL_FIELDS = [
  { key: 'gains', label: 'רווח הון ברוטו' },
  { key: 'losses', label: 'הפסדי הון לקיזוז' },
  { key: 'dividends', label: 'דיבידנד' },
  { key: 'interest', label: 'ריבית' },
  { key: 'taxWithheld', label: 'מס שנוכה ב-867' },
];

const EmployerFields = memo(function EmployerFields({ yearId, employer, index, canRemove, dispatch }) {
  const setters = useMemo(
    () =>
      Object.fromEntries(
        ['name', ...EMPLOYER_FIELDS.map((f) => f.key)].map((field) => [
          field,
          (value) => dispatch({ type: 'setEmployerField', yearId, employerId: employer.id, field, value }),
        ])
      ),
    [dispatch, yearId, employer.id]
  );
  const handleName = useCallback((event) => setters.name(event.target.value), [setters]);
  const handleRemove = useCallback(
    () => dispatch({ type: 'removeEmployer', yearId, employerId: employer.id }),
    [dispatch, yearId, employer.id]
  );
  const prefix = `tax-${yearId}-${employer.id}`;

  return (
    <EmployerCard role="group" aria-labelledby={`${prefix}-title`}>
      <EmployerHeader>
        <span id={`${prefix}-title`}>טופס 106 #{index + 1}</span>
        {canRemove && (
          <IconButton
            id={`${prefix}-remove`}
            type="button"
            $danger
            onClick={handleRemove}
            aria-label={`הסרת טופס 106 מספר ${index + 1}`}
          >
            הסרה
            <HiOutlineTrash aria-hidden="true" />
          </IconButton>
        )}
      </EmployerHeader>
      <Input
        id={`${prefix}-name`}
        label="שם המעסיק"
        value={employer.name}
        onChange={handleName}
        autoComplete="off"
        noMargin
      />
      <Fields>
        {EMPLOYER_FIELDS.map(({ key, label, hint }) => (
          <AmountField
            key={key}
            id={`${prefix}-${key}`}
            label={label}
            hint={hint}
            value={employer[key]}
            onChange={setters[key]}
          />
        ))}
      </Fields>
    </EmployerCard>
  );
});

function TaxYearForm({ yearInput, usedYears, dispatch }) {
  const { id: yearId } = yearInput;
  const prefix = `tax-${yearId}`;
  const pointValue = TAX_YEARS[yearInput.year]?.creditPoint ?? 0;

  const setters = useMemo(() => {
    const make = (type, field) => (value) => dispatch({ type, yearId, field, value });
    return {
      creditPoints: make('setField', 'creditPoints'),
      bituachLeumiIncome: make('setField', 'bituachLeumiIncome'),
      bituachLeumiTax: make('setField', 'bituachLeumiTax'),
      lifeInsurance: make('setField', 'lifeInsurance'),
      donations: make('setField', 'donations'),
      otherCredits: make('setField', 'otherCredits'),
      ...Object.fromEntries(CAPITAL_FIELDS.map(({ key }) => [`capital.${key}`, make('setCapitalField', key)])),
    };
  }, [dispatch, yearId]);

  const handleYear = useCallback(
    (event) => dispatch({ type: 'setField', yearId, field: 'year', value: Number(event.target.value) }),
    [dispatch, yearId]
  );
  const addEmployer = useCallback(() => dispatch({ type: 'addEmployer', yearId }), [dispatch, yearId]);
  const setMalePoints = useCallback(() => setters.creditPoints(String(RESIDENT_CREDIT_POINTS)), [setters]);
  const setFemalePoints = useCallback(
    () => setters.creditPoints(String(RESIDENT_CREDIT_POINTS + WOMAN_CREDIT_POINTS)),
    [setters]
  );

  return (
    <Stack>
      <Fieldset>
        <Legend>שנת מס ונקודות זיכוי</Legend>
        <Fields>
          <div>
            <FieldLabel htmlFor={`${prefix}-year`}>שנת מס</FieldLabel>
            <Select id={`${prefix}-year`} value={yearInput.year} onChange={handleYear}>
              {Object.keys(TAX_YEARS)
                .map(Number)
                .sort((a, b) => b - a)
                .map((y) => (
                  <option key={y} value={y} disabled={y !== yearInput.year && usedYears.includes(y)}>
                    {y}
                    {TAX_YEARS[y].verified ? '' : ' (לא מאומת)'}
                  </option>
                ))}
            </Select>
          </div>
          <AmountField
            id={`${prefix}-points`}
            label="נקודות זיכוי"
            hint={`ערך נקודה: ${formatCurrency(pointValue)} לשנה`}
            value={yearInput.creditPoints}
            onChange={setters.creditPoints}
            placeholder={String(RESIDENT_CREDIT_POINTS)}
          />
        </Fields>
        <Row role="group" aria-label="ערכי ברירת מחדל לנקודות זיכוי">
          <IconButton id={`${prefix}-points-male`} type="button" onClick={setMalePoints}>
            תושב — {RESIDENT_CREDIT_POINTS}
          </IconButton>
          <IconButton id={`${prefix}-points-female`} type="button" onClick={setFemalePoints}>
            תושבת — {RESIDENT_CREDIT_POINTS + WOMAN_CREDIT_POINTS}
          </IconButton>
        </Row>
        <Muted>נקודות נוספות (ילדים, תואר, שחרור משירות, עולה חדש וכו׳) יש להוסיף ידנית לסכום.</Muted>
      </Fieldset>

      <Fieldset>
        <Legend>הכנסות משכר (טופסי 106)</Legend>
        {yearInput.employers.map((employer, index) => (
          <EmployerFields
            key={employer.id}
            yearId={yearId}
            employer={employer}
            index={index}
            canRemove={yearInput.employers.length > 1}
            dispatch={dispatch}
          />
        ))}
        <Row>
          <IconButton id={`${prefix}-add-employer`} type="button" onClick={addEmployer}>
            הוספת מעסיק
            <HiOutlinePlus aria-hidden="true" />
          </IconButton>
        </Row>
      </Fieldset>

      <Fieldset>
        <Legend>ביטוח לאומי (אבטלה, מילואים, לידה)</Legend>
        <Fields>
          <AmountField
            id={`${prefix}-bl-income`}
            label="הכנסה ברוטו"
            value={yearInput.bituachLeumiIncome}
            onChange={setters.bituachLeumiIncome}
          />
          <AmountField
            id={`${prefix}-bl-tax`}
            label="מס הכנסה שנוכה"
            value={yearInput.bituachLeumiTax}
            onChange={setters.bituachLeumiTax}
          />
        </Fields>
      </Fieldset>

      <Fieldset>
        <Legend>זיכויים נוספים</Legend>
        <Fields>
          <AmountField
            id={`${prefix}-life`}
            label="ביטוח חיים פרטי"
            hint="זיכוי 25%"
            value={yearInput.lifeInsurance}
            onChange={setters.lifeInsurance}
          />
          <AmountField
            id={`${prefix}-donations`}
            label="תרומות (סעיף 46)"
            hint="זיכוי 35%"
            value={yearInput.donations}
            onChange={setters.donations}
          />
          <AmountField
            id={`${prefix}-other`}
            label="זיכויים אחרים בש״ח"
            value={yearInput.otherCredits}
            onChange={setters.otherCredits}
          />
        </Fields>
      </Fieldset>

      <Fieldset>
        <Legend>שוק ההון (טופס 867)</Legend>
        <Fields>
          {CAPITAL_FIELDS.map(({ key, label }) => (
            <AmountField
              key={key}
              id={`${prefix}-capital-${key}`}
              label={label}
              value={yearInput.capital[key]}
              onChange={setters[`capital.${key}`]}
            />
          ))}
        </Fields>
      </Fieldset>
    </Stack>
  );
}

export default memo(TaxYearForm);
