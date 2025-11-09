import worker from "./worker";

export default function callOnWorker(func: string, param: any) {
  return new Promise((resolve) => {
    worker.postMessage({ func, param });
    worker.onmessage = ({ data }) => resolve(data);
  });
}
