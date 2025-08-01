import style from "./App.module.css";
import { ShortcutInput } from "./components/ShortcutInput";

function App() {
  return (
    <main className={style.root}>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <input />
      <ShortcutInput />
    </main>
  );
}

export default App;
