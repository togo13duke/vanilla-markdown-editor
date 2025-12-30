const DEFAULT_AUTOSAVE_DELAY = 1000;

const createNoopController = () => ({
  schedule: () => {},
  cancel: () => {},
  saveNow: async () => {},
  destroy: () => {},
});

/**
 * 自動保存サービスを初期化する。
 * @param {Object} options
 * @param {() => Promise<void>} options.saveFunction - 保存関数
 * @param {() => void} [options.onSaveSuccess] - 保存成功時コールバック
 * @param {(error: Error) => void} [options.onSaveError] - 保存失敗時コールバック
 * @param {number} [options.delay=1000] - デバウンス間隔（ms）
 * @returns {{ schedule: () => void, cancel: () => void, saveNow: () => Promise<void>, destroy: () => void }}
 */
export function initAutosave(options) {
  if (!options || typeof options.saveFunction !== 'function') {
    console.error('自動保存の初期化に失敗しました。');
    return createNoopController();
  }

  const {
    saveFunction,
    onSaveSuccess,
    onSaveError,
    delay = DEFAULT_AUTOSAVE_DELAY,
  } = options;

  let timerId = null;
  let isDestroyed = false;

  const cancel = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const runSave = async (notify) => {
    try {
      await saveFunction();
      if (notify) {
        onSaveSuccess?.();
      }
    } catch (error) {
      if (notify) {
        onSaveError?.(error);
        return;
      }
      throw error;
    }
  };

  const schedule = () => {
    if (isDestroyed) {
      return;
    }
    cancel();
    timerId = window.setTimeout(() => {
      timerId = null;
      void runSave(true);
    }, delay);
  };

  const saveNow = async () => {
    if (isDestroyed) {
      return;
    }
    cancel();
    await runSave(false);
  };

  const destroy = () => {
    isDestroyed = true;
    cancel();
  };

  return {
    schedule,
    cancel,
    saveNow,
    destroy,
  };
}
