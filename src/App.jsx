import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ConfirmPage from "./pages/ConfirmPage.jsx";
import UnsubscribePage from "./pages/UnsubscribePage.jsx";

function Layout() {
  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            Weather Subscription
          </Link>

          <nav className="flex items-center gap-3 text-sm text-slate-600">
            <Link to="/" className="hover:text-slate-900">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4 text-xs text-slate-500">
          API base URL:{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5">
            {import.meta.env?.VITE_API_BASE_URL ?? "http://localhost:3000"}
          </code>
        </div>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The page you are looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="confirm/:token" element={<ConfirmPage />} />
          <Route path="unsubscribe/:token" element={<UnsubscribePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
