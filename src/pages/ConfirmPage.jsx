import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { confirmSubscription } from "../api/client.js";

export default function ConfirmPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState({
    loading: true,
    ok: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        setState({ loading: false, ok: false, error: "Missing token in URL." });
        return;
      }

      setState({ loading: true, ok: false, error: null });

      try {
        await confirmSubscription(token);
        if (!cancelled) setState({ loading: false, ok: true, error: null });
      } catch (err) {
        const message =
          (err && typeof err === "object" && "message" in err && err.message) ||
          "Failed to confirm subscription.";
        if (!cancelled) setState({ loading: false, ok: false, error: message });
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Confirm subscription
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Token:{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5">
            {token ?? "—"}
          </code>
        </p>

        <div className="mt-6">
          {state.loading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Loading...
            </div>
          ) : state.ok ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Success! Your subscription has been confirmed.
            </div>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              Error: {state.error ?? "Something went wrong."}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Back to Home
          </button>

          <Link
            to="/"
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
