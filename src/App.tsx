import { useState } from "react";
import style from "./App.module.css";
import { ShortcutInput } from "./components/ShortcutInput";

function App() {
  const [value, setValue] = useState("Control+Shift+A");
  return (
    <main className={style.root}>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <input />
      {value}
      <ShortcutInput value={value} onChange={setValue} />
      <ShortcutInput />
    </main>
  );
}

export default App;
