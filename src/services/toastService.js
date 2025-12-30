import {
  createToastElement,
  hideToast,
  removeToast,
  showToast,
} from '../ui/toast.js';

const DEFAULT_SUCCESS_DURATION = 3000;
const DEFAULT_ERROR_DURATION = 5000;

const createNoopController = () => ({
  showSuccess: () => {},
  showError: () => {},
  hide: () => {},
  destroy: () => {},
});

/**
 * トースト通知サービスを初期化する。
 * @param {{ successDuration?: number, errorDuration?: number }} [options]
 * @returns {{ showSuccess: (message: string) => void, showError: (message: string) => void, hide: () => void, destroy: () => void }}
 */
export function initToast(options = {}) {
  if (!document.body) {
    console.error('トーストの初期化に失敗しました。');
    return createNoopController();
  }

  const { successDuration, errorDuration } = options;
  const element = createToastElement();
  document.body.appendChild(element);

  let timerId = null;

  const clearTimer = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const show = (type, message) => {
    clearTimer();
    showToast(element, type, message);
    const duration =
      type === 'success'
        ? (successDuration ?? DEFAULT_SUCCESS_DURATION)
        : (errorDuration ?? DEFAULT_ERROR_DURATION);

    timerId = window.setTimeout(() => {
      hideToast(element);
      timerId = null;
    }, duration);
  };

  return {
    showSuccess: (message) => show('success', message),
    showError: (message) => show('error', message),
    hide: () => {
      clearTimer();
      hideToast(element);
    },
    destroy: () => {
      clearTimer();
      removeToast(element);
    },
  };
}
