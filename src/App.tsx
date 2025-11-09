import "./App.css";
import { useState, type ChangeEventHandler } from "react";
import UploadIcon from "./Icons/UploadIcon";
import LoadingIcon from "./Icons/LoadingIcon";
import callOnWorker from "./utils/callOnWorker";

function App() {
  const [loading, setLoading] = useState(false);

  const handler: ChangeEventHandler<HTMLInputElement> = async (event) => {
    setLoading(true);

    const file = (event.target.files ?? [])[0];
    const buffer = await file.arrayBuffer();
    const input = new Uint8Array(buffer);

    const decompressed = await callOnWorker("gunzip", input);
    const parsedTarByName = await callOnWorker("parseTar", decompressed);
    const zipped = (await callOnWorker("generateZip", parsedTarByName)) as Uint8Array<ArrayBuffer>;

    if (zipped) {
      const blob = new Blob([zipped], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(".mbz", ".zip")}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    setLoading(false);
  };

  return (
    <>
      <h1>Moodle Backup Files Restoring Tool</h1>
      {loading ? (
        <LoadingIcon />
      ) : (
        <div>
          <label htmlFor="input">
            <UploadIcon />
          </label>
          <input id="input" type="file" accept=".mbz" onChange={handler} style={{ display: "none" }} />
        </div>
      )}
    </>
  );
}

export default App;
