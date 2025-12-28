import './style.css';
import { initLayout } from './ui/layout.js';
import { initTheme } from './ui/theme.js';
import { initBindings } from './ui/bindings.js';
import { initFileList, renderFileList, setActiveFileId } from './ui/fileList.js';
import { fileService } from './services/fileService.js';
import { updatePreview } from './services/previewService.js';

initLayout();
initTheme();

const editorElement = document.querySelector('.editor-input');
const previewElement = document.querySelector('.preview-content');

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
    previewElement.innerHTML =
      '<p>ファイルを選択または作成してください。</p>';
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

initBindings({ fileService });

fileService.init({
  onFilesChanged: (files) => renderFileList(files),
  onActiveFileChanged: (file) => {
    setActiveFileId(file?.id ?? null);
    renderActiveFile(file);
  },
  onError: (message) => showError(message),
});
