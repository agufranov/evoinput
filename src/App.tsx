import { useState } from "react";
import style from "./App.module.css";
import { ShortcutInput } from "./components/ShortcutInput";

function App() {
  const [value1, setValue1] = useState<string | undefined>("Control+Shift+A");
  const [value2, setValue2] = useState<string | undefined>();
  return (
    <main className={style.root}>
      <div>
        <h1>With initial value</h1>
        <div className={style.row}>
          <ShortcutInput value={value1} onChange={setValue1} />
          <button onClick={() => setValue1(undefined)}>Clear</button>
        </div>
        <div className={style.value}>Value: "{value1}"</div>
      </div>
      <div>
        <h1>Without initial value</h1>
        <div className={style.row}>
          <ShortcutInput onChange={setValue2} />
          <button onClick={() => setValue2(undefined)}>Clear</button>
        </div>
        <div className={style.value}>Value: "{value2}"</div>
      </div>
    </main>
  );
}

export default App;
