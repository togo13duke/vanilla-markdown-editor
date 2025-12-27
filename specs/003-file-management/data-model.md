# Data Model: ファイル管理機能

**Feature**: 003-file-management
**Date**: 2025-12-27

## Entities

### FileEntity

Markdown ファイルを表すメインエンティティ。IndexedDB の `files` ObjectStore に保存される。

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | string | ファイルの一意識別子 | UUID v4形式、keyPath |
| title | string | ファイル名 | 空文字不可、デフォルト「無題」 |
| content | string | Markdown本文 | 空文字許可 |
| createdAt | number | 作成日時 (epoch ms) | 作成時に自動設定 |
| updatedAt | number | 更新日時 (epoch ms) | 更新時に自動更新、インデックス対象 |
| sortKey | number | ソート順 (epoch ms) | 将来のカスタムソート用 |

### Validation Rules

```javascript
const FileEntityValidation = {
  id: {
    required: true,
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  title: {
    required: true,
    minLength: 1,
    maxLength: 255,
    default: '無題'
  },
  content: {
    required: false,
    default: ''
  },
  createdAt: {
    required: true,
    type: 'number'
  },
  updatedAt: {
    required: true,
    type: 'number'
  },
  sortKey: {
    required: true,
    type: 'number'
  }
};
```

## State Management

### Application State

アプリケーション全体の状態を管理する。メモリ内で保持し、UIと同期する。

```javascript
const AppState = {
  files: [],           // FileEntity[] - 全ファイルリスト（updatedAt降順）
  activeFileId: null,  // string | null - 現在編集中のファイルID
  isDbAvailable: true, // boolean - IndexedDB利用可能フラグ
  isDirty: false       // boolean - 未保存変更フラグ
};
```

### State Transitions

```
[初期化]
  ├─> IndexedDB利用可能
  │     └─> 全ファイル読み込み
  │           ├─> ファイルあり -> 最新ファイルをアクティブに
  │           └─> ファイルなし -> 空状態表示
  └─> IndexedDB利用不可
        └─> 警告表示、メモリモード

[ファイル作成]
  新規FileEntity生成
    └─> IndexedDB保存
          └─> リスト更新
                └─> 新規ファイルをアクティブに

[ファイル切替]
  現在のファイルを保存
    └─> 新しいファイルを読み込み
          └─> エディタ更新
                └─> activeFileId更新

[ファイル削除]
  確認ダイアログ表示
    ├─> 確認 -> IndexedDB削除 -> リスト更新 -> 次のファイルをアクティブに
    └─> キャンセル -> 何もしない

[ファイル名変更]
  title更新
    └─> IndexedDB保存
          └─> リスト更新
```

## Indexes

### IndexedDB Schema

```javascript
// Database: markdown-editor
// Version: 1

// ObjectStore: files
{
  keyPath: 'id',
  autoIncrement: false,
  indexes: [
    {
      name: 'updatedAt',
      keyPath: 'updatedAt',
      options: { unique: false }
    }
  ]
}
```

### Query Patterns

| 操作 | メソッド | インデックス使用 |
|------|----------|------------------|
| 全件取得（更新順） | `index('updatedAt').openCursor(null, 'prev')` | ✅ updatedAt |
| ID検索 | `get(id)` | ✅ keyPath |
| 作成 | `put(entity)` | - |
| 更新 | `put(entity)` | - |
| 削除 | `delete(id)` | ✅ keyPath |

## Relationships

```
AppState
    │
    ├── files: FileEntity[] (1:N)
    │     └── 全ファイルのリスト
    │
    └── activeFileId ──references──> FileEntity.id
          └── 現在編集中のファイル（0..1）
```

## Factory Functions

### createFileEntity

新規ファイル作成時のファクトリー関数。

```javascript
/**
 * 新規FileEntityを作成する
 * @param {Partial<FileEntity>} overrides - 上書きするフィールド
 * @returns {FileEntity}
 */
function createFileEntity(overrides = {}) {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: '無題',
    content: '',
    createdAt: now,
    updatedAt: now,
    sortKey: now,
    ...overrides
  };
}
```

### updateFileEntity

既存ファイル更新時のヘルパー関数。

```javascript
/**
 * FileEntityを更新する（updatedAtを自動更新）
 * @param {FileEntity} entity - 更新対象
 * @param {Partial<FileEntity>} changes - 変更内容
 * @returns {FileEntity}
 */
function updateFileEntity(entity, changes) {
  return {
    ...entity,
    ...changes,
    updatedAt: Date.now()
  };
}
```

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    UI       │────>│  Service    │────>│ Repository  │
│ (fileList)  │     │(fileService)│     │(fileRepo)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   ▼
       │                   │            ┌─────────────┐
       │                   │            │  IndexedDB  │
       │                   │            │   (files)   │
       │                   │            └─────────────┘
       │                   │                   │
       │                   ◄───────────────────┘
       │                   │
       ◄───────────────────┘
       │
       ▼
  DOM更新（ファイルリスト、エディタ）
```
