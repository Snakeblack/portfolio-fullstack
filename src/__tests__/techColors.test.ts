import { describe, it, expect } from 'vitest';
import { hexToRgba, techColorMap } from '../utils/techColors';

describe('techColors module', () => {
  describe('hexToRgba', () => {
    it('should convert 6-char hex to rgba', () => {
      expect(hexToRgba('#E34F26', 0.7)).toBe('rgba(227, 79, 38, 0.7)');
    });

    it('should convert 3-char hex to rgba', () => {
      expect(hexToRgba('#F00', 1)).toBe('rgba(255, 0, 0, 1)');
    });

    it('should return rgba(0,0,0,0) for invalid hex', () => {
      expect(hexToRgba('invalid', 1)).toBe('rgba(0,0,0,0)');
    });

    it('should default alpha to 1', () => {
      expect(hexToRgba('#3178C6')).toBe('rgba(49, 120, 198, 1)');
    });
  });

  describe('techColorMap', () => {
    it('should have a default key', () => {
      expect(techColorMap).toHaveProperty('default');
    });

    it('should have Angular key', () => {
      expect(techColorMap).toHaveProperty('Angular');
    });

    it('should have .NET key', () => {
      expect(techColorMap).toHaveProperty('.NET');
    });

    it('should have Oracle SQL key (from SkillsSection)', () => {
      expect(techColorMap).toHaveProperty('Oracle SQL');
    });

    it('should have PL/SQL key (from SkillsSection)', () => {
      expect(techColorMap).toHaveProperty('PL/SQL');
    });

    it('should have C# key (from SkillsSection)', () => {
      expect(techColorMap).toHaveProperty('C#');
    });

    it('should have Figma key (from SkillsSection)', () => {
      expect(techColorMap).toHaveProperty('Figma');
    });

    it('should have Vercel key (from ProjectsSection)', () => {
      expect(techColorMap).toHaveProperty('Vercel');
    });

    it('should have Three.js key (from ProjectsSection)', () => {
      expect(techColorMap).toHaveProperty('Three.js');
    });

    it('should have Mdx key (from ProjectsSection)', () => {
      expect(techColorMap).toHaveProperty('Mdx');
    });
  });
});
