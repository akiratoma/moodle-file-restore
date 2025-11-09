const worker = new Worker(new URL("./workerHandler.ts", import.meta.url), { type: "module" });

export default worker;
