import { useEffect, useMemo, useState } from "react";
import { getWeather, subscribeUser } from "../api/client.js";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  // --- Weather search state ---
  const [cityQuery, setCityQuery] = useState("");
  const [searchedCity, setSearchedCity] = useState("");
  const [weather, setWeather] = useState(null);

  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  // --- Subscription state ---
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [subscriptionCity, setSubscriptionCity] = useState("");
  const [subscriptionCityDirty, setSubscriptionCityDirty] = useState(false);

  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");
  const [subscribeSuccess, setSubscribeSuccess] = useState("");

  const canSubscribe = useMemo(() => {
    return (
      email.trim().length > 0 &&
      subscriptionCity.trim().length > 0 &&
      (frequency === "hourly" || frequency === "daily") &&
      !subscribeLoading
    );
  }, [email, subscriptionCity, frequency, subscribeLoading]);

  useEffect(() => {
    // Auto-fill subscription city from the last successful search,
    // but only if user hasn't manually edited the subscription city.
    if (!subscriptionCityDirty && searchedCity) {
      setSubscriptionCity(searchedCity);
    }
  }, [searchedCity, subscriptionCityDirty]);

  async function handleSearchSubmit(e) {
    e.preventDefault();

    const city = cityQuery.trim();
    if (!city) return;

    setWeatherLoading(true);
    setWeatherError("");
    setWeather(null);
    setSubscribeSuccess(""); // keep UI clean when performing new actions

    try {
      const data = await getWeather(city);
      setWeather(data);
      setSearchedCity(city);
    } catch (err) {
      // Normalized error from our API layer: {message,status,code,details}
      const status =
        err && typeof err === "object" && "status" in err ? err.status : null;

      if (status === 404) {
        setWeatherError("City not found. Please check spelling and try again.");
      } else {
        const message =
          (err && typeof err === "object" && "message" in err && err.message) ||
          "Failed to fetch weather.";
        setWeatherError(message);
      }

      setSearchedCity(city);
    } finally {
      setWeatherLoading(false);
    }
  }

  async function handleSubscribeSubmit(e) {
    e.preventDefault();

    const cleanEmail = email.trim();
    const cleanCity = subscriptionCity.trim();

    setSubscribeError("");
    setSubscribeSuccess("");

    if (!cleanEmail) {
      setSubscribeError("Please enter your email address.");
      return;
    }
    if (!cleanCity) {
      setSubscribeError("Please enter a city to subscribe to.");
      return;
    }
    if (frequency !== "hourly" && frequency !== "daily") {
      setSubscribeError("Please select a valid frequency.");
      return;
    }

    setSubscribeLoading(true);

    try {
      await subscribeUser(cleanEmail, cleanCity, frequency);
      setSubscribeSuccess("Subscribed! Check your email for confirmation.");
    } catch (err) {
      const message =
        (err && typeof err === "object" && "message" in err && err.message) ||
        "Failed to subscribe.";
      setSubscribeError(message);
    } finally {
      setSubscribeLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Search for current weather and subscribe to updates.
        </p>
      </div>

      {/* Search + Weather */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Search</h2>
            <p className="mt-1 text-sm text-slate-600">
              Enter a city to retrieve the latest weather.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="mt-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label
                htmlFor="city"
                className="block text-sm font-medium text-slate-700"
              >
                City
              </label>
              <input
                id="city"
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value);
                  console.log(e.target.value);
                }}
                placeholder="e.g. Warsaw"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={weatherLoading || cityQuery.trim().length === 0}
              className={classNames(
                "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition",
                weatherLoading || cityQuery.trim().length === 0
                  ? "cursor-not-allowed bg-slate-200 text-slate-600"
                  : "bg-slate-900 text-white hover:bg-slate-800",
              )}
            >
              {weatherLoading ? "Searching..." : "Get weather"}
            </button>
          </div>
        </form>

        <div className="mt-5 space-y-3">
          {weatherError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {weatherError}
            </div>
          ) : null}

          {weather ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-700">
                    Current weather
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {searchedCity}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Temp
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">
                    {weather.temperature}°
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-white p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Humidity
                  </div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {weather.humidity}%
                  </div>
                </div>

                <div className="rounded-lg bg-white p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Description
                  </div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {weather.description}
                  </div>
                </div>
              </div>
            </div>
          ) : searchedCity && !weatherLoading && !weatherError ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              No weather data to display.
            </div>
          ) : null}
        </div>
      </section>

      {/* Subscription */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Subscribe for updates
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Receive weather notifications by email. You will need to confirm via
            a link sent to your inbox.
          </p>
        </div>

        <form onSubmit={handleSubscribeSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="frequency"
                className="block text-sm font-medium text-slate-700"
              >
                Frequency
              </label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="subscriptionCity"
                className="block text-sm font-medium text-slate-700"
              >
                City
              </label>
              <input
                id="subscriptionCity"
                value={subscriptionCity}
                onChange={(e) => {
                  setSubscriptionCity(e.target.value);
                  setSubscriptionCityDirty(true);
                }}
                placeholder="e.g. Warsaw"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                Auto-fills from your last successful search.
              </p>
            </div>
          </div>

          {subscribeError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {subscribeError}
            </div>
          ) : null}

          {subscribeSuccess ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {subscribeSuccess}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              By subscribing, you agree to receive emails for the selected city.
            </div>

            <button
              type="submit"
              disabled={!canSubscribe}
              className={classNames(
                "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition",
                !canSubscribe
                  ? "cursor-not-allowed bg-slate-200 text-slate-600"
                  : "bg-emerald-600 text-white hover:bg-emerald-700",
              )}
            >
              {subscribeLoading ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
