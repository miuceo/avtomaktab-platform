import fs from "fs/promises";
import path from "path";
import { SEED_ROAD_SIGNS, type SeedRoadSign } from "./seed-data";

function renderRoadSignSvg(sign: SeedRoadSign): string {
  const { svgType, code, label } = sign;

  if (svgType === "warning") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <polygon points="100,18 186,170 14,170" fill="#ffffff" stroke="#dc2626" stroke-width="16" stroke-linejoin="round"/>
  <text x="100" y="136" font-family="Arial, sans-serif" font-size="38" font-weight="bold" fill="#111827" text-anchor="middle">${label}</text>
  <text x="100" y="194" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#4b5563" text-anchor="middle">${code}</text>
</svg>`;
  }

  if (svgType === "priority_main") {
    const crossed = code === "2.2";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <polygon points="100,14 186,100 100,186 14,100" fill="#ffffff" stroke="#111827" stroke-width="4"/>
  <polygon points="100,36 164,100 100,164 36,100" fill="#facc15" stroke="#111827" stroke-width="3"/>
  ${crossed ? `<line x1="42" y1="158" x2="158" y2="42" stroke="#111827" stroke-width="16"/>` : ""}
  <text x="100" y="196" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#4b5563" text-anchor="middle">${code}</text>
</svg>`;
  }

  if (svgType === "priority_yield") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <polygon points="14,26 186,26 100,176" fill="#ffffff" stroke="#dc2626" stroke-width="16" stroke-linejoin="round"/>
  <text x="100" y="196" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#4b5563" text-anchor="middle">${code}</text>
</svg>`;
  }

  if (svgType === "priority_stop") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <polygon points="65,16 135,16 184,65 184,135 135,184 65,184 16,135 16,65" fill="#dc2626" stroke="#ffffff" stroke-width="8"/>
  <text x="100" y="114" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="#ffffff" text-anchor="middle">STOP</text>
</svg>`;
  }

  if (svgType === "prohibition") {
    const isBrick = code === "3.1";
    const isNoStop = code === "3.27" || code === "3.28";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="96" r="76" fill="${isBrick ? "#dc2626" : isNoStop ? "#1d4ed8" : "#ffffff"}" stroke="#dc2626" stroke-width="16"/>
  ${
    isBrick
      ? `<rect x="44" y="80" width="112" height="32" rx="4" fill="#ffffff"/>`
      : `<text x="100" y="112" font-family="Arial, sans-serif" font-size="44" font-weight="bold" fill="${isNoStop ? "#dc2626" : "#111827"}" text-anchor="middle">${label}</text>`
  }
  <text x="100" y="194" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#4b5563" text-anchor="middle">${code}</text>
</svg>`;
  }

  if (svgType === "mandatory") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="96" r="78" fill="#1d4ed8" stroke="#ffffff" stroke-width="6"/>
  <text x="100" y="114" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text>
  <text x="100" y="194" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#4b5563" text-anchor="middle">${code}</text>
</svg>`;
  }

  // info / service
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect x="24" y="18" width="152" height="152" rx="18" fill="#1d4ed8" stroke="#ffffff" stroke-width="6"/>
  <text x="100" y="114" font-family="Arial, sans-serif" font-size="58" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text>
  <text x="100" y="194" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#4b5563" text-anchor="middle">${code}</text>
</svg>`;
}

export async function generateSeedAssets() {
  const publicDir = path.join(process.cwd(), "public");
  const signsDir = path.join(publicDir, "seed", "signs");
  const diagramsDir = path.join(publicDir, "seed", "diagrams");
  const uploadsDir = path.join(publicDir, "uploads");

  await fs.mkdir(signsDir, { recursive: true });
  await fs.mkdir(diagramsDir, { recursive: true });
  await fs.mkdir(uploadsDir, { recursive: true });

  await fs.writeFile(path.join(uploadsDir, ".gitkeep"), "");

  // Logo SVG
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <rect width="120" height="120" rx="24" fill="#1e40af"/>
  <circle cx="60" cy="60" r="38" fill="none" stroke="#ffffff" stroke-width="8"/>
  <circle cx="60" cy="60" r="10" fill="#facc15"/>
  <line x1="60" y1="22" x2="60" y2="50" stroke="#ffffff" stroke-width="6"/>
  <line x1="26" y1="78" x2="52" y2="64" stroke="#ffffff" stroke-width="6"/>
  <line x1="94" y1="78" x2="68" y2="64" stroke="#ffffff" stroke-width="6"/>
</svg>`;
  await fs.writeFile(path.join(publicDir, "seed", "logo.svg"), logoSvg);

  // 30 Road sign SVGs
  for (const sign of SEED_ROAD_SIGNS) {
    const svg = renderRoadSignSvg(sign);
    await fs.writeFile(path.join(signsDir, `${sign.code}.svg`), svg);
  }

  // Traffic situation diagrams
  const intersection1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" width="600" height="320">
  <rect width="600" height="320" fill="#e5e7eb"/>
  <rect x="0" y="100" width="600" height="120" fill="#374151"/>
  <rect x="240" y="0" width="120" height="320" fill="#374151"/>
  <line x1="0" y1="160" x2="230" y2="160" stroke="#ffffff" stroke-width="3" stroke-dasharray="12,10"/>
  <line x1="370" y1="160" x2="600" y2="160" stroke="#ffffff" stroke-width="3" stroke-dasharray="12,10"/>
  <line x1="300" y1="0" x2="300" y2="90" stroke="#ffffff" stroke-width="3" stroke-dasharray="12,10"/>
  <line x1="300" y1="230" x2="300" y2="320" stroke="#ffffff" stroke-width="3" stroke-dasharray="12,10"/>
  <!-- Red signal + green arrow -->
  <rect x="375" y="225" width="44" height="72" rx="6" fill="#111827" stroke="#ffffff" stroke-width="2"/>
  <circle cx="397" cy="245" r="10" fill="#ef4444"/>
  <rect x="419" y="265" width="28" height="28" rx="4" fill="#111827" stroke="#ffffff" stroke-width="2"/>
  <text x="433" y="285" font-family="Arial" font-size="18" font-weight="bold" fill="#22c55e" text-anchor="middle">→</text>
  <!-- Blue car at bottom turning right -->
  <rect x="312" y="242" width="36" height="58" rx="8" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
  <!-- Yellow car from left going straight -->
  <rect x="130" y="170" width="64" height="36" rx="8" fill="#eab308" stroke="#111827" stroke-width="2"/>
  <path d="M 330 235 Q 335 190 420 190" fill="none" stroke="#60a5fa" stroke-width="4" stroke-dasharray="6,4"/>
