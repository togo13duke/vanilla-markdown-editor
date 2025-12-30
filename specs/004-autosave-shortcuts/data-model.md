# Data Model: 自動保存・デバウンス・ショートカット

**Feature**: 004-autosave-shortcuts
**Date**: 2025-12-28

## 1. 既存エンティティ（変更なし）

### FileEntity

Sprint 3で定義済み。本スプリントでは変更なし。

```javascript
{
  id: string,        // UUID
  title: string,     // ファイル名（例: "README.md"）
  content: string,   // Markdown本文
  createdAt: number, // epoch ms
  updatedAt: number, // epoch ms
  sortKey: number    // 並び順
}
```

## 2. アプリケーション状態（拡張）

### AppState

fileService.js内の`state`オブジェクトを拡張。

```javascript
const state = {
  // 既存（Sprint 3）
  files: FileEntity[],
  activeFile: FileEntity | null,
  isDirty: boolean,
  isDbAvailable: boolean,
  callbacks: {
    onFilesChanged: (files) => void,
    onActiveFileChanged: (file) => void,
    onError: (message) => void,
  },

  // 新規（Sprint 4）- fileService.jsに追加するコールバック
  // onSaveSuccess: () => void,    // 保存成功時
  // onSaveError: (message) => void // 保存失敗時
};
```

## 3. 新規エンティティ

### AutosaveState

autosaveService.js内で管理。

```javascript
{
  timerId: number | null,    // デバウンスタイマーID
  delay: number,             // デバウンス間隔（ms）
  lastSavedAt: number | null // 最後の保存時刻（epoch ms）
}
```

**状態遷移**:

- `IDLE`: timerId = null, 保存待機中
- `PENDING`: timerId != null, デバウンス中
- `SAVING`: 保存処理実行中（timerId = null）

### ToastState

toastService.js内で管理。

```javascript
{
  current: Toast | null,     // 現在表示中のトースト
  timerId: number | null     // 自動非表示タイマーID
}
```

### Toast

```javascript
{
  type: 'success' | 'error',
  message: string,
  duration: number  // 表示時間（ms）
}
```

**デフォルト値**:

- success: duration = 3000
- error: duration = 5000

### ShortcutConfig

shortcutService.js内で管理。

```javascript
{
  shortcuts: Map<string, ShortcutHandler>
}

// ShortcutHandler
{
  key: string,           // 'KeyS', 'KeyB' など
  modifiers: string[],   // ['meta'] or ['ctrl']
  handler: () => void,
  preventDefault: boolean
}
```

**登録されるショートカット**:
| キー | 修飾キー | アクション |
|------|----------|-----------|
| s | Cmd/Ctrl | 手動保存 |
| b | Cmd/Ctrl | 太字トグル |

## 4. コールバックインターフェース

### fileService拡張

```javascript
// 既存
onFilesChanged: (files: FileEntity[]) => void
onActiveFileChanged: (file: FileEntity | null) => void
onError: (message: string) => void

// 新規（Sprint 4）
onSaveSuccess: () => void
onSaveError: (message: string) => void
```

### autosaveService

```javascript
// 初期化時に渡すオプション
{
  saveFunction: () => Promise<void>, // fileService.saveCurrentFile
  onSaveSuccess: () => void,
  onSaveError: (error: Error) => void,
  delay: number                       // デバウンス間隔
}
```

### shortcutService

```javascript
// 初期化時に渡すオプション
{
  onSave: () => void,           // 手動保存
  onBold: (textarea) => void,   // 太字トグル
  editorElement: HTMLTextAreaElement
}
```

## 5. DOM構造（トースト）

```html
<!-- 動的に追加される -->
<div class="toast toast--success" role="alert">
  <span class="toast__message">保存しました</span>
</div>
```

**CSS Classes**:

- `.toast`: 基本スタイル（固定位置、右下）
- `.toast--success`: 成功時の色
- `.toast--error`: エラー時の色
- `.toast--visible`: 表示アニメーション
- `.toast--hidden`: 非表示アニメーション

## 6. 依存関係図

```
main.js
  ├── fileService.init()
  ├── autosaveService.init()
  │     └── fileService.saveCurrentFile()
  ├── shortcutService.init()
  │     ├── fileService.saveCurrentFile() [Cmd/Ctrl+S]
  │     └── editorService.toggleBold()    [Cmd/Ctrl+B]
  └── toastService.init()
        └── ui/toast.js

bindings.js
  └── autosaveService.scheduleAutoSave() [on input]
```
