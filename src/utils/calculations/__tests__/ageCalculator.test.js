import {
  calculateAge,
  calculateAgeAt,
  calculateAgeProgression,
  getCpfAgeBracket,
  checkCpfBracketCrossing,
  formatAge
} from '../ageCalculator';

describe('Age Calculator Utilities', () => {
  describe('calculateAge', () => {
    it('should calculate correct age when birthday has passed this year', () => {
      const birthday = { month: 1, year: 1990 }; // January 1990
      const referenceDate = new Date(2025, 5, 15); // June 15, 2025

      const age = calculateAge(birthday, referenceDate);

      expect(age).toBe(35);
    });

    it('should calculate correct age when birthday has not passed this year', () => {
      const birthday = { month: 12, year: 1990 }; // December 1990
      const referenceDate = new Date(2025, 5, 15); // June 15, 2025

      const age = calculateAge(birthday, referenceDate);

      expect(age).toBe(34);
    });

    it('should handle birthday in current month before the 15th', () => {
      const birthday = { month: 6, year: 1990 }; // June 1990
      const referenceDate = new Date(2025, 5, 10); // June 10, 2025 (before 15th)

      const age = calculateAge(birthday, referenceDate);

      expect(age).toBe(34); // Birthday hasn't occurred yet
    });

    it('should handle birthday in current month after the 15th', () => {
      const birthday = { month: 6, year: 1990 }; // June 1990
      const referenceDate = new Date(2025, 5, 20); // June 20, 2025 (after 15th)

      const age = calculateAge(birthday, referenceDate);

      expect(age).toBe(35); // Birthday has occurred
    });

    it('should use current date when no reference date provided', () => {
      const birthday = { month: 1, year: 2000 };

      const age = calculateAge(birthday);

      expect(age).toBeGreaterThan(20);
      expect(age).toBeLessThan(30);
    });

    it('should return null for invalid birthday objects', () => {
      expect(calculateAge(null)).toBeNull();
      expect(calculateAge(undefined)).toBeNull();
      expect(calculateAge({})).toBeNull();
      expect(calculateAge({ month: 'January', year: 1990 })).toBeNull();
    });
  });

  describe('calculateAgeAt', () => {
    it('should calculate correct age at specific future date', () => {
      const birthday = { month: 9, year: 1996 }; // September 1996
      const targetYear = 2030;
      const targetMonth = 12; // December

      const age = calculateAgeAt(birthday, targetYear, targetMonth);

      expect(age).toBe(34);
    });

    it('should calculate age when target month is before birth month', () => {
      const birthday = { month: 9, year: 1996 }; // September 1996
      const targetYear = 2030;
      const targetMonth = 6; // June (before September)

      const age = calculateAgeAt(birthday, targetYear, targetMonth);

      expect(age).toBe(33); // Birthday hasn't occurred yet in 2030
    });

    it('should calculate age when target month is after birth month', () => {
      const birthday = { month: 9, year: 1996 }; // September 1996
      const targetYear = 2030;
      const targetMonth = 11; // November (after September)

      const age = calculateAgeAt(birthday, targetYear, targetMonth);

      expect(age).toBe(34); // Birthday has occurred in 2030
    });

    it('should return null for invalid inputs', () => {
      const birthday = { month: 9, year: 1996 };

      expect(calculateAgeAt(null, 2030, 12)).toBeNull();
      expect(calculateAgeAt(birthday, null, 12)).toBeNull();
      expect(calculateAgeAt(birthday, 2030, null)).toBeNull();
    });
  });

  describe('calculateAgeProgression', () => {
    it('should calculate age progression over multiple months', () => {
      const birthday = { month: 6, year: 1990 }; // June 1990
      const startYear = 2025;
      const startMonth = 1; // January
      const totalMonths = 24; // 2 years

      const progression = calculateAgeProgression(birthday, startYear, startMonth, totalMonths);

      expect(progression).toHaveLength(24);
      expect(progression[0].age).toBe(34); // January 2025
      expect(progression[5].age).toBe(35); // June 2025 (birthday month)
      expect(progression[23].age).toBe(36); // December 2026
    });

    it('should handle year transitions correctly', () => {
      const birthday = { month: 3, year: 1985 }; // March 1985
      const startYear = 2025;
      const startMonth = 11; // November
      const totalMonths = 6;

      const progression = calculateAgeProgression(birthday, startYear, startMonth, totalMonths);

      expect(progression[0].age).toBe(40); // November 2025
      expect(progression[1].age).toBe(40); // December 2025
      expect(progression[2].age).toBe(40); // January 2026
      expect(progression[4].age).toBe(41); // March 2026 (birthday)
    });

    it('should return empty array for invalid birthday', () => {
      const progression = calculateAgeProgression(null, 2025, 1, 12);

      expect(progression).toEqual([]);
    });

    it('should include correct metadata for each month', () => {
      const birthday = { month: 1, year: 2000 };
      const progression = calculateAgeProgression(birthday, 2025, 1, 3);

      expect(progression[0]).toHaveProperty('month', 0);
      expect(progression[0]).toHaveProperty('age');
      expect(progression[0]).toHaveProperty('year', 2025);
      expect(progression[0]).toHaveProperty('monthIndex', 1);
    });
  });

  describe('getCpfAgeBracket', () => {
    it('should return correct bracket for each age range', () => {
      expect(getCpfAgeBracket(25)).toBe('55_and_below');
      expect(getCpfAgeBracket(55)).toBe('55_and_below');
      expect(getCpfAgeBracket(56)).toBe('55_to_60');
      expect(getCpfAgeBracket(60)).toBe('55_to_60');
      expect(getCpfAgeBracket(61)).toBe('60_to_65');
      expect(getCpfAgeBracket(65)).toBe('60_to_65');
      expect(getCpfAgeBracket(66)).toBe('65_to_70');
      expect(getCpfAgeBracket(70)).toBe('65_to_70');
      expect(getCpfAgeBracket(71)).toBe('above_70');
      expect(getCpfAgeBracket(80)).toBe('above_70');
    });

    it('should handle boundary ages correctly', () => {
      const boundaries = [55, 60, 65, 70];
      const expectedBrackets = ['55_and_below', '55_to_60', '60_to_65', '65_to_70'];

      boundaries.forEach((age, index) => {
        expect(getCpfAgeBracket(age)).toBe(expectedBrackets[index]);
      });
    });
  });

  describe('checkCpfBracketCrossing', () => {
    it('should detect when crossing a single CPF bracket boundary', () => {
      const currentAge = 53;
      const projectionYears = 5; // Will cross 55

      const result = checkCpfBracketCrossing(currentAge, projectionYears);

      expect(result.crossesBoundary).toBe(true);
      expect(result.currentBracket).toBe('55_and_below');
      expect(result.futureBracket).toBe('55_to_60');
      expect(result.crossedBoundaries).toContain(55);
      expect(result.affectsCpfRates).toBe(true);
    });

    it('should detect when crossing multiple CPF bracket boundaries', () => {
      const currentAge = 58;
      const projectionYears = 10; // Will cross 60 and 65

      const result = checkCpfBracketCrossing(currentAge, projectionYears);

      expect(result.crossesBoundary).toBe(true);
      expect(result.crossedBoundaries).toHaveLength(2);
      expect(result.crossedBoundaries).toContain(60);
      expect(result.crossedBoundaries).toContain(65);
    });

    it('should not detect crossing when staying in same bracket', () => {
      const currentAge = 30;
      const projectionYears = 10; // Stays in 55_and_below

      const result = checkCpfBracketCrossing(currentAge, projectionYears);

      expect(result.crossesBoundary).toBe(false);
      expect(result.currentBracket).toBe(result.futureBracket);
      expect(result.crossedBoundaries).toHaveLength(0);
      expect(result.affectsCpfRates).toBe(false);
    });

    it('should handle projection to above 70', () => {
      const currentAge = 68;
      const projectionYears = 5;

      const result = checkCpfBracketCrossing(currentAge, projectionYears);

      expect(result.crossesBoundary).toBe(true);
      expect(result.futureBracket).toBe('above_70');
      expect(result.crossedBoundaries).toContain(70);
    });
  });

  describe('formatAge', () => {
    it('should format age correctly for single year', () => {
      expect(formatAge(1)).toBe('1 year old');
    });

    it('should format age correctly for multiple years', () => {
      expect(formatAge(25)).toBe('25 years old');
      expect(formatAge(60)).toBe('60 years old');
    });

    it('should handle zero age', () => {
      expect(formatAge(0)).toBe('0 years old');
    });

    it('should return N/A for null or undefined', () => {
      expect(formatAge(null)).toBe('N/A');
      expect(formatAge(undefined)).toBe('N/A');
    });

    it('should return Invalid for negative age', () => {
      expect(formatAge(-5)).toBe('Invalid');
    });

    it('should return N/A for non-number input', () => {
      expect(formatAge('25')).toBe('N/A');
      expect(formatAge({})).toBe('N/A');
    });
  });

  describe('Integration scenarios', () => {
    it('should correctly calculate age progression with CPF bracket crossings', () => {
      const birthday = { month: 1, year: 1970 }; // Born January 1970
      const startYear = 2025; // Age 55
      const startMonth = 1;
      const totalMonths = 120; // 10 years

      const progression = calculateAgeProgression(birthday, startYear, startMonth, totalMonths);
      const bracketCrossing = checkCpfBracketCrossing(55, 10);

      expect(progression[0].age).toBe(55);
      expect(progression[119].age).toBe(64);
      expect(bracketCrossing.crossesBoundary).toBe(true);
      expect(bracketCrossing.crossedBoundaries).toContain(60);
    });

    it('should handle Singapore CPF retirement age scenarios', () => {
      // Scenario: Person born in 1966, planning for retirement
      const birthday = { month: 7, year: 1966 };
      const currentYear = 2025;
      const retirementAge = 65;

      const currentAge = calculateAgeAt(birthday, currentYear, 1);
      const yearsToRetirement = retirementAge - currentAge;
      const bracketInfo = checkCpfBracketCrossing(currentAge, yearsToRetirement);

      expect(currentAge).toBe(58);
      expect(bracketInfo.crossedBoundaries).toContain(60);
      expect(bracketInfo.crossedBoundaries).toContain(65);
      expect(bracketInfo.affectsCpfRates).toBe(true);
    });
  });
});
