'use client';

interface QRCodeProps {
  value: string;
  size?: number;
}

// Generates a visually authentic-looking QR code SVG.
// Implements the standard Version 1 (21×21) finder patterns and timing strips;
// data modules are filled with a seeded pseudo-random pattern.
export default function QRCode({ value, size = 120 }: QRCodeProps) {
  const GRID = 21;
  const MODULE = size / GRID;

  // Seeded hash from value string
  let seed = 5381;
  for (let i = 0; i < value.length; i++) {
    seed = ((seed << 5) - seed + value.charCodeAt(i)) | 0;
  }
  function nextBit(): boolean {
    seed = ((seed << 5) - seed + 0x9e3779b9) | 0;
    return (seed & 0xf) > 4;
  }

  // Build module grid
  const grid: boolean[][] = Array.from({ length: GRID }, () => Array(GRID).fill(false));

  // Finder pattern (7×7 with quiet zone separator)
  function placeFinder(r: number, c: number) {
    for (let dr = 0; dr < 7; dr++) {
      for (let dc = 0; dc < 7; dc++) {
        const onEdge = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        grid[r + dr][c + dc] = onEdge || inCenter;
      }
    }
  }

  placeFinder(0, 0);   // top-left
  placeFinder(0, 14);  // top-right
  placeFinder(14, 0);  // bottom-left

  // Timing strips (row 6 and col 6, between finders)
  for (let i = 8; i <= 12; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Dark module (always dark — part of format info)
  grid[13][8] = true;

  // Mark reserved zones so data modules skip them
  const reserved = new Set<string>();
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) reserved.add(`${r},${c}`);
  for (let c = 13; c < GRID; c++) { reserved.add(`0,${c}`); reserved.add(`1,${c}`); reserved.add(`2,${c}`); reserved.add(`3,${c}`); reserved.add(`4,${c}`); reserved.add(`5,${c}`); reserved.add(`6,${c}`); reserved.add(`7,${c}`); reserved.add(`8,${c}`); }
  for (let r = 13; r < GRID; r++) { reserved.add(`${r},0`); reserved.add(`${r},1`); reserved.add(`${r},2`); reserved.add(`${r},3`); reserved.add(`${r},4`); reserved.add(`${r},5`); reserved.add(`${r},6`); reserved.add(`${r},7`); reserved.add(`${r},8`); }
  for (let i = 0; i < GRID; i++) { reserved.add(`6,${i}`); reserved.add(`${i},6`); }

  // Fill data modules
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (!reserved.has(`${r},${c}`)) {
        grid[r][c] = nextBit();
      }
    }
  }

  const rects: { x: number; y: number }[] = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (grid[r][c]) rects.push({ x: c * MODULE, y: r * MODULE });
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <rect width={size} height={size} fill="white" />
      {rects.map(({ x, y }, i) => (
        <rect key={i} x={x} y={y} width={MODULE} height={MODULE} fill="#1e1b4b" />
      ))}
    </svg>
  );
}
