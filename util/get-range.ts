export const getRange = (size: number, offset = 0) =>
  Array.from({ length: size })
    .fill("")
    .map((_, i) => i + offset);