const BREAKPOINT = 600;

export function initLayout() {
  const app = document.querySelector('.app');
  if (!app) {
    return null;
  }

  const sidebar = document.querySelector('.sidebar');
  const tabButtons = Array.from(document.querySelectorAll('.tab-button'));

  const state = {
    mode: 'desktop',
    sidebarOpen: true,
    activePane: 'editor',
    containerWidth: window.innerWidth,
  };

  const applyLayout = () => {
    document.body.dataset.layout = state.mode;
    document.body.dataset.activePane = state.activePane;

    if (sidebar) {
      if (state.mode === 'mobile') {
        sidebar.setAttribute('hidden', '');
      } else {
        sidebar.removeAttribute('hidden');
      }
    }

    tabButtons.forEach((button) => {
      const pane = button.dataset.pane;
      const isActive = pane === state.activePane;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  };

  const setModeFromWidth = (width) => {
    state.containerWidth = width;
    const nextMode = width < BREAKPOINT ? 'mobile' : 'desktop';
    state.mode = nextMode;
    state.sidebarOpen = nextMode === 'desktop';
    applyLayout();
  };

  const switchPane = (pane) => {
    if (!pane) {
      return;
    }
    state.activePane = pane;
    applyLayout();
  };

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      switchPane(button.dataset.pane);
    });
  });

  const initialWidth = app.getBoundingClientRect().width || window.innerWidth;
  setModeFromWidth(initialWidth);

  const observer = new ResizeObserver((entries) => {
    if (!entries.length) {
      return;
    }
    const width = entries[0].contentRect.width;
    setModeFromWidth(width);
  });

  observer.observe(app);

  return {
    state,
    destroy: () => observer.disconnect(),
  };
}
