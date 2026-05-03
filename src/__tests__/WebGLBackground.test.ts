import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../components/WebGLBackground.astro'), 'utf-8');

describe('WebGLBackground shader optimization (REQ-WEBGL-001 to 004)', () => {
  it('should define a single fragment shader source', () => {
    expect(content).toMatch(/const\s+fragmentShaderSource\s*=/);
    expect(content).not.toMatch(/fragmentShaderSourceDark/);
    expect(content).not.toMatch(/fragmentShaderSourceLight/);
  });

  it('should expose theme-driven uniforms', () => {
    expect(content).toMatch(/u_baseColor/);
    expect(content).toMatch(/u_grainAmount/);
    expect(content).toMatch(/u_isLight/);
  });

  it('should not choose shader source by theme', () => {
    expect(content).not.toMatch(/theme === 'light'/);
  });

  it('should update uniforms on themeChanged instead of reinitializing WebGL', () => {
    expect(content).toMatch(/document\.addEventListener\('themeChanged'/);
    expect(content).not.toMatch(/initializeAndRunWebGL\(\)/);
  });

  it('should not cancel and restart animation frame on theme change path', () => {
    expect(content).not.toMatch(/cancelAnimationFrame/);
  });

  it('should keep a single render loop with requestAnimationFrame', () => {
    const matches = content.match(/requestAnimationFrame\(/g) ?? [];
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.length).toBeLessThanOrEqual(2);
  });

  it('should update uniforms with gl.uniform calls', () => {
    expect(content).toMatch(/gl\.uniform3f/);
    expect(content).toMatch(/gl\.uniform1f/);
  });
});
