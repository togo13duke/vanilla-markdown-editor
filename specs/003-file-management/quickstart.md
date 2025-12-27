# Quickstart: ファイル管理機能

**Feature**: 003-file-management
**Date**: 2025-12-27

## 概要

この機能は、Markdown エディタで複数ファイルを作成・管理・永続化する機能を提供します。

## 前提条件

- Sprint 1（UIレイアウト）と Sprint 2（Markdownパーサ）が完了していること
- 開発サーバーが起動可能な状態（`npm run dev`）

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                         UI Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   bindings   │  │   fileList   │  │    layout    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘   │
│         │                 │                              │
└─────────┼─────────────────┼──────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                      Service Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ markdownSvc  │  │  fileService │  │  previewSvc  │   │
│  └──────────────┘  └──────┬───────┘  └──────────────┘   │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Repository Layer                      │
│                 ┌──────────────────┐                     │
│                 │  fileRepository  │                     │
│                 └────────┬─────────┘                     │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                       IndexedDB                          │
│                    (markdown-editor)                     │
│                    ObjectStore: files                    │
└─────────────────────────────────────────────────────────┘
```

## 実装手順

### Step 1: Repository 層の実装

`src/repositories/fileRepository.js` を作成し、IndexedDB 操作をカプセル化します。

主要メソッド:
- `init()` - DB 接続初期化
- `getAll()` - 全ファイル取得
- `getById(id)` - ID 検索
- `create(entity)` - ファイル作成
- `update(entity)` - ファイル更新
- `delete(id)` - ファイル削除

### Step 2: Service 層の実装

`src/services/fileService.js` を作成し、ビジネスロジックを実装します。

主要メソッド:
- `init(callbacks)` - サービス初期化
- `createFile()` - 新規ファイル作成
- `selectFile(id)` - ファイル選択
- `updateContent(content)` - 内容更新
- `updateTitle(title)` - タイトル変更
- `deleteFile(id)` - ファイル削除
- `exportCurrentFile()` - エクスポート

### Step 3: UI 層の実装

`src/ui/fileList.js` を作成し、ファイルリスト UI を実装します。

機能:
- ファイルリストのレンダリング
- 新規作成ボタン
- ファイル選択（クリック）
- ファイル名編集（ダブルクリック）
- 削除ボタン

### Step 4: 既存コードとの統合

`src/main.js` と `src/ui/bindings.js` を更新し、新機能を統合します。

## ファイル構成

```
src/
├── main.js                     # 更新: fileService 初期化追加
├── ui/
│   ├── bindings.js             # 更新: ファイル関連イベント追加
│   └── fileList.js             # 新規: ファイルリスト UI
├── services/
│   └── fileService.js          # 新規: ファイル操作ロジック
├── repositories/
│   └── fileRepository.js       # 新規: IndexedDB CRUD
└── utils/
    └── uuid.js                 # 新規: UUID 生成（省略可、crypto.randomUUID 直接使用）
```

## 動作確認手順

### 1. 基本動作

```bash
npm run dev
```

1. ブラウザで開く
2. 「+」ボタンでファイル作成
3. エディタに Markdown を入力
4. 別のファイルを作成
5. ファイルを切り替えて内容が保持されていることを確認

### 2. 永続化確認

1. ファイルを作成・編集
2. ブラウザをリロード（F5）
3. ファイルと内容が復元されていることを確認

### 3. 削除確認

1. ファイルの「×」ボタンをクリック
2. 確認ダイアログで「削除」を選択
3. ファイルがリストから消えることを確認

### 4. エクスポート確認

1. ファイルを編集
2. エクスポートボタンをクリック
3. `.md` ファイルがダウンロードされることを確認

## トラブルシューティング

### IndexedDB が利用できない

**症状**: 警告メッセージが表示される

**原因**:
- プライベートブラウジングモード
- ストレージアクセス権限の問題

**対処**:
- 通常モードで開く
- ブラウザの設定でストレージを許可

### ファイルが復元されない

**症状**: リロード後にファイルが消える

**原因**:
- 保存処理が完了前にリロード
- DB エラー

**対処**:
- DevTools > Application > IndexedDB で確認
- console.error を確認

## 関連ドキュメント

- [spec.md](./spec.md) - 機能仕様
- [plan.md](./plan.md) - 実装計画
- [research.md](./research.md) - 技術リサーチ
- [data-model.md](./data-model.md) - データモデル
- [contracts/file-repository.md](./contracts/file-repository.md) - Repository 契約
- [contracts/file-service.md](./contracts/file-service.md) - Service 契約
