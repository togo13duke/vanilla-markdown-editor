import { initPreview } from '../services/previewService.js';

export function initBindings(options = {}) {
  const { fileService } = options;
  const editorElement = document.querySelector('.editor-input');
  const previewElement = document.querySelector('.preview-content');
  const exportButton =
    document.querySelector('.file-export-button') ??
    document.querySelector('[data-action="export"]');

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
    if (fileService) {
      fileService.updateContent(editorElement.value);
    }
    previewController.update();
  };

  editorElement.addEventListener('input', handleInput);

  if (exportButton && fileService) {
    exportButton.addEventListener('click', () => {
      fileService.exportCurrentFile();
    });
  }

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