</svg>`;

  const laneChange = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" width="600" height="320">
  <rect width="600" height="320" fill="#374151"/>
  <line x1="0" y1="60" x2="600" y2="60" stroke="#ffffff" stroke-width="4"/>
  <line x1="0" y1="160" x2="600" y2="160" stroke="#ffffff" stroke-width="3" stroke-dasharray="18,14"/>
  <line x1="0" y1="260" x2="600" y2="260" stroke="#ffffff" stroke-width="4"/>
  <!-- Left lane car (red) moving right -->
  <rect x="160" y="92" width="90" height="44" rx="10" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
  <path d="M 255 115 C 310 115, 330 195, 390 195" fill="none" stroke="#fca5a5" stroke-width="4" stroke-dasharray="8,6"/>
  <!-- Right lane car (blue) moving left -->
  <rect x="160" y="186" width="90" height="44" rx="10" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
  <path d="M 255 208 C 310 208, 330 120, 390 120" fill="none" stroke="#93c5fd" stroke-width="4" stroke-dasharray="8,6"/>
</svg>`;

  const equalCrossroad = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" width="600" height="320">
  <rect width="600" height="320" fill="#d1fae5"/>
  <rect x="0" y="100" width="600" height="120" fill="#374151"/>
  <rect x="240" y="0" width="120" height="320" fill="#374151"/>
  <line x1="0" y1="160" x2="230" y2="160" stroke="#ffffff" stroke-width="3" stroke-dasharray="12,10"/>
  <line x1="370" y1="160" x2="600" y2="160" stroke="#ffffff" stroke-width="3" stroke-dasharray="12,10"/>
  <line x1="300" y1="0" x2="300" y2="90" stroke="#ffffff" stroke-width="3" stroke-dasharray="12,10"/>
  <line x1="300" y1="230" x2="300" y2="320" stroke="#ffffff" stroke-width="3" stroke-dasharray="12,10"/>
  <!-- Bottom car -->
  <rect x="312" y="238" width="36" height="62" rx="8" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
  <!-- Right car (approaching from right) -->
  <rect x="385" y="112" width="64" height="36" rx="8" fill="#16a34a" stroke="#ffffff" stroke-width="2"/>
</svg>`;

  const leftTurn = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" width="600" height="320">
  <rect width="600" height="320" fill="#e5e7eb"/>
  <rect x="0" y="100" width="600" height="120" fill="#374151"/>
  <rect x="240" y="0" width="120" height="320" fill="#374151"/>
  <line x1="300" y1="0" x2="300" y2="90" stroke="#ffffff" stroke-width="3" stroke-dasharray="12,10"/>
  <line x1="300" y1="230" x2="300" y2="320" stroke="#ffffff" stroke-width="3" stroke-dasharray="12,10"/>
  <!-- Bottom car turning left -->
  <rect x="308" y="236" width="36" height="60" rx="8" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
  <path d="M 326 230 Q 326 135 200 135" fill="none" stroke="#93c5fd" stroke-width="4" stroke-dasharray="7,5"/>
  <!-- Top oncoming car going straight -->
  <rect x="256" y="24" width="36" height="60" rx="8" fill="#f97316" stroke="#ffffff" stroke-width="2"/>
  <path d="M 274 90 L 274 280" fill="none" stroke="#fdba74" stroke-width="4" stroke-dasharray="7,5"/>
</svg>`;

  await fs.writeFile(path.join(diagramsDir, "intersection-1.svg"), intersection1);
  await fs.writeFile(path.join(diagramsDir, "lane-change.svg"), laneChange);
  await fs.writeFile(path.join(diagramsDir, "equal-crossroad.svg"), equalCrossroad);
  await fs.writeFile(path.join(diagramsDir, "left-turn.svg"), leftTurn);
}
