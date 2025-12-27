import { parse } from './markdownService.js';

const DEFAULT_DEBOUNCE_DELAY = 150;

const createNoopController = () => ({
  update: () => {},
  destroy: () => {},
});

const debounce = (callback, delay) => {
  let timerId = null;

  const debounced = (...args) => {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  debounced.cancel = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
};

/**
 * プレビュー要素へMarkdownの解析結果を反映する。
 * @param {string} markdown
 * @param {HTMLElement} targetElement
 */
export function updatePreview(markdown, targetElement) {
  if (!targetElement) {
    console.error('プレビュー要素が見つかりません。');
    return;
  }
  const result = parse(markdown);
  targetElement.innerHTML = result.html;
}

/**
 * プレビュー更新用のコントローラを生成する。
 * @param {{ editorElement: HTMLTextAreaElement, previewElement: HTMLElement, debounceDelay?: number }} options
 * @returns {{ update: () => void, destroy: () => void }}
 */
export function initPreview(options) {
  if (!options) {
    console.error('プレビュー初期化の設定が不足しています。');
    return createNoopController();
  }

  const { editorElement, previewElement, debounceDelay } = options;

  if (!editorElement || !previewElement) {
    console.error('エディタまたはプレビュー要素が見つかりません。');
    return createNoopController();
  }

  const updateNow = () => updatePreview(editorElement.value, previewElement);
  const update = debounce(updateNow, debounceDelay ?? DEFAULT_DEBOUNCE_DELAY);

  return {
    update,
    destroy: () => {
      update.cancel();
    },
  };
}
