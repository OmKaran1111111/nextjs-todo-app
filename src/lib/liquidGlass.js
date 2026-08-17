"use client";

export function buildGlassDisplacementMap({ width, height, radius = 28, edgeBand = 24, strength = 1 }) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  const halfW = canvas.width / 2;
  const halfH = canvas.height / 2;
  const r = Math.min(radius, halfW, halfH);

  const sdf = (x, y) => {
    const px = Math.abs(x) - halfW + r;
    const py = Math.abs(y) - halfH + r;
    const qx = Math.max(px, 0);
    const qy = Math.max(py, 0);
    return Math.min(Math.max(px, py), 0) + Math.hypot(qx, qy) - r;
  };

  const eps = 1;
  for (let j = 0; j < canvas.height; j++) {
    const y = j - halfH;
    for (let i = 0; i < canvas.width; i++) {
      const x = i - halfW;

      const d = sdf(x, y);
      const dx = (sdf(x + eps, y) - sdf(x - eps, y)) / (2 * eps);
      const dy = (sdf(x, y + eps) - sdf(x, y - eps)) / (2 * eps);
      const len = Math.hypot(dx, dy) || 1;
      const nx = dx / len;
      const ny = dy / len;

      const weight = Math.max(0, 1 - Math.abs(d + edgeBand) / edgeBand);
      const offset = weight * strength;

      const idx = (j * canvas.width + i) * 4;
      data[idx] = Math.max(0, Math.min(255, 128 + nx * offset * 127));
      data[idx + 1] = Math.max(0, Math.min(255, 128 + ny * offset * 127));
      data[idx + 2] = 128;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}


export const FLAT_DISPLACEMENT_MAP =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect width='1' height='1' fill='rgb(128,128,128)'/%3E%3C/svg%3E";