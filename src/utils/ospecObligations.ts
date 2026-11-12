/**
 * Obligaciones que deriva `ospec` según lo que toca un cambio.
 * Los identificadores de señal y obligación son los del README de ospec-workflow.
 */
export const TOUCHES = ['bug', 'api', 'migration', 'auth'] as const;
export type Touch = (typeof TOUCHES)[number];

export interface ObligationRule {
  id: string;
  signal: string;
  /** `null`: la debe cualquier cambio. */
  touch: Touch | null;
}

export const OBLIGATION_RULES: readonly ObligationRule[] = [
  { id: 'checks-pass', signal: 'always', touch: null },
  { id: 'repro-test', signal: 'bug-fix', touch: 'bug' },
  { id: 'contract-spec-and-test', signal: 'public-contract', touch: 'api' },
  { id: 'migration-compat-and-test', signal: 'persistent-data', touch: 'migration' },
  { id: 'trust-review', signal: 'security-boundary', touch: 'auth' },
];

/** Devuelve los ids de las obligaciones, en el orden de la tabla y sin repetir. */
export function deriveObligations(touches: Iterable<string>): string[] {
  const selected = new Set(touches);
  return OBLIGATION_RULES.filter((rule) => rule.touch === null || selected.has(rule.touch)).map((rule) => rule.id);
}
