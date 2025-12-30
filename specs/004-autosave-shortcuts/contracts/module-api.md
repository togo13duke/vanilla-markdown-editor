# Module API Contracts: 自動保存・デバウンス・ショートカット

**Feature**: 004-autosave-shortcuts
**Date**: 2025-12-28

## 1. autosaveService.js

### 概要

自動保存のスケジューリングとデバウンスを管理する。

### エクスポート

```javascript
/**
 * 自動保存サービスを初期化する。
 * @param {Object} options
 * @param {() => Promise<void>} options.saveFunction - 保存関数
 * @param {() => void} options.onSaveSuccess - 保存成功時コールバック
 * @param {(error: Error) => void} options.onSaveError - 保存失敗時コールバック
 * @param {number} [options.delay=1000] - デバウンス間隔（ms）
 * @returns {AutosaveController}
 */
export function initAutosave(options)

/**
 * @typedef {Object} AutosaveController
 * @property {() => void} schedule - 自動保存をスケジュール
 * @property {() => void} cancel - 保留中の保存をキャンセル
 * @property {() => Promise<void>} saveNow - 即座に保存
 * @property {() => void} destroy - クリーンアップ
 */
```

### 使用例

```javascript
import { initAutosave } from './services/autosaveService.js';

const autosave = initAutosave({
  saveFunction: () => fileService.saveCurrentFile(),
  onSaveSuccess: () => toastService.showSuccess('保存しました'),
  onSaveError: (err) => toastService.showError('保存に失敗しました'),
  delay: 1000,
});

// 入力時に呼び出し
autosave.schedule();

// 手動保存時
await autosave.saveNow();

// クリーンアップ
autosave.destroy();
```

---

## 2. shortcutService.js

### 概要

キーボードショートカットを管理する。

### エクスポート

```javascript
/**
 * ショートカットサービスを初期化する。
 * @param {Object} options
 * @param {HTMLTextAreaElement} options.editorElement - エディタ要素
 * @param {() => Promise<void>} options.onSave - 保存ハンドラ
 * @param {(selection: {start: number, end: number, text: string}) => void} options.onBold - 太字ハンドラ
 * @returns {ShortcutController}
 */
export function initShortcuts(options)

/**
 * @typedef {Object} ShortcutController
 * @property {() => void} destroy - イベントリスナーを削除
 */

/**
 * テキストを太字でラップする。
 * @param {HTMLTextAreaElement} textarea
 */
export function toggleBold(textarea)
```

### 使用例

```javascript
import { initShortcuts, toggleBold } from './services/shortcutService.js';

const shortcuts = initShortcuts({
  editorElement: document.querySelector('.editor-input'),
  onSave: async () => {
    await fileService.saveCurrentFile();
    toastService.showSuccess('保存完了');
  },
  onBold: (selection) => {
    toggleBold(editorElement);
    // input イベントを発火させてプレビュー更新
    editorElement.dispatchEvent(new Event('input'));
  },
});

// クリーンアップ
shortcuts.destroy();
```

---

## 3. toastService.js

### 概要

トースト通知のビジネスロジックを管理する。

### エクスポート

```javascript
/**
 * トーストサービスを初期化する。
 * @param {Object} [options]
 * @param {number} [options.successDuration=3000] - 成功通知の表示時間
 * @param {number} [options.errorDuration=5000] - エラー通知の表示時間
 * @returns {ToastController}
 */
export function initToast(options)

/**
 * @typedef {Object} ToastController
 * @property {(message: string) => void} showSuccess - 成功通知を表示
 * @property {(message: string) => void} showError - エラー通知を表示
 * @property {() => void} hide - 通知を非表示
 * @property {() => void} destroy - クリーンアップ
 */
```

### 使用例

```javascript
import { initToast } from './services/toastService.js';

const toast = initToast({
  successDuration: 3000,
  errorDuration: 5000,
});

// 成功通知
toast.showSuccess('保存しました');

// エラー通知
toast.showError('保存に失敗しました');

// クリーンアップ
toast.destroy();
```

---

## 4. ui/toast.js

### 概要

トースト通知のDOM操作を担当する。

### エクスポート

```javascript
/**
 * トーストDOM要素を作成する。
 * @returns {HTMLElement}
 */
export function createToastElement()

/**
 * トーストを表示する。
 * @param {HTMLElement} element
 * @param {'success' | 'error'} type
 * @param {string} message
 */
export function showToast(element, type, message)

/**
 * トーストを非表示にする。
 * @param {HTMLElement} element
 */
export function hideToast(element)

/**
 * トースト要素を削除する。
 * @param {HTMLElement} element
 */
export function removeToast(element)
```

---

## 5. fileService.js（拡張）

### 変更点

既存の`init`関数のコールバックオプションを拡張。

```javascript
// 既存
callbacks: {
  onFilesChanged: (files) => void,
  onActiveFileChanged: (file) => void,
  onError: (message) => void,
}

// 拡張（Sprint 4）
callbacks: {
  onFilesChanged: (files) => void,
  onActiveFileChanged: (file) => void,
  onError: (message) => void,
  onSaveSuccess: () => void,      // NEW
  onSaveError: (message) => void  // NEW（onErrorと別に呼び出し）
}
```

### saveCurrentFile の変更

```javascript
// 保存成功時に onSaveSuccess を呼び出し
// 保存失敗時に onSaveError を呼び出し（onErrorも呼び出す）
async saveCurrentFile() {
  // ...
  try {
    // 保存処理
    state.callbacks.onSaveSuccess?.();
  } catch (error) {
    state.callbacks.onSaveError?.(error.message);
    state.callbacks.onError('保存に失敗しました。');
    throw error;
  }
}
```

---

## 6. bindings.js（拡張）

### 変更点

```javascript
/**
 * バインディングを初期化する。
 * @param {Object} options
 * @param {Object} options.fileService
 * @param {Object} options.autosaveService - NEW
 * @returns {BindingsController}
 */
export function initBindings(options)
```

### handleInput の変更

```javascript
const handleInput = () => {
  if (fileService) {
    fileService.updateContent(editorElement.value);
  }
  previewController.update();

  // NEW: 自動保存をスケジュール
  if (autosaveService) {
    autosaveService.schedule();
  }
};
```
