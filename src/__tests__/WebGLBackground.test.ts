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
    expect(content).toMatch(/u_grainIntensity/);
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

describe('Geometric Grid Shader (T-009)', () => {
  it('fragment shader source contains fract() (grid sampling)', () => {
    expect(content).toMatch(/fract\(/);
  });

  it('fragment shader source does NOT contain distance-based wave logic', () => {
    expect(content).not.toMatch(/u_centerAmplitude/);
    expect(content).not.toMatch(/u_colorModFactors/);
    expect(content).not.toMatch(/u_smoothstepRange/);
  });

  it('fragment shader uses u_gridSize uniform', () => {
    expect(content).toMatch(/uniform\s+float\s+u_gridSize/);
  });

  it('fragment shader uses u_gridColor uniform', () => {
    expect(content).toMatch(/uniform\s+vec3\s+u_gridColor/);
  });

  it('fragment shader uses u_gridLineWidth uniform', () => {
    expect(content).toMatch(/uniform\s+float\s+u_gridLineWidth/);
  });

  it('fragment shader uses u_fadeRadius uniform', () => {
    expect(content).toMatch(/uniform\s+float\s+u_fadeRadius/);
  });

  it('fragment shader uses u_pulseSpeed uniform', () => {
    expect(content).toMatch(/uniform\s+float\s+u_pulseSpeed/);
  });

  it('fragment shader uses u_grainIntensity (not u_grainAmount)', () => {
    expect(content).toMatch(/uniform\s+float\s+u_grainIntensity/);
    expect(content).not.toMatch(/u_grainAmount/);
  });

  it('fragment shader uses u_displacementAmplitude', () => {
    expect(content).toMatch(/uniform\s+float\s+u_displacementAmplitude/);
  });

  it('fragment shader uses u_displacementSpeed', () => {
    expect(content).toMatch(/uniform\s+float\s+u_displacementSpeed/);
  });

  it('fragment shader uses u_mouse uniform for magnetic interaction', () => {
    expect(content).toMatch(/uniform\s+vec2\s+u_mouse/);
  });

  it('script adds mousemove event listener to track mouse', () => {
    expect(content).toMatch(/window\.addEventListener\('mousemove'/);
  });

  it('supports autonomous watery refraction animation on devices without fine pointer', () => {
    expect(content).toMatch(/matchMedia\('\(pointer: fine\)'\)/);
    expect(content).toMatch(/autonomousMotionEnabled/);
    expect(content).toMatch(/waterDriftX/);
    expect(content).toMatch(/waterDriftY/);
    expect(content).toMatch(/Math\.sin\(elapsedSeconds \* 0\.35/);
    expect(content).toMatch(/Math\.sin\(elapsedSeconds \* 0\.21/);
    expect(content).toMatch(/Math\.cos\(elapsedSeconds \* 0\.28/);
    expect(content).toMatch(/Math\.cos\(elapsedSeconds \* 0\.18/);
    expect(content).toMatch(/Math\.sin\(elapsedSeconds/);
    expect(content).toMatch(/Math\.cos\(elapsedSeconds/);
  });

  it('disables autonomous motion when reduced motion is requested', () => {
    expect(content).toMatch(/matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
    expect(content).toMatch(/!prefersReducedMotionQuery\.matches/);
  });

  it('fragment shader preserves hash function fract(sin(dot(...)))', () => {
    expect(content).toMatch(/fract\(sin\(dot\(/);
  });
});

describe('THEME_UNIFORMS and TypeScript interfaces (T-010)', () => {
  it('does NOT define u_centerAmplitude', () => {
    expect(content).not.toMatch(/u_centerAmplitude/);
  });

  it('does NOT define u_centerSpeed', () => {
    expect(content).not.toMatch(/u_centerSpeed/);
  });

  it('does NOT define u_colorModFactors', () => {
    expect(content).not.toMatch(/u_colorModFactors/);
  });

  it('does NOT define u_colorModOffsets', () => {
    expect(content).not.toMatch(/u_colorModOffsets/);
  });

  it('does NOT define u_smoothstepRange', () => {
    expect(content).not.toMatch(/u_smoothstepRange/);
  });

  it('does NOT define u_colorSpeed', () => {
    expect(content).not.toMatch(/u_colorSpeed/);
  });

  it('does NOT define u_distanceMults', () => {
    expect(content).not.toMatch(/u_distanceMults/);
  });

  it('defines gridSize in THEME_UNIFORMS', () => {
    expect(content).toMatch(/gridSize:\s*[\d.]+/);
  });

  it('defines gridColor as vec3 array', () => {
    expect(content).toMatch(/gridColor:\s*\[/);
  });

  it('defines gridLineWidth in THEME_UNIFORMS', () => {
    expect(content).toMatch(/gridLineWidth:\s*[\d.]+/);
  });

  it('defines displacementAmplitude in THEME_UNIFORMS', () => {
    expect(content).toMatch(/displacementAmplitude:\s*[\d.]+/);
  });

  it('defines displacementSpeed in THEME_UNIFORMS', () => {
    expect(content).toMatch(/displacementSpeed:\s*[\d.]+/);
  });

  it('defines grainIntensity in THEME_UNIFORMS', () => {
    expect(content).toMatch(/grainIntensity:\s*[\d.]+/);
  });

  it('dark theme: baseColor is near-black', () => {
    // Dark baseColor should have values < 0.15
    const darkMatch = content.match(/dark:\s*\{[\s\S]*?baseColor:\s*\[([\d.]+),\s*([\d.]+),\s*([\d.]+)\]/);
    expect(darkMatch).toBeTruthy();
    if (darkMatch) {
      expect(parseFloat(darkMatch[1])).toBeLessThan(0.15);
      expect(parseFloat(darkMatch[2])).toBeLessThan(0.15);
      expect(parseFloat(darkMatch[3])).toBeLessThan(0.15);
    }
  });

  it('dark theme: gridColor is cool gray', () => {
    const darkMatch = content.match(/dark:\s*\{[\s\S]*?gridColor:\s*\[([\d.]+),\s*([\d.]+),\s*([\d.]+)\]/);
    expect(darkMatch).toBeTruthy();
    if (darkMatch) {
      expect(parseFloat(darkMatch[1])).toBeGreaterThan(0.1);
      expect(parseFloat(darkMatch[1])).toBeLessThan(0.3);
    }
  });

  it('light theme: baseColor is near-white', () => {
    const lightMatch = content.match(/light:\s*\{[\s\S]*?baseColor:\s*\[([\d.]+),\s*([\d.]+),\s*([\d.]+)\]/);
    expect(lightMatch).toBeTruthy();
    if (lightMatch) {
      expect(parseFloat(lightMatch[1])).toBeGreaterThan(0.9);
      expect(parseFloat(lightMatch[2])).toBeGreaterThan(0.9);
      expect(parseFloat(lightMatch[3])).toBeGreaterThan(0.9);
    }
  });

  it('light theme: gridColor is medium gray', () => {
    const lightMatch = content.match(/light:\s*\{[\s\S]*?gridColor:\s*\[([\d.]+),\s*([\d.]+),\s*([\d.]+)\]/);
    expect(lightMatch).toBeTruthy();
    if (lightMatch) {
      expect(parseFloat(lightMatch[1])).toBeGreaterThan(0.4);
      expect(parseFloat(lightMatch[1])).toBeLessThan(0.8);
    }
  });

  it('GridThemeUniforms interface exists with correct fields', () => {
    expect(content).toMatch(/interface\s+GridThemeUniforms/);
    expect(content).toMatch(/GridThemeUniforms[\s\S]*baseColor/);
    expect(content).toMatch(/GridThemeUniforms[\s\S]*gridSize/);
    expect(content).toMatch(/GridThemeUniforms[\s\S]*gridColor/);
    expect(content).toMatch(/GridThemeUniforms[\s\S]*gridLineWidth/);
    expect(content).toMatch(/GridThemeUniforms[\s\S]*fadeRadius/);
    expect(content).toMatch(/GridThemeUniforms[\s\S]*pulseSpeed/);
    expect(content).toMatch(/GridThemeUniforms[\s\S]*grainIntensity/);
    expect(content).toMatch(/GridThemeUniforms[\s\S]*displacementAmplitude/);
    expect(content).toMatch(/GridThemeUniforms[\s\S]*displacementSpeed/);
  });

  it('UniformHandles has gridSize, gridColor, gridLineWidth, fadeRadius, pulseSpeed, grainIntensity, displacementAmplitude, displacementSpeed', () => {
    expect(content).toMatch(/UniformHandles[\s\S]*gridSize/);
    expect(content).toMatch(/UniformHandles[\s\S]*gridColor/);
    expect(content).toMatch(/UniformHandles[\s\S]*gridLineWidth/);
    expect(content).toMatch(/UniformHandles[\s\S]*fadeRadius/);
    expect(content).toMatch(/UniformHandles[\s\S]*pulseSpeed/);
    expect(content).toMatch(/UniformHandles[\s\S]*grainIntensity/);
    expect(content).toMatch(/UniformHandles[\s\S]*displacementAmplitude/);
    expect(content).toMatch(/UniformHandles[\s\S]*displacementSpeed/);
  });

  it('GridThemeUniforms does NOT have removed fields', () => {
    expect(content).not.toMatch(/centerAmplitude/);
    expect(content).not.toMatch(/colorModFactors/);
    expect(content).not.toMatch(/smoothstepRange/);
    expect(content).not.toMatch(/distanceMults/);
    expect(content).not.toMatch(/colorSpeed/);
  });
});

describe('Canvas element (T-011)', () => {
  it('canvas element does NOT have blur-lg class', () => {
    expect(content).not.toMatch(/class="blur-lg"/);
    expect(content).not.toMatch(/class="[^"]*blur-lg[^"]*"/);
  });

  it('canvas still has id webgl-background', () => {
    expect(content).toMatch(/id="webgl-background"/);
  });

  it('canvas still has aria-hidden="true"', () => {
    expect(content).toMatch(/aria-hidden="true"/);
  });

  it('canvas still has role="presentation"', () => {
    expect(content).toMatch(/role="presentation"/);
  });
});
