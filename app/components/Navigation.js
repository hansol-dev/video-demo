export function Navigation({ active }) {
  return (
    <nav>
      <a className="logo" href="/" aria-label="VIDEO.AI 홈으로 이동">
        <div className="logo-mark" />
        VIDEO.AI
      </a>
      <div className="nav-links">
        <a className={active === "Create" ? "active" : ""}>Create</a>
        <a>Presets</a>
        <a>Models</a>
        <a>Studio MCP</a>
        <a className="upgrade-link">Upgrade</a>
      </div>
      <div className="nav-links">
        <a>Sign In</a>
      </div>
    </nav>
  );
}

export function Star({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}
