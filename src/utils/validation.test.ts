import { describe, expect, it } from 'vitest';

import type { Startup } from '@/interface/startup';
import type { User } from '@/interface/user';
import { canRequestVerification, validateStartup } from '@/utils/validation';

const draft: Partial<Startup> = {
  category: [],
  description: 'A short draft description.',
  name: 'Draft startup',
  oneLiner: 'A useful product built on Solana.',
  stage: 'Idea',
  techStack: [],
};

describe('startup validation', () => {
  it('allows incomplete verification fields when saving a draft', () => {
    expect(validateStartup(draft)).toEqual([]);
  });

  it('keeps verification requirements strict', () => {
    const owner = {
      displayName: 'Founder',
      jobTitle: 'CEO',
    } as User;

    expect(canRequestVerification(draft as Startup, owner)).toBe(false);
  });
});
