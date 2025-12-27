export function initTheme() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const state = {
    preference: 'system',
    systemPreference: mediaQuery.matches ? 'dark' : 'light',
    resolved: mediaQuery.matches ? 'dark' : 'light',
  };

  const applyTheme = () => {
    document.documentElement.dataset.theme = state.resolved;
    document.documentElement.style.colorScheme = state.resolved;
  };

  const handleChange = (event) => {
    state.systemPreference = event.matches ? 'dark' : 'light';
    if (state.preference === 'system') {
      state.resolved = state.systemPreference;
      applyTheme();
    }
  };

  applyTheme();

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
  } else {
    mediaQuery.addListener(handleChange);
  }

  return {
    state,
    destroy: () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    },
  };
}
