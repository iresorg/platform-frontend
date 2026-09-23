// Runs synchronously before React hydrates, so <html> already carries the
// right data-theme attribute by the time anything paints — no flash of the
// wrong theme. Keep this string's resolution logic in lockstep with
// resolveInitialTheme() in theme-provider.tsx.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = window.localStorage.getItem("theme");
    var theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
