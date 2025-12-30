# Quickstart: Web Worker + パフォーマンス最適化

**Feature**: 005-web-worker-optimization
**Date**: 2025-12-30

## 前提条件

- Node.js（LTS推奨）
- npm
- モダンブラウザ（Chrome, Firefox, Safari, Edge）

## セットアップ

```bash
# リポジトリのクローン（未取得の場合）
git clone <repository-url>
cd vanilla-markdown-editor

# 依存関係のインストール
npm install

# フィーチャーブランチに切り替え
git checkout 005-web-worker-optimization

# 開発サーバー起動
npm run dev
```

## 動作確認手順

### 1. 基本動作確認（Worker有効）

1. `http://localhost:5173` をブラウザで開く
2. エディタに長文Markdown（5,000文字以上）を入力
3. 連続タイピング時に入力遅延がないことを確認
4. プレビューが非同期で更新されることを確認

### 2. Worker動作確認（開発者ツール）

1. 開発者ツールを開く（F12）
2. SourcesタブでWorkerが起動していることを確認
   - `markdown-worker.js`がWorker一覧に表示される
3. Consoleタブでメトリクス出力を確認
   - `[Markdown Worker] parseTime: X.XX ms` のようなログ

### 3. requestIdパターン確認

1. エディタに高速でタイピング
2. プレビューがちらつかず、常に最新内容が表示されることを確認
3. 古い結果への巻き戻りが発生しないことを確認

### 4. メインスレッドフォールバック確認

1. URL に `?useMainThread=true` を追加してアクセス
   - 例: `http://localhost:5173/?useMainThread=true`
2. 同様にMarkdownを入力し、プレビューが更新されることを確認
3. Consoleで `[Main Thread] parsing...` のログを確認

### 5. Worker初期化失敗時の動作確認

1. 開発者ツールのConsoleで以下を実行:
   ```javascript
   window.__markdownEditor.useMainThread();
   ```
2. Markdownを入力し、プレビューが正常に更新されることを確認
3. Worker復帰:
   ```javascript
   window.__markdownEditor.useWorker();
   ```

## パフォーマンステスト

### 長文入力テスト

1. 以下のサンプルテキストを使用（約5,000文字）:

```markdown
# 長文テスト

## セクション1

これは長文テストです。**太字**と*斜体*を含みます。

[リンク](https://example.com)もテストします。

` ` `javascript
const code = "コードブロック";
console.log(code);
` ` `

（上記パターンを繰り返して5,000文字以上に）
```

2. テキストをエディタにペースト
3. 追加で文字を入力
4. 入力がスムーズに追従することを確認

### 入力遅延の主観評価

| 文字数 | 期待される体験 |
|--------|----------------|
| 1,000文字 | 即座に反応、遅延なし |
| 5,000文字 | 遅延を感じない |
| 10,000文字 | わずかなプレビュー遅延は許容、入力はスムーズ |
| 20,000文字 | プレビュー更新に若干の遅れ、入力は継続可能 |

## トラブルシューティング

### Worker が起動しない

1. ブラウザがWeb Workerをサポートしているか確認
2. Vite開発サーバーが正常に起動しているか確認
3. Consoleでエラーメッセージを確認

### プレビューが更新されない

1. Consoleでエラーを確認
2. `?useMainThread=true` で動作するか確認
3. 動作する場合はWorker側の問題

### パフォーマンスが改善しない

1. 開発者ツールのPerformanceタブで計測
2. メインスレッドのブロッキングがないか確認
3. Workerのパース時間をConsoleで確認

## Lint & Format

```bash
npm run lint
npm run format
```

## ビルド

```bash
npm run build
```

ビルド成果物は `dist/` に出力される。Workerファイルも自動的にバンドルされる。
