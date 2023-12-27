import './App.css';
import { BrowserRouter, Routes, Route} from "react-router-dom";

import ViewHome from "./ViewHome.js"
import ViewJoin from "./ViewJoin.js"
import ViewHide from "./ViewHide.js"
import ViewSeek from "./ViewSeek.js"

function App() {
  return (
    <div className="App">
      <BrowserRouter>

        <Routes>

          <Route path="/:gameId/hide" element={<ViewHide />} />
          <Route path="/:gameId/seek" element={<ViewSeek />} />
          <Route path="/join" element={<ViewJoin />} />
          <Route path="/" element={<ViewHome />} />
        </Routes>

      </BrowserRouter>

    </div>
  );
}

export default App;
