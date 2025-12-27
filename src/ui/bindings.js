import { initPreview } from '../services/previewService.js';

export function initBindings() {
  const editorElement = document.querySelector('.editor-input');
  const previewElement = document.querySelector('.preview-content');

  if (!editorElement || !previewElement) {
    console.error('エディタまたはプレビュー要素が見つかりません。');
    return null;
  }

  const previewController = initPreview({
    editorElement,
    previewElement,
    debounceDelay: 150,
  });

  const handleInput = () => {
    previewController.update();
  };

  editorElement.addEventListener('input', handleInput);

  if (editorElement.value.trim() !== '') {
    previewController.update();
  }

  return {
    destroy: () => {
      editorElement.removeEventListener('input', handleInput);
      previewController.destroy();
    },
  };
}
