import { useState } from "react";
import style from "./App.module.css";
import { ShortcutInput } from "./components/ShortcutInput";

function App() {
  const [value1, setValue1] = useState<string | null>("Control+Shift+A");
  const [value2, setValue2] = useState<string | null>();
  const [value3, setValue3] = useState<string | null>("Alt+");
  return (
    <main className={style.root}>
      <div className={style.block}>
        <h1>With initial value</h1>
        <div className={style.row}>
          <ShortcutInput value={value1} onChange={setValue1} />
          <button onClick={() => setValue1("")}>Clear</button>
        </div>
        <div className={style.value}>Value: "{value1}"</div>
        <input
          value={value1 ?? ""}
          placeholder="Manual input"
          onChange={(e) => setValue1(e.target.value)}
        />
      </div>
      <div className={style.block}>
        <h1>Without initial value</h1>
        <div className={style.row}>
          <ShortcutInput onChange={setValue2} />
        </div>
        <div className={style.value}>Value: "{value2}"</div>
      </div>
      <div className={style.block}>
        <h1>Validation</h1>
        <div className={style.row}>
          <ShortcutInput value={value3} />
        </div>
        <div className={style.value}>Value: "{value3}"</div>
        <input
          placeholder="Manual input"
          value={value3 ?? ""}
          onChange={(e) => setValue3(e.target.value)}
        />
      </div>
    </main>
  );
}

export default App;
