(function () {
  const STORAGE_KEY = 'monkey_theme';
  const root = document.documentElement;
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function readSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Theme preference could not be saved.');
    }
  }

  function currentTheme() {
    return root.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    });
  }

  applyTheme(readSavedTheme() || (darkQuery.matches ? 'dark' : 'light'));

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const nextTheme = currentTheme() === 'dark' ? 'light' : 'dark';
        saveTheme(nextTheme);
        applyTheme(nextTheme);
      });
    });
  });

  darkQuery.addEventListener('change', (event) => {
    if (!readSavedTheme()) applyTheme(event.matches ? 'dark' : 'light');
  });
})();