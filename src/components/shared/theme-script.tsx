/**
 * Applique le thème avant le paint — évite le flash sans styles / mauvaise couleur.
 * Doit rester inline (bloquant) dans <head>.
 */
export function ThemeScript() {
  const script = `
(function () {
  try {
    var key = 'theme';
    var stored = localStorage.getItem(key);
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored === 'dark' || (stored !== 'light' && stored !== 'dark' && prefersDark);
    var root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
