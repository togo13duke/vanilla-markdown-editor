const EMPTY_MESSAGE = 'ファイルがありません。「＋」で新規作成してください。';

const state = {
  listElement: null,
  newButton: null,
  exportButton: null,
  activeFileId: null,
  handlers: {
    onCreate: null,
    onSelect: null,
    onDelete: null,
    onRename: null,
  },
};

const ensureExportButton = () => {
  if (state.exportButton) {
    return;
  }
  const header = document.querySelector('.sidebar .pane-header');
  if (!header) {
    return;
  }
  const actions = header.querySelector('.file-actions') ?? header;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'icon-button file-export-button';
  button.setAttribute('aria-label', 'ファイルをエクスポート');
  button.textContent = '↓';
  actions.appendChild(button);
  state.exportButton = button;
};

const handleListClick = (event) => {
  const deleteButton = event.target.closest('.file-delete-button');
  if (deleteButton) {
    const item = deleteButton.closest('.file-item');
    const id = item?.dataset.fileId;
    if (!id) {
      return;
    }
    const title = item?.dataset.fileTitle ?? '無題';
    const confirmed = window.confirm(`「${title}」を削除しますか？`);
    if (confirmed) {
      state.handlers.onDelete?.(id);
    }
    return;
  }

  const item = event.target.closest('.file-item');
  if (!item || item.dataset.editing === 'true') {
    return;
  }
  const id = item.dataset.fileId;
  if (id) {
    state.handlers.onSelect?.(id);
  }
};

const finishInlineEdit = (item, input, originalTitle, commit) => {
  if (!item || item.dataset.editing !== 'true') {
    return;
  }
  const nextTitle = commit
    ? input.value.trim() || '無題'
    : originalTitle;
  const nameSpan = document.createElement('span');
  nameSpan.className = 'file-name';
  nameSpan.textContent = nextTitle;
  nameSpan.title = nextTitle;
  input.replaceWith(nameSpan);
  item.dataset.editing = 'false';
  if (commit && nextTitle !== originalTitle) {
    state.handlers.onRename?.(nextTitle);
  }
};

const startInlineEdit = (item) => {
  if (!item || item.dataset.editing === 'true') {
    return;
  }
  const nameSpan = item.querySelector('.file-name');
  if (!nameSpan) {
    return;
  }
  const originalTitle = nameSpan.textContent ?? '無題';
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'file-name-input';
  input.value = originalTitle;
  input.setAttribute('aria-label', 'ファイル名を編集');
  item.dataset.editing = 'true';
  nameSpan.replaceWith(input);
  input.focus();
  input.select();

  const handleKeydown = (event) => {
    if (event.key === 'Enter') {
      finishInlineEdit(item, input, originalTitle, true);
    }
    if (event.key === 'Escape') {
      finishInlineEdit(item, input, originalTitle, false);
    }
  };

  const handleBlur = () => {
    finishInlineEdit(item, input, originalTitle, true);
  };

  input.addEventListener('keydown', handleKeydown);
  input.addEventListener('blur', handleBlur, { once: true });
};

const handleListDblClick = (event) => {
  const item = event.target.closest('.file-item');
  if (!item) {
    return;
  }
  const id = item.dataset.fileId;
  if (!id) {
    return;
  }
  if (state.activeFileId && state.activeFileId !== id) {
    state.handlers.onSelect?.(id);
    return;
  }
  startInlineEdit(item);
};

export function initFileList(handlers = {}) {
  state.handlers = {
    ...state.handlers,
    ...handlers,
  };

  state.listElement = document.querySelector('.file-list');
  state.newButton = document.querySelector('.new-file-button');
  state.exportButton = document.querySelector('.file-export-button');
  ensureExportButton();

  if (!state.listElement) {
    console.error('ファイルリスト要素が見つかりません。');
    return null;
  }

  if (state.newButton) {
    state.newButton.addEventListener('click', () => {
      state.handlers.onCreate?.();
    });
  }

  state.listElement.addEventListener('click', handleListClick);
  state.listElement.addEventListener('dblclick', handleListDblClick);

  return {
    destroy: () => {
      if (state.newButton) {
        state.newButton.replaceWith(state.newButton.cloneNode(true));
      }
      state.listElement.replaceWith(state.listElement.cloneNode(true));
    },
  };
}

export function setActiveFileId(id) {
  state.activeFileId = id;
  if (!state.listElement) {
    return;
  }
  state.listElement.querySelectorAll('.file-item').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.fileId === id);
  });
}

export function renderFileList(files = []) {
  if (!state.listElement) {
    return;
  }
  state.listElement.innerHTML = '';

  if (files.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'file-item file-item-empty';
    emptyItem.textContent = EMPTY_MESSAGE;
    state.listElement.appendChild(emptyItem);
    return;
  }

  files.forEach((file) => {
    const item = document.createElement('li');
    item.className = 'file-item';
    item.dataset.fileId = file.id;
    item.dataset.fileTitle = file.title;
    if (file.id === state.activeFileId) {
      item.classList.add('is-active');
    }

    const nameSpan = document.createElement('span');
    nameSpan.className = 'file-name';
    nameSpan.textContent = file.title;
    nameSpan.title = file.title;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'file-delete-button';
    deleteButton.textContent = '×';
    deleteButton.setAttribute('aria-label', `${file.title}を削除`);

    item.appendChild(nameSpan);
    item.appendChild(deleteButton);
    state.listElement.appendChild(item);
  });
}
