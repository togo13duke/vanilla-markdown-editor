import './style.css';
import { initLayout } from './ui/layout.js';
import { initTheme } from './ui/theme.js';
import { initBindings } from './ui/bindings.js';
import {
  initFileList,
  renderFileList,
  setActiveFileId,
} from './ui/fileList.js';
import { fileService } from './services/fileService.js';
import { updatePreview } from './services/previewService.js';
import { initAutosave } from './services/autosaveService.js';
import { initShortcuts, toggleBold } from './services/shortcutService.js';
import { initToast } from './services/toastService.js';

initLayout();
initTheme();

const editorElement = document.querySelector('.editor-input');
const previewElement = document.querySelector('.preview-content');
const toastService = initToast();
const autosaveService = initAutosave({
  saveFunction: () => fileService.saveCurrentFile(),
  onSaveSuccess: () => toastService.showSuccess('保存しました'),
  onSaveError: () => toastService.showError('保存に失敗しました'),
  delay: 1000,
});

const showError = (message) => {
  if (!message) {
    return;
  }
  console.warn(message);
  window.alert(message);
};

const renderActiveFile = (file) => {
  if (!editorElement || !previewElement) {
    return;
  }

  if (!file) {
    editorElement.value = '';
    editorElement.setAttribute('disabled', '');
    previewElement.innerHTML = '<p>ファイルを選択または作成してください。</p>';
    return;
  }

  editorElement.removeAttribute('disabled');
  editorElement.value = file.content ?? '';
  updatePreview(editorElement.value, previewElement);
};

initFileList({
  onCreate: () => fileService.createFile(),
  onSelect: (id) => fileService.selectFile(id),
  onDelete: (id) => fileService.deleteFile(id),
  onRename: (title) => fileService.updateTitle(title),
});

initBindings({ fileService, autosaveService });

initShortcuts({
  editorElement,
  onSave: async () => {
    try {
      await autosaveService.saveNow();
      toastService.showSuccess('保存完了');
    } catch {
      toastService.showError('保存に失敗しました');
    }
  },
  onBold: () => {
    if (!editorElement) {
      return;
    }
    toggleBold(editorElement);
  },
});

fileService.init({
  onFilesChanged: (files) => renderFileList(files),
  onActiveFileChanged: (file) => {
    setActiveFileId(file?.id ?? null);
    autosaveService.cancel();
    renderActiveFile(file);
  },
  onError: (message) => showError(message),
});
