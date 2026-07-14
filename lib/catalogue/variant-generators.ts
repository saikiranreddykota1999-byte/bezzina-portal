export function mmSizes(values: number[]): string[] {
  return values.map((v) => `${v} mm`);
}

export function imperialSizes(values: string[]): string[] {
  return values;
}

export function mmRange(start: number, end: number, step: number): string[] {
  const sizes: string[] = [];
  for (let value = start; value <= end; value += step) {
    sizes.push(`${value} mm`);
  }
  return sizes;
}

export function metricThreadRange(start: number, end: number, step = 1): string[] {
  const sizes: string[] = [];
  for (let value = start; value <= end; value += step) {
    sizes.push(`M${value}`);
  }
  return sizes;
}

export function inchSizes(values: string[]): string[] {
  return values.map((v) => (v.endsWith('"') ? v : `${v}"`));
}

export function lengthMm(values: number[]): string[] {
  return values.map((v) => `${v} mm`);
}

export function ozSizes(values: number[]): string[] {
  return values.map((v) => `${v} oz`);
}

export function lbSizes(values: number[]): string[] {
  return values.map((v) => `${v} lb`);
}

export function torqueDriveSizes(): string[] {
  return ['1/4"', '3/8"', '1/2"', '3/4"', '1"'];
}

export function socketSetRange(): string[] {
  return mmRange(4, 32, 1);
}

export function allenKeyRange(): string[] {
  return mmRange(1.5, 10, 0.5);
}

export function torxKeyRange(): string[] {
  const sizes: string[] = [];
  const values = [6, 7, 8, 9, 10, 15, 20, 25, 27, 30, 40, 45, 50, 55, 60];
  for (const value of values) {
    sizes.push(`T${value}`);
  }
  return sizes;
}

export function phillipsSizes(): string[] {
  return ['PH0', 'PH1', 'PH2', 'PH3', 'PH4'];
}

export function flatScrewdriverSizes(): string[] {
  return mmSizes([3, 4, 5, 6, 8]);
}

export function capacityTonRange(): string[] {
  return ['0.5 t', '1 t', '2 t', '3 t', '5 t', '10 t'];
}

export function wireRopeDiameters(): string[] {
  return mmSizes([6, 8, 10, 12, 14, 16, 18, 20, 24]);
}

export function slingLengths(): string[] {
  return ['1 m', '2 m', '3 m', '4 m', '5 m', '6 m'];
}

export function safetySizes(): string[] {
  return ['S', 'M', 'L', 'XL', 'XXL'];
}

export function bootSizes(): string[] {
  return ['EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45', 'EU 46'];
}

export function lifeJacketSizes(): string[] {
  return ['Adult S', 'Adult M', 'Adult L', 'Adult XL', 'Child'];
}
