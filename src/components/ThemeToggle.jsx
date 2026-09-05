function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.742 13.045a8.088 8.088 0 0 1-2.077.272c-4.492 0-8.135-3.643-8.135-8.135 0-1.352.332-2.628.917-3.75a.75.75 0 0 0-.917-1.045A10.135 10.135 0 1 0 22 14.08a.75.75 0 0 0-1.258-1.035Z"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      className="theme-toggle__sun"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  );
}

export default function ThemeToggle({ darkMode, onToggle }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={darkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={darkMode ? "Tema claro" : "Tema oscuro"}
    >
      {darkMode ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
