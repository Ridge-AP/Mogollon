// src/components/Form.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import {
  ROLE_DEFAULT_ROUTE,
  ROLE_OPTIONS
} from "../roleRoutes";
import { decodeJwt } from "../utils/jwt";
import LoadingIndicator from "./LoadingIndicator";

export default function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0].value);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isLogin = method === "login";
  const name    = isLogin ? "Login" : "Register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || (!isLogin && !role)) {
      return alert("All fields are required.");
    }
    setLoading(true);

    try {
      const payload = isLogin
        ? { username, password }
        : { username, password, role };

      const res = await api.post(route, payload);

      if (isLogin) {
        const { access, refresh } = res.data;
        localStorage.setItem(ACCESS_TOKEN,  access);
        localStorage.setItem(REFRESH_TOKEN, refresh);

        const decoded = decodeJwt(access);
        if (!decoded?.role) throw new Error("Invalid token payload");
        const dest =
          ROLE_DEFAULT_ROUTE[decoded.role] ||
          ROLE_DEFAULT_ROUTE.default;
        navigate(dest);
      } else {
        alert("Registered successfully! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      const details = err.response?.data || err.message;
      alert("Error:\n" + JSON.stringify(details, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* white / gold diagonal split */}
      <div
        className="absolute inset-0 bg-white"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
      <div
        className="absolute inset-0 bg-gold"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      />

      {/* card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm bg-white rounded-2xl p-8
                   shadow-[0_0_30px_rgba(0,0,0,0.7)]"
      >
        <h1 className="text-3xl font-extrabold text-black text-center mb-6">
          {name}
        </h1>

        {!isLogin && (
          <div className="mb-4">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              disabled={loading}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-gold-dark
                         bg-white text-black transition"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter username"
            value={username}
            disabled={loading}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-gold-dark
                       bg-white text-black transition"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-gold-dark
                       bg-white text-black transition"
          />
        </div>

        {loading && <LoadingIndicator />}

        {/* GOLD-ISH GRADIENT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 font-semibold rounded-lg
            bg-gradient-to-r
              from-yellow-400 via-yellow-500 to-yellow-600
            text-black
            hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700
            transition
            focus:outline-none focus:ring-4 focus:ring-yellow-300
            shadow-md
          "
        >
          {name}
        </button>

        {/* Contextual switch link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-yellow-600 hover:underline"
              >
                Register Now!
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-yellow-600 hover:underline"
              >
                Login Now!
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
