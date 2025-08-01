import { useState } from "react";
import style from "./App.module.css";
import { ShortcutInput } from "./components/ShortcutInput";

function App() {
  const [value1, setValue1] = useState<string | null>("Control+Shift+A");
  const [value2, setValue2] = useState<string | null>();
  return (
    <main className={style.root}>
      <div>
        <h1>With initial value</h1>
        <div className={style.row}>
          <ShortcutInput value={value1} onChange={setValue1} />
          <button onClick={() => setValue1("")}>Clear</button>
        </div>
        <div className={style.value}>Value: "{value1}"</div>
        <input
          placeholder="Manual input"
          onChange={(e) => setValue1(e.target.value)}
        />
      </div>
      {/* <div>
        <h1>Without initial value</h1>
        <div className={style.row}>
          <ShortcutInput onChange={setValue2} />
        </div>
        <div className={style.value}>Value: "{value2}"</div>
      </div> */}
    </main>
  );
}

export default App;
