# Vanilla Markdown Editor

## 概要

ブラウザのみで完結する、軽量なMarkdownエディタです。外部フレームワーク（ReactやVueなど）は使わず、**HTML、CSS、Vanilla JavaScript (ES2020+)** で構築します。

このリポジトリはスプリント形式で段階的に機能追加します。現時点では「UIレイアウト」「Markdownパーサ（リアルタイムプレビュー + XSS対策）」「ファイル管理（作成/切替/削除/リネーム/エクスポート/永続化）」までが実装済みです。

## 主な機能

### 現在の実装範囲

#### UIレイアウト

- **3ペインレイアウト**: Files / Editor / Preview を横並び表示（幅600px以上）
- **モバイル縮退**: 幅600px未満ではSidebarを隠し、Editor/Previewをタブで切り替え
- **ダークモード**: OSの `prefers-color-scheme` に連動（変更時はリロード不要）

#### Markdownパーサ（サブセット）

- **リアルタイムプレビュー**: 入力に追従してプレビューを更新（デバウンスあり）
- **対応記法**: 見出し（#〜######）、段落、改行、太字（`**text**`）、斜体（`*text*`）、リンク（`[text](url)`）、インラインコード（`` `code` ``）、コードブロック（```）
- **XSS対策**: 生HTMLは無効化（エスケープ・ファースト）、危険なURL（`javascript:`等）は拒否

#### ファイル管理

- **複数ファイル管理**: 作成/切替/削除/リネーム
- **永続化**: IndexedDBでブラウザ再起動後も復元
- **エクスポート**: アクティブファイルを `.md` でダウンロード

## 技術スタック

- **言語**:
  - HTML5 (セマンティックな構造)
  - CSS3 (Grid, Flexbox, CSS Variables)
  - JavaScript (ES2020+, ES Modules)
- **Web APIs**:
  - **ResizeObserver**: ブレークポイント（600px）でのレイアウト切替
  - **matchMedia**: システムテーマ検出（`prefers-color-scheme`）
  - **IndexedDB**: ファイルの永続化
- **開発ツール**:
  - **Vite**: 開発サーバーおよびビルドツール
  - **ESLint / Prettier**: コード品質とフォーマット管理

## セットアップと実行

このプロジェクトをローカル環境で実行するには、Node.jsが必要です。

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd vanilla-markdown-editor
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

起動後、ブラウザで表示されるURL（通常は `http://localhost:5173`）にアクセスしてください。

### 4. Lint & Format

```bash
npm run lint
npm run format
```

## 手動確認（チェックポイント）

- **HMR**: `src/style.css` を変更して保存 → ブラウザがリロードなしで反映される
- **レスポンシブ**: ブラウザ幅を600px未満/以上で切替 → モードが自動で切り替わる
- **境界値**: 600pxちょうど、最小幅320pxでもレイアウトが破綻しない
- **ダークモード**: OS設定を切替 → リロードなしで配色が変わる
- **Markdownプレビュー**: `# 見出し` や `**太字**` 等がプレビューに反映される
- **XSS対策**: `<script>alert('XSS')</script>` が実行されず文字として表示される
- **ファイル管理**: 新規作成→切替→削除→リネームが反映される
- **永続化**: リロード後もファイルが復元される
- **エクスポート**: ファイルが `.md` でダウンロードされる

## プロジェクト構造

```
.
├── src/
│   ├── main.js           # アプリケーションのエントリーポイント
│   ├── style.css         # グローバルスタイル・テーマ定義
│   ├── repositories/     # IndexedDB永続化
│   ├── services/         # Markdown/プレビュー/ファイル操作
│   └── ui/               # レイアウト/テーマ/ファイルリスト
├── docs/                 # ドキュメント (要件定義、技術仕様、進捗など)
├── specs/                # 詳細仕様書
├── index.html            # メインのHTMLファイル
└── package.json          # プロジェクト設定・依存関係
```

## アーキテクチャ

このプロジェクトは「関心の分離」を重視して設計されています。

- **UI層**: DOM操作とイベントハンドリング
- **Service層**: アプリロジック（Markdown変換、プレビュー更新、自動保存など）
- **Repository層**: 永続化（IndexedDB）
- **Workers**: 重い処理（Markdownパース）※今後追加

## ライセンス

Unlicensed (または各開発者の規定に従います)
