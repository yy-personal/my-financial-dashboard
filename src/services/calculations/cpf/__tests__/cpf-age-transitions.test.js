import { getCpfRates, getAgeBracket, EMPLOYEE_TYPE } from '../cpf-utilities';
import { calculateTieredCpfInterest } from '../cpf-allocation';

describe('CPF Age Transition Tests', () => {
  describe('Age Bracket Transitions', () => {
    it('should handle age 55 transition correctly', () => {
      const age54 = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 54);
      const age55 = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 55);
      const age56 = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 56);

      // Age 54-55 should be in 55_and_below bracket
      expect(age54[0]).toBe(0.20); // 20% employee
      expect(age54[1]).toBe(0.17); // 17% employer

      // Age 55 still in 55_and_below
      expect(age55[0]).toBe(0.20);
      expect(age55[1]).toBe(0.17);

      // Age 56 should be in 55_to_60 bracket (lower rates)
      expect(age56[0]).toBe(0.15); // Reduced to 15%
      expect(age56[1]).toBe(0.15); // Reduced to 15%
    });

    it('should handle age 60 transition correctly', () => {
      const age59 = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 59);
      const age60 = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 60);
      const age61 = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 61);

      expect(age59[0]).toBe(0.15);
      expect(age60[0]).toBe(0.15);

      // Age 61 should be in 60_to_65 bracket
      expect(age61[0]).toBe(0.105); // Further reduced
      expect(age61[1]).toBe(0.095);
    });

    it('should handle age 65 transition correctly', () => {
      const age64 = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 64);
      const age65 = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 65);
      const age66 = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 66);

      expect(age64[0]).toBe(0.105);
      expect(age65[0]).toBe(0.105);

      // Age 66 should be in 65_to_70 bracket
      expect(age66[0]).toBe(0.075);
      expect(age66[1]).toBe(0.075);
    });

    it('should handle age 70 transition correctly', () => {
      const age69 = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 69);
      const age70 = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 70);
      const age71 = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 71);

      expect(age69[0]).toBe(0.075);
      expect(age70[0]).toBe(0.075);

      // Age 71 should be in above_70 bracket
      expect(age71[0]).toBe(0.05); // Minimum
      expect(age71[1]).toBe(0.05);
    });
  });

  describe('PR Age Transitions', () => {
    it('should handle PR first year age transitions', () => {
      const age54 = getCpfRates(EMPLOYEE_TYPE.PR_FIRST_YEAR, 54);
      const age56 = getCpfRates(EMPLOYEE_TYPE.PR_FIRST_YEAR, 56);

      expect(age54[0]).toBe(0.05); // Low employee rate
      expect(age54[1]).toBe(0.15); // Higher employer rate

      expect(age56[0]).toBe(0.05); // Still 5%
      expect(age56[1]).toBe(0.15); // Still 15%
    });

    it('should handle PR third year onwards same as citizens', () => {
      const citizenAge30 = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 30);
      const pr3rdAge30 = getCpfRates(EMPLOYEE_TYPE.PR_THIRD_YEAR_ONWARDS, 30);

      expect(pr3rdAge30[0]).toBe(citizenAge30[0]);
      expect(pr3rdAge30[1]).toBe(citizenAge30[1]);
    });
  });

  describe('Multi-Year Age Progression', () => {
    it('should correctly progress rates over 20 years from age 50', () => {
      const startAge = 50;
      const years = 20;
      const ages = [];

      for (let year = 0; year <= years; year++) {
        const age = startAge + year;
        const [empRate, emplRate] = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, age);

        ages.push({
          age,
          empRate,
          emplRate,
          totalRate: empRate + emplRate
        });
      }

      // Age 50 should have higher rates than age 70
      expect(ages[0].totalRate).toBeGreaterThan(ages[20].totalRate);

      // Verify key transitions occurred
      const age55Data = ages.find(a => a.age === 55);
      const age56Data = ages.find(a => a.age === 56);
      expect(age55Data.empRate).toBeGreaterThan(age56Data.empRate);

      const age60Data = ages.find(a => a.age === 60);
      const age61Data = ages.find(a => a.age === 61);
      expect(age60Data.empRate).toBeGreaterThan(age61Data.empRate);
    });

    it('should correctly handle projection from age 54 to 72', () => {
      const progression = [];

      for (let age = 54; age <= 72; age++) {
        const [empRate, emplRate] = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, age);
        progression.push({ age, empRate, emplRate });
      }

      // Should see rate decreases at key ages
      expect(progression[0].empRate).toBe(0.20); // Age 54
      expect(progression[2].empRate).toBe(0.15); // Age 56
      expect(progression[7].empRate).toBe(0.105); // Age 61
      expect(progression[12].empRate).toBe(0.075); // Age 66
      expect(progression[17].empRate).toBe(0.05); // Age 71
    });
  });

  describe('CPF Interest Rate Transitions at Age 55', () => {
    it('should provide extra interest for members above 55', () => {
      const balances = {
        OA: 20000,
        SA: 40000,
        MA: 20000,
        RA: 0
      };

      const interestAge54 = calculateTieredCpfInterest(balances, 54, 12);
      const interestAge55 = calculateTieredCpfInterest(balances, 55, 12);

      // Age 55+ gets extra 1% on first $60k
      expect(interestAge55.totalInterest).toBeGreaterThan(interestAge54.totalInterest);
      expect(interestAge55.extraInterestEligible).toBe(true);
      expect(interestAge54.extraInterestEligible).toBe(false);
    });

    it('should apply extra interest tiers correctly for age 55+', () => {
      const balances = {
        OA: 0,
        SA: 60000, // Exactly $60k to test full tier application
        MA: 0,
        RA: 0
      };

      const result = calculateTieredCpfInterest(balances, 55, 12);

      // First $30k gets extra 2% (4% + 2% = 6%)
      // Next $30k gets extra 1% (4% + 1% = 5%)
      expect(result.tier1Applied).toBe(30000);
      expect(result.tier2Applied).toBe(30000);
      expect(result.SA.effectiveRate).toBeGreaterThan(4); // Should be > base 4%
    });
  });

  describe('Age Bracket Function', () => {
    it('should return correct brackets for all age ranges', () => {
      expect(getAgeBracket(25)).toBe('55_and_below');
      expect(getAgeBracket(55)).toBe('55_and_below');
      expect(getAgeBracket(56)).toBe('55_to_60');
      expect(getAgeBracket(60)).toBe('55_to_60');
      expect(getAgeBracket(61)).toBe('60_to_65');
      expect(getAgeBracket(65)).toBe('60_to_65');
      expect(getAgeBracket(66)).toBe('65_to_70');
      expect(getAgeBracket(70)).toBe('65_to_70');
      expect(getAgeBracket(71)).toBe('above_70');
      expect(getAgeBracket(100)).toBe('above_70');
    });
  });
});