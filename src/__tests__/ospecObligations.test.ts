import { describe, expect, it } from 'vitest';
import { deriveObligations, OBLIGATION_RULES, TOUCHES } from '../utils/ospecObligations';

describe('deriveObligations', () => {
  it('debe solo checks-pass cuando el cambio no toca nada señalado', () => {
    expect(deriveObligations([])).toEqual(['checks-pass']);
  });

  it('añade la obligación de cada cosa que toca el cambio', () => {
    expect(deriveObligations(['bug'])).toEqual(['checks-pass', 'repro-test']);
    expect(deriveObligations(['auth'])).toEqual(['checks-pass', 'trust-review']);
  });

  it('mantiene el orden de la tabla sea cual sea el orden de entrada', () => {
    expect(deriveObligations(['auth', 'bug', 'migration', 'api'])).toEqual([
      'checks-pass',
      'repro-test',
      'contract-spec-and-test',
      'migration-compat-and-test',
      'trust-review',
    ]);
  });

  it('ignora lo que no conoce y no repite', () => {
    expect(deriveObligations(['bug', 'bug', 'pizza'])).toEqual(['checks-pass', 'repro-test']);
  });

  it('cada cosa seleccionable tiene exactamente una regla', () => {
    for (const touch of TOUCHES) {
      expect(OBLIGATION_RULES.filter((rule) => rule.touch === touch)).toHaveLength(1);
    }
  });
});
