export default function parseTar(bytes: Uint8Array) {
  const blockSize = 512;
  let offset = 0;
  const entries = [];

  function readString(buf: Uint8Array, start: number, len: number) {
    let s = "";
    for (let i = start; i < start + len; i++) {
      const ch = buf[i];
      if (!ch) break; // NUL terminator
      s += String.fromCharCode(ch);
    }
    return s.replace(/\0.*$/s, "");
  }

  function parseOctal(buf: Uint8Array, start: number, len: number) {
    // trim spaces and NULs, parse octal
    const s = readString(buf, start, len).trim();
    if (!s) return 0;
    return parseInt(s, 8) || 0;
  }

  while (offset + blockSize <= bytes.length) {
    // If header block is all zeros, it's the end of archive (two 512 blocks of zeros usually)
    let allZero = true;
    for (let i = 0; i < blockSize; i++) {
      if (bytes[offset + i] !== 0) {
        allZero = false;
        break;
      }
    }
    if (allZero) break;

    // Read header fields
    const name = readString(bytes, offset + 0, 100);
    const size = parseOctal(bytes, offset + 124, 12);
    const typeflag = readString(bytes, offset + 156, 1) || "0"; // '0' normal file

    // move to data
    offset += blockSize;

    // file data is next `size` bytes (padded to 512)
    const fileDataStart = offset;
    const fileDataEnd = offset + size;
    const uint8Array = bytes.slice(fileDataStart, fileDataEnd); // Uint8Array

    entries.push({
      name,
      size,
      type: typeflag,
      uint8Array,
    });

    // advance offset to next header (round up to 512)
    const padded = Math.ceil(size / blockSize) * blockSize;
    offset = fileDataStart + padded;
  }

  const entriesByName = entries.reduce(
    (acc, curr) => acc.set(curr.name, curr),
    new Map<
      string,
      {
        name: string;
        size: number;
        type: string;
        uint8Array: Uint8Array<ArrayBuffer>;
      }
    >()
  );

  return entriesByName;
}
