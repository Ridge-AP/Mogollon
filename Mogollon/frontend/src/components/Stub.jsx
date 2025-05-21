// src/components/Stub.jsx
import React from "react";

export default function Stub({ title }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{title}</h1>
      <p style={{ fontSize: "1.25rem", color: "#555" }}>
        🚧 This page is under construction. Stay tuned!
      </p>
    </div>
  );
}
