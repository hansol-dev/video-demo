import React from "react";

export default function NavBar({ userLabel = "Sign In", active = "Create" }) {
  return (
    <nav>
      <div className="logo">
        <div className="logo-mark" />
        VIDEO.AI
      </div>
      <div className="nav-links">
        {["Create", "Presets", "Models", "Studio MCP"].map((item) => (
          <a className={active === item ? "active" : ""} key={item}>
            {item}
          </a>
        ))}
        <a style={{ color: "var(--magenta)" }}>Upgrade</a>
      </div>
      <div className="nav-links">
        <a>{userLabel}</a>
      </div>
    </nav>
  );
}
