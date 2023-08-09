export type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export type HslColor = {
  h: number;
  s: number;
  l: number;
};

export function hslToRgb(hsl: HslColor): RgbColor {
  const { h, s, l } = hsl;

  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;

  let r, g, b;

  if (s === 0) {
    return {
      r: Math.round(lDecimal),
      g: Math.round(lDecimal),
      b: Math.round(lDecimal),
    };
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

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function RGBToHSL(rgb: RgbColor): HslColor {
  const color: RgbColor = rgb;

  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);

  let h = (max + min) / 2;
  let s = h;
  let l = h;

  if (max === min) {
    // Achromatic
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  s = l >= 0.5 ? d / (2 - (max + min)) : d / (max + min);
  switch (max) {
    case r:
      h = ((g - b) / d) * 60;
      if (h < 0) h += 360;
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

export function stringToRGB(colorStr: string) {
  if (!colorStr.match(/[0-9A-F]{6}/i)) {
    return { r: 255, g: 255, b: 255 };
  }

  return {
    r: parseInt(colorStr.substring(0, 2), 16),
    g: parseInt(colorStr.substring(2, 4), 16),
    b: parseInt(colorStr.substring(4, 6), 16),
  };
}
