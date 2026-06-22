import { useState } from "react";

const ADMIN_PASSWORD = "SmartCardAdmin2026";
const STORAGE_KEY = "smartcard_admin_authed";

export function isAuthenticated(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

interface Props {
  onSuccess: () => void;
}

export default function LoginPage({ onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      onSuccess();
    } else {
      setError("Incorrect password. Please try again.");
      setShaking(true);
      setPassword("");
      setTimeout(() => setShaking(false), 500);
    }
  }

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sidebar-primary rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🏦</span>
          </div>
          <h1 className="text-white text-2xl font-bold">SmartCard Admin</h1>
          <p className="text-sidebar-foreground/50 text-sm mt-1">Support Operations Dashboard</p>
        </div>

        <div className={`bg-white rounded-2xl shadow-2xl p-8 ${shaking ? "animate-[shake_0.4s_ease]" : ""}`}>
          <h2 className="text-gray-900 font-semibold text-lg mb-6">Sign in to continue</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter password"
                autoFocus
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!password}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-sidebar-foreground/30 text-xs mt-6">
          SmartCard Bank · Internal Tool · Unauthorized access prohibited
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
