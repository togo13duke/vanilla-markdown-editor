const isModifierPressed = (event) => event.metaKey || event.ctrlKey;

const normalizeKey = (key) => key?.toLowerCase?.() ?? '';

/**
 * テキストを太字でラップする。
 * @param {HTMLTextAreaElement} textarea
 */
export function toggleBold(textarea) {
  if (!textarea) {
    return;
  }

  const { selectionStart, selectionEnd, value } = textarea;
  if (selectionStart == null || selectionEnd == null) {
    return;
  }

  if (selectionStart === selectionEnd) {
    const insertValue = '****';
    textarea.value =
      value.slice(0, selectionStart) + insertValue + value.slice(selectionEnd);
    const cursor = selectionStart + 2;
    textarea.setSelectionRange(cursor, cursor);
    return;
  }

  const selectedText = value.slice(selectionStart, selectionEnd);
  const isWrapped =
    selectedText.startsWith('**') &&
    selectedText.endsWith('**') &&
    selectedText.length >= 4;

  if (isWrapped) {
    const unwrapped = selectedText.slice(2, -2);
    textarea.value =
      value.slice(0, selectionStart) + unwrapped + value.slice(selectionEnd);
    textarea.setSelectionRange(
      selectionStart,
      selectionStart + unwrapped.length
    );
    return;
  }

  const wrapped = `**${selectedText}**`;
  textarea.value =
    value.slice(0, selectionStart) + wrapped + value.slice(selectionEnd);
  textarea.setSelectionRange(selectionStart, selectionStart + wrapped.length);
}

const createNoopController = () => ({
  destroy: () => {},
});

/**
 * ショートカットサービスを初期化する。
 * @param {Object} options
 * @param {HTMLTextAreaElement} options.editorElement - エディタ要素
 * @param {() => Promise<void>} options.onSave - 保存ハンドラ
 * @param {(selection: {start: number, end: number, text: string}) => void} options.onBold - 太字ハンドラ
 * @returns {{ destroy: () => void }}
 */
export function initShortcuts(options) {
  if (!options || !options.editorElement) {
    console.error('ショートカットの初期化に失敗しました。');
    return createNoopController();
  }

  const { editorElement, onSave, onBold } = options;

  const handleKeydown = (event) => {
    if (!isModifierPressed(event)) {
      return;
    }

    const key = normalizeKey(event.key);

    if (key === 's') {
      event.preventDefault();
      if (onSave) {
        Promise.resolve(onSave()).catch((error) => {
          console.error('手動保存に失敗しました。', error);
        });
      }
      return;
    }

    if (key === 'b' && document.activeElement === editorElement) {
      event.preventDefault();
      const selection = {
        start: editorElement.selectionStart ?? 0,
        end: editorElement.selectionEnd ?? 0,
        text: editorElement.value.slice(
          editorElement.selectionStart ?? 0,
          editorElement.selectionEnd ?? 0
        ),
      };
      if (onBold) {
        onBold(selection);
      } else {
        toggleBold(editorElement);
      }
      editorElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  document.addEventListener('keydown', handleKeydown);

  return {
    destroy: () => document.removeEventListener('keydown', handleKeydown),
  };
}
