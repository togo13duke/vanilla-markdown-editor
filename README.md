# Vanilla Markdown Editor

## 概要

ブラウザのみで完結する、軽量なMarkdownエディタです。外部フレームワーク（ReactやVueなど）は使わず、**HTML、CSS、Vanilla JavaScript (ES2020+)** で構築します。

このリポジトリはスプリント形式で段階的に機能追加します。現時点では「UIレイアウト（3ペイン / モバイル縮退 / ダークモード）」までが実装済みです。

## 主な機能

### 現在の実装範囲（UIレイアウト）

- **3ペインレイアウト**: Files / Editor / Preview を横並び表示（幅600px以上）
- **モバイル縮退**: 幅600px未満ではSidebarを隠し、Editor/Previewをタブで切り替え
- **ダークモード**: OSの `prefers-color-scheme` に連動（変更時はリロード不要）

## 技術スタック

- **言語**:
  - HTML5 (セマンティックな構造)
  - CSS3 (Grid, Flexbox, CSS Variables)
  - JavaScript (ES2020+, ES Modules)
- **Web APIs**:
  - **ResizeObserver**: ブレークポイント（600px）でのレイアウト切替
  - **matchMedia**: システムテーマ検出（`prefers-color-scheme`）
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

## プロジェクト構造

```
.
├── src/
│   ├── main.js           # アプリケーションのエントリーポイント
│   ├── style.css         # グローバルスタイル・テーマ定義
│   └── ui/               # レイアウト/テーマ管理
├── docs/                 # ドキュメント (要件定義、技術仕様、進捗など)
├── specs/                # 詳細仕様書
├── index.html            # メインのHTMLファイル
└── package.json          # プロジェクト設定・依存関係
```

## アーキテクチャ

このプロジェクトは「関心の分離」を重視して設計されています。

- **UI層**: DOM操作とイベントハンドリング
- **Service層**: アプリロジック（Markdown変換、自動保存など）※今後追加
- **Repository層**: 永続化（IndexedDB）※今後追加
- **Workers**: 重い処理（Markdownパース）※今後追加

## ライセンス

Unlicensed (または各開発者の規定に従います)
