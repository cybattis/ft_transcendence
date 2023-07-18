export function hslToRgb(hsl: { h: number; s: number; l: number }): {
  r: number;
  g: number;
  b: number;
} {
  const { h, s, l } = hsl;

  const hDecimal = h / 100;
  const sDecimal = s / 100;
  const lDecimal = l / 100;

  let r, g, b;

  if (s === 0) {
    return { r: lDecimal, g: lDecimal, b: lDecimal };
  }

  const HueToRGB = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let q =
    lDecimal < 0.5
      ? lDecimal * (1 + sDecimal)
      : lDecimal + sDecimal - lDecimal * sDecimal;
  let p = 2 * lDecimal - q;

  r = HueToRGB(p, q, hDecimal + 1 / 3);
  g = HueToRGB(p, q, hDecimal);
  b = HueToRGB(p, q, hDecimal - 1 / 3);

  return { r: r * 255, g: g * 255, b: b * 255 };
}

export function RGBToHSL(rgb: { r: number; g: number; b: number }): {
  h: number;
  s: number;
  l: number;
} {
  const { r: r255, g: g255, b: b255 } = rgb;

  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);

  let h = (max + min) / 2;
  let s = h;
  let l = h;

  if (max === min) {
    // Achromatic
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  s = l >= 0.5 ? d / (2 - (max + min)) : d / (max + min);
  switch (max) {
    case r:
      h = ((g - b) / d) * 60;
      break;
    case g:
      h = ((b - r) / d + 2) * 60;
      break;
    case b:
      h = ((r - g) / d + 4) * 60;
      break;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
