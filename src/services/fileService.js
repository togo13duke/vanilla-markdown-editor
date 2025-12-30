import {
  createFileEntity,
  fileRepository,
  updateFileEntity,
} from '../repositories/fileRepository.js';

const defaultCallbacks = {
  onFilesChanged: () => {},
  onActiveFileChanged: () => {},
  onError: () => {},
  onSaveSuccess: () => {},
  onSaveError: () => {},
};

const state = {
  files: [],
  activeFile: null,
  isDirty: false,
  isDbAvailable: true,
  callbacks: { ...defaultCallbacks },
};

const sortFiles = (files) =>
  [...files].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

const replaceFile = (files, updated) =>
  files.map((file) => (file.id === updated.id ? updated : file));

const setFiles = (files) => {
  state.files = sortFiles(files);
  state.callbacks.onFilesChanged([...state.files]);
};

const setActiveFile = (file) => {
  state.activeFile = file;
  state.callbacks.onActiveFileChanged(file);
};

const normalizeCallbacks = (callbacks) => ({
  ...defaultCallbacks,
  ...(callbacks ?? {}),
});

export function downloadFile(filename, content) {
  const safeName = (filename ?? '無題').trim() || '無題';
  const finalName = safeName.toLowerCase().endsWith('.md')
    ? safeName
    : `${safeName}.md`;
  const blob = new Blob([content ?? ''], {
    type: 'text/markdown;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = finalName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export const fileService = {
  async init(callbacks) {
    state.callbacks = normalizeCallbacks(callbacks);

    const isAvailable = await fileRepository.init();
    state.isDbAvailable = isAvailable;

    if (!isAvailable) {
      state.files = [];
      state.activeFile = null;
      state.isDirty = false;
      state.callbacks.onFilesChanged([]);
      state.callbacks.onActiveFileChanged(null);
      state.callbacks.onError(
        'IndexedDBが利用できません。内容はこのセッションのみ保持されます。'
      );
      return false;
    }

    try {
      const files = await fileRepository.getAll();
      setFiles(files);
      if (files.length > 0) {
        setActiveFile(files[0]);
      } else {
        setActiveFile(null);
      }
      return true;
    } catch (error) {
      console.error('ファイル一覧の取得に失敗しました。', error);
      state.callbacks.onError('ファイル一覧の取得に失敗しました。');
      return false;
    }
  },

  async createFile() {
    try {
      await this.saveCurrentFile();
      const entity = createFileEntity();

      if (state.isDbAvailable) {
        await fileRepository.create(entity);
        const files = await fileRepository.getAll();
        setFiles(files);
        const active = files.find((file) => file.id === entity.id) ?? entity;
        setActiveFile(active);
      } else {
        setFiles([...state.files, entity]);
        setActiveFile(entity);
      }

      state.isDirty = false;
      return state.activeFile;
    } catch (error) {
      console.error('ファイル作成に失敗しました。', error);
      state.callbacks.onError('ファイル作成に失敗しました。');
      throw error;
    }
  },

  async selectFile(id) {
    if (!id) {
      state.callbacks.onError('ファイルIDが不正です。');
      return;
    }

    if (state.activeFile?.id === id) {
      return;
    }

    try {
      await this.saveCurrentFile();

      let file = null;
      if (state.isDbAvailable) {
        file = await fileRepository.getById(id);
      } else {
        file = state.files.find((item) => item.id === id) ?? null;
      }

      if (!file) {
        state.callbacks.onError('ファイルが見つかりません。');
        return;
      }

      state.isDirty = false;
      setActiveFile(file);
    } catch (error) {
      console.error('ファイル切替に失敗しました。', error);
      state.callbacks.onError('ファイル切替に失敗しました。');
    }
  },

  updateContent(content) {
    if (!state.activeFile) {
      return;
    }
    state.activeFile = {
      ...state.activeFile,
      content: content ?? '',
    };
    state.isDirty = true;
  },

  async updateTitle(title) {
    if (!state.activeFile) {
      return;
    }
    const nextTitle = title?.trim() || '無題';
    const updated = updateFileEntity(state.activeFile, { title: nextTitle });

    try {
      if (state.isDbAvailable) {
        await fileRepository.update(updated);
      }
      state.activeFile = updated;
      setFiles(replaceFile(state.files, updated));
      state.isDirty = false;
      setActiveFile(updated);
    } catch (error) {
      console.error('ファイル名の更新に失敗しました。', error);
      state.callbacks.onError('ファイル名の更新に失敗しました。');
    }
  },

  async saveCurrentFile() {
    if (!state.activeFile) {
      return;
    }
    if (!state.isDirty) {
      return;
    }

    const updated = updateFileEntity(state.activeFile);
    try {
      if (state.isDbAvailable) {
        await fileRepository.update(updated);
      }
      state.activeFile = updated;
      setFiles(replaceFile(state.files, updated));
      state.isDirty = false;
      state.callbacks.onSaveSuccess?.();
    } catch (error) {
      console.error('保存に失敗しました。', error);
      state.callbacks.onSaveError?.(
        error instanceof Error ? error.message : '保存に失敗しました。'
      );
      state.callbacks.onError('保存に失敗しました。');
      throw error;
    }
  },

  async deleteFile(id) {
    if (!id) {
      state.callbacks.onError('ファイルIDが不正です。');
      return;
    }

    try {
      if (state.isDbAvailable) {
        await fileRepository.delete(id);
        const files = await fileRepository.getAll();
        setFiles(files);
      } else {
        setFiles(state.files.filter((file) => file.id !== id));
      }

      if (state.activeFile?.id === id) {
        const nextActive = state.files[0] ?? null;
        state.isDirty = false;
        setActiveFile(nextActive);
      }
    } catch (error) {
      console.error('ファイル削除に失敗しました。', error);
      state.callbacks.onError('ファイル削除に失敗しました。');
    }
  },

  exportCurrentFile() {
    if (!state.activeFile) {
      return;
    }
    downloadFile(state.activeFile.title, state.activeFile.content);
  },

  getActiveFile() {
    return state.activeFile;
  },

  getFiles() {
    return state.files;
  },
};
