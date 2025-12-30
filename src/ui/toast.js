/**
 * トースト通知のDOM要素を作成する。
 * @returns {HTMLElement}
 */
export function createToastElement() {
  const element = document.createElement('div');
  element.className = 'toast toast--hidden';
  element.setAttribute('role', 'alert');
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-hidden', 'true');

  const message = document.createElement('span');
  message.className = 'toast__message';
  element.appendChild(message);

  return element;
}

/**
 * トーストを表示する。
 * @param {HTMLElement} element
 * @param {'success' | 'error'} type
 * @param {string} message
 */
export function showToast(element, type, message) {
  if (!element) {
    return;
  }

  const messageElement = element.querySelector('.toast__message');
  if (messageElement) {
    messageElement.textContent = message ?? '';
  }

  element.classList.remove('toast--success', 'toast--error');
  element.classList.add(`toast--${type}`);
  element.classList.remove('toast--hidden');
  element.classList.add('toast--visible');
  element.setAttribute('aria-hidden', 'false');
}

/**
 * トーストを非表示にする。
 * @param {HTMLElement} element
 */
export function hideToast(element) {
  if (!element) {
    return;
  }
  element.classList.remove('toast--visible');
  element.classList.add('toast--hidden');
  element.setAttribute('aria-hidden', 'true');
}

/**
 * トースト要素を削除する。
 * @param {HTMLElement} element
 */
export function removeToast(element) {
  if (!element) {
    return;
  }
  element.remove();
}
