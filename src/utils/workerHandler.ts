import { gunzipSync } from "fflate";
import parseTar from "./parseTar";
import generateZip from "./generateZip";

self.onmessage = (event: { data: { func: string; param: any } }) => {
  const { func, param } = event.data;

  if (func === "gunzip") {
    const decompressed = gunzipSync(param);
    postMessage(decompressed);
  } else if (func === "parseTar") {
    const parsedTarByName = parseTar(param);
    postMessage(parsedTarByName);
  } else if (func === "generateZip") {
    const zipped = generateZip(param);
    postMessage(zipped);
  }
};

export {};
