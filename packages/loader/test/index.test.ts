import { describe, expect, it } from 'vitest';
import { VERSION } from '../src/index.js';

describe('VERSION', () => {
  it('exports the scaffold placeholder', () => {
    expect(VERSION).toBe('0.0.0');
  });
});
