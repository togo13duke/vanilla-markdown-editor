# Worker Protocol Contract

**Feature**: 005-web-worker-optimization
**Date**: 2025-12-30

## Overview

メインスレッドとMarkdown Worker間の通信プロトコルを定義する。

## Protocol Version

`1.0.0`

## Communication Pattern

**Type**: Request-Response (非同期)

```
Main Thread                    Worker
     │                            │
     │─── ParseRequest ──────────→│
     │                            │
     │                     [parse処理]
     │                            │
     │←── ParseResult ────────────│
     │                            │
```

## Message Format

### Request: ParseRequest

メインスレッドからWorkerへ送信する。

```typescript
interface ParseRequest {
  text: string;      // パース対象Markdownテキスト
  requestId: number; // 一意のリクエスト識別子
}
```

**Constraints**:
- `requestId`はインクリメンタルに増加する正の整数
- `text`は任意のユーザー入力（空文字列を含む）

### Response: ParseResult

Workerからメインスレッドへ返却する。

```typescript
interface ParseResult {
  html: string;             // XSSエスケープ済みHTML
  headings: Heading[];      // 抽出された見出し
  requestId: number;        // 対応するリクエストID
  metrics?: Metrics;        // オプション: パフォーマンス情報
}

interface Heading {
  level: number;  // 1-6
  text: string;   // 見出しテキスト
}

interface Metrics {
  parseTime: number; // ミリ秒
}
```

## Error Handling

### Worker Error

Workerでエラーが発生した場合、`onerror`イベントで検出する。

```javascript
// Main thread
worker.onerror = (event) => {
  console.error('Worker error:', event.message);
  // フォールバック処理を実行
};
```

### Parse Error

パース中のエラーはWorker内で捕捉し、フォールバック結果を返す。

```javascript
// Worker
try {
  const result = parse(text);
  self.postMessage({ ...result, requestId });
} catch (error) {
  console.error('Parse error:', error);
  // エスケープ済みテキストをフォールバックとして返す
  self.postMessage({
    html: `<p>${escapeHtml(text)}</p>`,
    headings: [],
    requestId
  });
}
```

## Request Ordering

### requestIdによる順序制御

1. メインスレッドは`requestId`をインクリメントして送信
2. レスポンス受信時、`currentRequestId`と比較
3. `requestId < currentRequestId`の場合は結果を破棄

```javascript
// Main thread
let currentRequestId = 0;

function requestParse(text) {
  const requestId = ++currentRequestId;
  worker.postMessage({ text, requestId });
}

worker.onmessage = (event) => {
  const { requestId, html, headings } = event.data;
  if (requestId !== currentRequestId) {
    // 古い結果は破棄
    return;
  }
  // 最新の結果を適用
  updatePreview(html);
};
```

## Worker Lifecycle

### Initialization

```javascript
function initWorker() {
  const worker = new Worker(
    new URL('../workers/markdown-worker.js', import.meta.url),
    { type: 'module' }
  );

  worker.onmessage = handleMessage;
  worker.onerror = handleError;

  return worker;
}
```

### Termination

アプリケーション終了時、明示的なterminateは不要（ブラウザが自動処理）。

## Fallback Mode

Worker非対応または初期化失敗時は、同一インターフェースでメインスレッド実行。

```javascript
function requestParse(text) {
  const requestId = ++currentRequestId;

  if (useMainThread) {
    // 同期的に実行してコールバック
    const result = parse(text);
    handleResult({ ...result, requestId });
  } else {
    worker.postMessage({ text, requestId });
  }
}
```

## Debug Mode

URLパラメータ`?useMainThread=true`でメインスレッドモードを強制。

```javascript
function shouldUseMainThread() {
  const params = new URLSearchParams(window.location.search);
  return params.get('useMainThread') === 'true';
}
```

## Performance Considerations

- Workerへのメッセージは構造化クローンでコピーされる
- 大きなテキスト（50,000文字以上）ではコピーコストが発生するが、パース処理コストより小さい
- Transferableオブジェクトは本ユースケースでは不要（文字列はTransferable対象外）
