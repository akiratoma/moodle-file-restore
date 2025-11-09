import { XMLParser } from "fast-xml-parser";
import { zipSync } from "fflate";

export default function generateZip(
  parsedTarByName: Map<
    string,
    {
      name: string;
      size: number;
      type: string;
      uint8Array: Uint8Array<ArrayBuffer>;
    }
  >
) {
  const filesXml = parsedTarByName.get("files.xml");

  if (!filesXml) return null;

  const parser = new XMLParser();
  const parsedXml = parser.parse(new TextDecoder().decode(filesXml.uint8Array));
  const zipInput: Record<string, Uint8Array> = {};

  const files = parsedXml.files.file as {
    contenthash: string;
    filename: string;
    filesize: number;
  }[];

  for (const { contenthash, filename, filesize } of files) {
    if (filesize) {
      const parsedTarEntry = parsedTarByName.get(`files/${contenthash.slice(0, 2)}/${contenthash}`);
      if (parsedTarEntry) zipInput[filename] = parsedTarEntry.uint8Array;
    }
  }

  const zipped = zipSync(zipInput) as Uint8Array<ArrayBuffer>;

  return zipped;
}
