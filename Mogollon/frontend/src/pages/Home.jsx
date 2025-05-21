import React from "react";
import "../styles/Home.css";

export default function Home() {
  return (
    <div className="home">
      <h1 className="text-3xl font-bold mb-4">🏠 Dashboard</h1>
      <p className="mb-2">You’re successfully logged in!</p>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}
