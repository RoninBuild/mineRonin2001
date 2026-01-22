export type ChallengeLevel = {
  id: number;
  name: string;
  width: number;
  height: number;
  mask?: boolean[][];
  mines: number;
};

const createMask = (rows: number, cols: number, fill: (r: number, c: number) => boolean) =>
  Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => fill(r, c)),
  );

const createLMask = (rows: number, cols: number) =>
  createMask(rows, cols, (r, c) => r >= rows - 2 || c <= 1);

const createTMask = (rows: number, cols: number) =>
  createMask(rows, cols, (r, c) => r <= 1 || c === Math.floor(cols / 2));

const createPlusMask = (rows: number, cols: number) => {
  const midR = Math.floor(rows / 2);
  const midC = Math.floor(cols / 2);
  return createMask(rows, cols, (r, c) => r === midR || c === midC);
};

const createDiagonalMask = (rows: number, cols: number) =>
  createMask(rows, cols, (r, c) => r === c || r + c === cols - 1);

const createFrameMask = (rows: number, cols: number) =>
  createMask(rows, cols, (r, c) => r === 0 || c === 0 || r === rows - 1 || c === cols - 1);

const createCorridorMask = (rows: number, cols: number) =>
  createMask(rows, cols, (r, c) => (r + c) % 3 !== 0);

const levels: ChallengeLevel[] = [];

for (let i = 1; i <= 10; i += 1) {
  levels.push({
    id: i,
    name: `Level ${i}`,
    width: 6 + i,
    height: 6 + i,
    mines: 4 + i,
  });
}

for (let i = 11; i <= 20; i += 1) {
  const size = 10 + (i - 10);
  const maskPick = (i - 11) % 4;
  const mask =
    maskPick === 0
      ? createLMask(size, size)
      : maskPick === 1
      ? createTMask(size, size)
      : maskPick === 2
      ? createPlusMask(size, size)
      : createDiagonalMask(size, size);

  levels.push({
    id: i,
    name: `Level ${i}`,
    width: size,
    height: size,
    mask,
    mines: 10 + (i - 10),
  });
}

for (let i = 21; i <= 30; i += 1) {
  const size = 14 + (i - 21);
  const maskPick = (i - 21) % 3;
  const mask =
    maskPick === 0
      ? createFrameMask(size, size)
      : maskPick === 1
      ? createCorridorMask(size, size)
      : createPlusMask(size, size);

  levels.push({
    id: i,
    name: `Level ${i}`,
    width: size,
    height: size,
    mask,
    mines: 18 + (i - 21) * 2,
  });
}

export const CHALLENGE_LEVELS = levels;
