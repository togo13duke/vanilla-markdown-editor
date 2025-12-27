# Contract: FileService

**Feature**: 003-file-management
**Date**: 2025-12-27
**Layer**: Service（ビジネスロジック層）

## Overview

ファイル操作のビジネスロジックを提供する。Repository 層を呼び出し、状態管理と UI 更新のためのコールバックを実行する。

## Interface

```typescript
interface FileServiceCallbacks {
  onFilesChanged: (files: FileEntity[]) => void;
  onActiveFileChanged: (file: FileEntity | null) => void;
  onError: (message: string) => void;
}

interface FileService {
  /**
   * サービスを初期化する
   * @param callbacks - UI更新用コールバック
   * @returns 初期化成功時は true
   */
  init(callbacks: FileServiceCallbacks): Promise<boolean>;

  /**
   * 新規ファイルを作成し、アクティブにする
   * @returns 作成されたファイル
   */
  createFile(): Promise<FileEntity>;

  /**
   * ファイルを選択し、アクティブにする
   * @param id - 選択するファイルID
   */
  selectFile(id: string): Promise<void>;

  /**
   * 現在のファイルの内容を更新する（保存はしない）
   * @param content - 新しい内容
   */
  updateContent(content: string): void;

  /**
   * 現在のファイルのタイトルを更新する
   * @param title - 新しいタイトル
   */
  updateTitle(title: string): Promise<void>;

  /**
   * 現在のファイルを保存する
   */
  saveCurrentFile(): Promise<void>;

  /**
   * ファイルを削除する
   * @param id - 削除するファイルID
   */
  deleteFile(id: string): Promise<void>;

  /**
   * 現在のファイルをエクスポート（ダウンロード）する
   */
  exportCurrentFile(): void;

  /**
   * 現在のアクティブファイルを取得する
   */
  getActiveFile(): FileEntity | null;

  /**
   * 全ファイルリストを取得する
   */
  getFiles(): FileEntity[];
}
```

## Behavior Specifications

### init(callbacks)

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| 正常初期化 | 有効なコールバック | `true` | Repository 初期化、ファイル読み込み |
| DB 利用不可 | 有効なコールバック | `false` | onError コールバック実行 |
| ファイルあり | - | `true` | 最新ファイルをアクティブに |
| ファイルなし | - | `true` | activeFile = null |

### createFile()

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| 正常作成 | - | `FileEntity` | 現在のファイル保存、新規作成、アクティブ化 |
| 保存失敗 | - | Error throw | onError コールバック |

### selectFile(id)

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| 正常選択 | 有効なID | - | 現在のファイル保存、指定ファイル読み込み |
| 同じファイル | 現在のID | - | 何もしない |
| 存在しないID | 無効なID | - | onError コールバック |

### updateContent(content)

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| 正常更新 | 文字列 | - | メモリ上の内容更新、isDirty = true |
| ファイルなし | 文字列 | - | 何もしない |

### updateTitle(title)

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| 正常更新 | 有効な文字列 | - | タイトル更新、保存、リスト更新 |
| 空文字 | "" | - | デフォルト「無題」に設定 |
| ファイルなし | 文字列 | - | 何もしない |

### saveCurrentFile()

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| 正常保存 | - | - | DB 更新、isDirty = false |
| ファイルなし | - | - | 何もしない |
| 変更なし | - | - | 何もしない（isDirty = false） |

### deleteFile(id)

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| 正常削除 | 有効なID | - | DB 削除、リスト更新 |
| アクティブファイル削除 | 現在のID | - | 次のファイルをアクティブに |
| 最後のファイル削除 | 唯一のファイルID | - | activeFile = null |

### exportCurrentFile()

| Scenario | Input | Expected Output | Side Effects |
|----------|-------|-----------------|--------------|
| 正常エクスポート | - | - | .md ファイルダウンロード |
| ファイルなし | - | - | 何もしない |

## State Management

```javascript
// 内部状態
const state = {
  files: [],           // FileEntity[]
  activeFile: null,    // FileEntity | null
  isDirty: false,      // boolean
  callbacks: null      // FileServiceCallbacks
};
```

## Event Flow

### ファイル作成フロー
```
createFile()
  ├─> saveCurrentFile() // 現在のファイルを保存
  ├─> repository.create() // 新規ファイル作成
  ├─> repository.getAll() // リスト更新
  ├─> callbacks.onFilesChanged() // UI更新
  └─> callbacks.onActiveFileChanged() // エディタ更新
```

### ファイル切替フロー
```
selectFile(id)
  ├─> saveCurrentFile() // 現在のファイルを保存
  ├─> repository.getById(id) // ファイル読み込み
  ├─> state.activeFile = file
  └─> callbacks.onActiveFileChanged() // エディタ更新
```

### ファイル削除フロー
```
deleteFile(id)
  ├─> repository.delete(id) // DB削除
  ├─> repository.getAll() // リスト更新
  ├─> callbacks.onFilesChanged() // UI更新
  ├─> 削除ファイルがアクティブ?
  │     ├─> YES: 次のファイルをアクティブに
  │     └─> NO: 何もしない
  └─> callbacks.onActiveFileChanged() // エディタ更新
```

## Usage Example

```javascript
import { fileService } from './services/fileService.js';

// 初期化
await fileService.init({
  onFilesChanged: (files) => renderFileList(files),
  onActiveFileChanged: (file) => renderEditor(file),
  onError: (message) => showToast(message)
});

// ファイル作成
const newFile = await fileService.createFile();

// 内容更新（エディタ入力時）
fileService.updateContent(editorValue);

// ファイル選択（リストクリック時）
await fileService.selectFile(fileId);

// タイトル変更
await fileService.updateTitle('README');

// エクスポート
fileService.exportCurrentFile();

// 削除
await fileService.deleteFile(fileId);
```
