import { Routes, Route, NavLink } from "react-router-dom";
import InferencePlayground from "./components/playground/InferencePlayground";
import ModelDiffView from "./components/diff/ModelDiffView";

export default function App() {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="app-header" role="banner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <p className="brand-eyebrow">Company X</p>
            <h1 className="brand-title">Developer Portal</h1>
          </div>
        </div>
        <nav className="app-nav" aria-label="Primary">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Inference Playground
          </NavLink>
          <NavLink
            to="/diff"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Model Diff
          </NavLink>
        </nav>
      </header>
      <main id="main-content" className="app-main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<InferencePlayground />} />
          <Route path="/diff" element={<ModelDiffView />} />
        </Routes>
      </main>
      <footer className="app-footer" role="contentinfo">
        <p>Frontend intern assignment — inference playground &amp; token diff</p>
      </footer>
    </div>
  );
}
