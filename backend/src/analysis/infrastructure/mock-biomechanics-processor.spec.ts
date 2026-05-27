import { MockBiomechanicsProcessor } from './mock-biomechanics-processor.js';

describe('MockBiomechanicsProcessor', () => {
  let processor: MockBiomechanicsProcessor;

  beforeEach(() => {
    processor = new MockBiomechanicsProcessor();
  });

  describe('process("Demo Athlete")', () => {
    it('returns the exact spec values', () => {
      const result = processor.process('Demo Athlete');
      expect(result).toEqual({
        foot_contact: 0.32,
        foot_off: 1.08,
        turning_point: 1.22,
      });
    });

    it('trims whitespace before matching', () => {
      const result = processor.process('  Demo Athlete  ');
      expect(result).toEqual({
        foot_contact: 0.32,
        foot_off: 1.08,
        turning_point: 1.22,
      });
    });
  });

  describe('process(any other athlete)', () => {
    it('returns values within plausible biomechanics ranges', () => {
      const result = processor.process('Jane Doe');

      expect(result.foot_contact).toBeGreaterThanOrEqual(0.25);
      expect(result.foot_contact).toBeLessThanOrEqual(0.40);

      expect(result.foot_off).toBeGreaterThanOrEqual(0.95);
      expect(result.foot_off).toBeLessThanOrEqual(1.20);

      expect(result.turning_point).toBeGreaterThanOrEqual(1.10);
      expect(result.turning_point).toBeLessThanOrEqual(1.35);
    });

    it('returns finite numbers', () => {
      const result = processor.process('Someone Else');
      expect(Number.isFinite(result.foot_contact)).toBe(true);
      expect(Number.isFinite(result.foot_off)).toBe(true);
      expect(Number.isFinite(result.turning_point)).toBe(true);
    });
  });
});
