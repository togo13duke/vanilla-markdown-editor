# Data Model: Web Worker + パフォーマンス最適化

**Feature**: 005-web-worker-optimization
**Date**: 2025-12-30

## Overview

本機能ではデータの永続化は行わない。Worker通信に使用するメッセージ構造と、メインスレッド側の状態管理を定義する。

## Message Entities

### ParseRequest

Workerへ送信するパース要求メッセージ。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes | パース対象のMarkdownテキスト |
| requestId | number | Yes | 要求の一意識別子（インクリメンタル） |

**Validation Rules**:
- `text`: 任意の文字列（空文字列も許容）
- `requestId`: 正の整数

**Example**:
```javascript
{
  text: "# Hello\n\nThis is **bold** text.",
  requestId: 42
}
```

### ParseResult

Workerから返却されるパース結果メッセージ。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| html | string | Yes | 変換後の安全なHTML |
| headings | Array<Heading> | Yes | 抽出された見出し一覧 |
| requestId | number | Yes | 対応するリクエストID |
| metrics | Metrics | No | パフォーマンス情報（開発時のみ） |

**Validation Rules**:
- `html`: XSSエスケープ済みの安全なHTML文字列
- `headings`: 見出し情報の配列
- `requestId`: 送信時と同じ値
- `metrics`: 開発モードでのみ含まれる

**Example**:
```javascript
{
  html: "<h1>Hello</h1>\n<p>This is <strong>bold</strong> text.</p>",
  headings: [{ level: 1, text: "Hello" }],
  requestId: 42,
  metrics: { parseTime: 2.5 }
}
```

### Heading

見出し情報（既存のmarkdownService.jsと同一）。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| level | number | Yes | 見出しレベル（1-6） |
| text | string | Yes | 見出しテキスト |

### Metrics

パフォーマンス計測情報。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| parseTime | number | Yes | パース処理時間（ミリ秒） |

## State Entities

### WorkerState

メインスレッド側でWorkerの状態を管理する内部状態。

| Field | Type | Initial | Description |
|-------|------|---------|-------------|
| worker | Worker \| null | null | Workerインスタンス |
| currentRequestId | number | 0 | 最新のリクエストID |
| useMainThread | boolean | false | メインスレッドフォールバックフラグ |
| initialized | boolean | false | 初期化完了フラグ |

**State Transitions**:

```
[初期状態]
    ↓ initWorker()
[Workerサポート確認]
    ↓ (サポートあり)
[Worker作成]
    ↓ (成功)
[initialized=true, worker=Worker]
    │
    ↓ (エラー発生)
[useMainThread=true, worker=null]

[Workerサポートなし]
    ↓
[useMainThread=true]
```

## Data Flow

```
User Input (textarea)
       │
       ↓
  bindings.js
  (input event)
       │
       ↓
previewService.js
  (debounce)
       │
       ↓
workerService.js
  requestParse()
       │
       ├─── [useMainThread=false] ───→ Worker (postMessage)
       │                                      │
       │                                      ↓
       │                              markdown-worker.js
       │                                (parse + metrics)
       │                                      │
       │                              (postMessage result)
       │                                      │
       └─── [useMainThread=true] ────→ markdownService.js
                                         (parse directly)
       │
       ↓
workerService.js
  onResult callback
  (requestId check)
       │
       ├─── [requestId !== currentRequestId] ───→ (discard)
       │
       └─── [requestId === currentRequestId] ───→ previewService.js
                                                  (updatePreview)
                                                        │
                                                        ↓
                                                   DOM Update
```

## Compatibility with Existing Entities

### FileEntity（既存・変更なし）

本機能ではファイル永続化には関与しない。既存の`FileEntity`はそのまま維持される。

```javascript
{
  id: string,        // UUID
  title: string,     // e.g., "README.md"
  content: string,   // Markdown body
  createdAt: number, // epoch ms
  updatedAt: number,
  sortKey: number
}
```

### 既存parse関数との互換性

`markdownService.js`の`parse()`関数シグネチャは変更しない。

```javascript
// 既存（変更なし）
parse(markdown: string): { html: string, headings: Heading[] }
```

Worker版もメインスレッド版も同じ関数を使用するため、結果の互換性は保証される。
