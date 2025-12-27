# Quickstart: UIレイアウトとプロジェクトセットアップ

**Feature**: 001-ui-layout-setup
**Date**: 2025-12-27

## 前提条件

- Node.js v18以上
- npm v9以上
- モダンブラウザ（Chrome, Firefox, Safari, Edge 最新版）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

## 開発コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動（HMR有効） |
| `npm run build` | 本番ビルド（`dist/`に出力） |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run lint` | ESLintでコード検査 |
| `npm run format` | Prettierで自動整形 |

## 動作確認チェックリスト

### Milestone 0: 開発環境

- [ ] `npm run dev` でサーバーが起動する
- [ ] ブラウザでアプリが表示される
- [ ] ファイル編集後、ブラウザが自動更新される（HMR）
- [ ] `npm run lint` がエラーなく完了する
- [ ] `npm run format` がエラーなく完了する

### Sprint 1: UIレイアウト

#### デスクトップ表示（幅600px以上）

- [ ] Headerが画面上部に表示される
- [ ] 3ペイン（Files / Editor / Preview）が横並びで表示される
- [ ] Editorにテキスト入力が可能

#### モバイル表示（幅600px未満）

- [ ] ブラウザ幅を縮小するとレイアウトが切り替わる
- [ ] Sidebarが非表示になる
- [ ] Editor/Previewの切替ボタンが表示される
- [ ] タブ切替でEditor/Previewが切り替わる
- [ ] 幅を広げると3ペインに戻る

#### ダークモード

- [ ] OSがダークモード設定の場合、暗い配色で表示される
- [ ] OSがライトモード設定の場合、明るい配色で表示される
- [ ] OS設定切替でリロードなしに配色が変わる

## ファイル構造

```
vanilla-markdown-editor/
├── index.html           # HTMLエントリポイント
├── src/
│   ├── main.js          # アプリエントリポイント
│   ├── style.css        # グローバルスタイル
│   └── ui/
│       ├── layout.js    # レイアウト制御
│       └── theme.js     # テーマ制御
├── vite.config.js       # Vite設定
├── eslint.config.js     # ESLint設定
├── .prettierrc          # Prettier設定
└── package.json         # 依存関係
```

## トラブルシューティング

### 開発サーバーが起動しない

1. Node.jsのバージョンを確認: `node -v`（v18以上必要）
2. `node_modules` を削除して再インストール: `rm -rf node_modules && npm install`

### HMRが動作しない

1. ブラウザのキャッシュをクリア
2. 開発サーバーを再起動

### ESLintエラー

```bash
npm run lint -- --fix  # 自動修正を試行
```

### レイアウトが崩れる

1. ブラウザの開発者ツールでコンソールエラーを確認
2. CSSのGrid/Flexboxのブラウザサポートを確認

## 次のステップ

このフェーズが完了したら、Sprint 2（Markdownパーサ）へ進む:

1. `/speckit.tasks` でタスクリストを生成
2. `/speckit.implement` で実装を開始
