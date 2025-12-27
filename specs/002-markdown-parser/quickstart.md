# Quickstart: Markdownパーサ

**Feature**: 002-markdown-parser
**Date**: 2025-12-27

## Prerequisites

- Node.js 18以上
- npm 9以上
- モダンブラウザ（Chrome, Firefox, Safari, Edge最新版）

## Setup

```bash
# リポジトリのクローン（既にある場合はスキップ）
git clone <repository-url>
cd vanilla-markdown-editor

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

## 機能確認

### 1. 基本的なMarkdown記法

エディタペインに以下を入力して、プレビューペインに反映されることを確認：

```markdown
# 見出し1
## 見出し2

これは**太字**と*斜体*のテスト。

[Googleへのリンク](https://google.com)

インラインコード: `const x = 1;`

コードブロック:
```javascript
function hello() {
  console.log('Hello');
}
```
```

### 2. XSS対策の確認

以下の危険な入力がエスケープされることを確認：

```markdown
<script>alert('XSS')</script>

<div onclick="alert('XSS')">クリック</div>

[危険なリンク](javascript:alert('XSS'))
```

**期待される動作**:
- `<script>`タグがテキストとして表示される
- `onclick`イベントが無効化される
- `javascript:`リンクが無効化される

### 3. エッジケースの確認

```markdown
**閉じていない太字

[不完全なリンク](

****連続アスタリスク****

絵文字テスト: 😀🎉✨
```

**期待される動作**:
- アプリケーションがクラッシュしない
- 不正な記法はそのまま表示される

## ファイル構成

```
src/
├── main.js                    # アプリ初期化
├── ui/
│   ├── layout.js              # レイアウト管理
│   ├── theme.js               # テーマ管理
│   └── bindings.js            # イベントバインディング【新規】
└── services/
    ├── markdownService.js     # Markdownパース【新規】
    └── previewService.js      # プレビュー更新【新規】
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# リント実行
npm run lint

# フォーマット実行
npm run format

# 本番ビルド
npm run build
```

## トラブルシューティング

### プレビューが更新されない

1. ブラウザのコンソールでエラーを確認
2. `initBindings()`が`main.js`で呼ばれているか確認
3. `.editor-input`と`.preview-content`のセレクタが正しいか確認

### XSS脆弱性が見つかった場合

1. `markdownService.js`の`escapeHtml()`が正しく動作しているか確認
2. `sanitizeUrl()`が`javascript:`を拒否しているか確認
3. `innerHTML`の使用箇所が安全なHTML反映のみか確認

## 次のステップ

- `/speckit.tasks` でタスクを生成
- `/speckit.implement` で実装を開始
