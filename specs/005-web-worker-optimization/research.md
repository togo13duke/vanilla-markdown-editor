# Research: Web Worker + パフォーマンス最適化

**Feature**: 005-web-worker-optimization
**Date**: 2025-12-30

## 1. Web Worker実装パターン

### Decision: Dedicated Worker + postMessage

**Rationale**:
- Dedicated WorkerはShared Workerより実装がシンプル
- 本アプリは単一タブ前提のため、Shared Workerの複数タブ共有は不要
- postMessageはWeb標準で追加依存なし

**Alternatives considered**:
| パターン | メリット | デメリット | 採否 |
|---------|---------|-----------|------|
| Dedicated Worker | シンプル、ブラウザサポート広い | タブ間共有不可 | ✅ 採用 |
| Shared Worker | タブ間共有可 | 実装複雑、用途外 | ❌ 不採用 |
| Service Worker | オフライン対応可 | 用途外、過剰 | ❌ 不採用 |
| OffscreenCanvas Worker | 描画処理向け | DOM更新には不向き | ❌ 不採用 |

## 2. Workerへのコード共有方式

### Decision: Workerファイルにパース関数をコピー

**Rationale**:
- ViteはWorkerファイルを自動的にバンドル・最適化する
- `import`をWorker内で使用可能（type: 'module'）
- markdownService.jsの`parse`関数をWorker内でインポートする

**Alternatives considered**:
| 方式 | メリット | デメリット | 採否 |
|------|---------|-----------|------|
| Worker内でimport | コード重複なし | Vite設定必要 | ✅ 採用 |
| インラインBlob Worker | 動的生成可 | デバッグ困難、コード共有不可 | ❌ 不採用 |
| コードコピー | シンプル | 保守性低下 | ❌ 不採用 |

**Implementation**:
```javascript
// src/workers/markdown-worker.js
import { parse } from '../services/markdownService.js';

self.onmessage = (event) => {
  const { text, requestId } = event.data;
  const result = parse(text);
  self.postMessage({ ...result, requestId });
};
```

## 3. requestIdパターン実装

### Decision: インクリメンタルカウンター

**Rationale**:
- UUIDより軽量
- 単一クライアントのため衝突リスクなし
- 数値比較でシンプルに新旧判定可能

**Alternatives considered**:
| 方式 | メリット | デメリット | 採否 |
|------|---------|-----------|------|
| インクリメンタル数値 | 軽量、比較容易 | オーバーフロー（Number.MAX_SAFE_INTEGER超過は現実的に発生しない） | ✅ 採用 |
| UUID v4 | グローバル一意性 | 重い、文字列比較 | ❌ 不採用 |
| タイムスタンプ | 時間順序あり | ミリ秒精度で衝突可能 | ❌ 不採用 |

**Implementation**:
```javascript
// src/services/workerService.js
let currentRequestId = 0;

export function getNextRequestId() {
  return ++currentRequestId;
}

export function isLatestRequest(requestId) {
  return requestId === currentRequestId;
}
```

## 4. Workerフォールバック戦略

### Decision: 起動時検出 + エラー時フォールバック

**Rationale**:
- Worker非サポート環境（レガシーブラウザ）への対応
- Worker初期化失敗時の復旧
- メインスレッド版をデバッグ用途で利用可能にする

**Alternatives considered**:
| 戦略 | メリット | デメリット | 採否 |
|------|---------|-----------|------|
| 起動時検出 + エラー時フォールバック | 堅牢、デバッグ容易 | 若干複雑 | ✅ 採用 |
| Worker必須（非サポート時エラー） | シンプル | ユーザビリティ低下 | ❌ 不採用 |
| 常時両方実行 | 結果比較可 | リソース浪費 | ❌ 不採用 |

**Implementation**:
```javascript
// src/services/workerService.js
let worker = null;
let useMainThread = false;

export function initWorker() {
  if (typeof Worker === 'undefined') {
    console.warn('Web Worker非サポート: メインスレッドで実行');
    useMainThread = true;
    return;
  }

  try {
    worker = new Worker(
      new URL('../workers/markdown-worker.js', import.meta.url),
      { type: 'module' }
    );
    worker.onerror = (e) => {
      console.error('Worker初期化失敗:', e);
      useMainThread = true;
      worker = null;
    };
  } catch (e) {
    console.error('Worker作成失敗:', e);
    useMainThread = true;
  }
}
```

## 5. デバッグフラグ実装

### Decision: URLパラメータ + console API

**Rationale**:
- URLパラメータ`?useMainThread=true`で切替
- 開発者ツールからも切替可能
- 本番ビルドでも利用可能（デバッグ用途）

**Implementation**:
```javascript
// src/services/workerService.js
function shouldUseMainThread() {
  const params = new URLSearchParams(window.location.search);
  return params.get('useMainThread') === 'true';
}

// Console API for debugging
window.__markdownEditor = {
  useMainThread: () => { useMainThread = true; },
  useWorker: () => { useMainThread = false; }
};
```

## 6. パフォーマンスメトリクス

### Decision: performance.now() + 開発時console出力

**Rationale**:
- performance.now()は高精度タイマー
- 開発モードでのみ出力してノイズ削減
- 将来的にPerformance APIで可視化可能

**Implementation**:
```javascript
// src/workers/markdown-worker.js
self.onmessage = (event) => {
  const { text, requestId } = event.data;
  const startTime = performance.now();
  const result = parse(text);
  const parseTime = performance.now() - startTime;

  self.postMessage({
    ...result,
    requestId,
    metrics: { parseTime }
  });
};
```

## 7. 既存コードとの統合

### Decision: previewService.jsを拡張

**Rationale**:
- 既存のデバウンス機能を維持
- `initPreview()`のインターフェースを変更せず内部実装のみ変更
- 後方互換性を確保

**Modified Architecture**:
```
入力イベント
    ↓
bindings.js (editorのinputイベント)
    ↓
previewService.js initPreview().update()
    ↓
[デバウンス 150ms]
    ↓
workerService.js requestParse(text)
    ↓
markdown-worker.js (parse)
    ↓
workerService.js onResult(callback)
    ↓
previewService.js updatePreview()
    ↓
DOM更新
```

## 8. Vite設定確認

### Decision: デフォルト設定で動作

**Rationale**:
- Vite 5.xはWorker（type: 'module'）をデフォルトでサポート
- `new URL(..., import.meta.url)`パターンで自動バンドル
- 追加設定不要

**Verification**:
```javascript
// このパターンでViteが自動的にWorkerをバンドル
new Worker(
  new URL('../workers/markdown-worker.js', import.meta.url),
  { type: 'module' }
);
```

## Summary

| 項目 | 決定 |
|------|------|
| Worker種類 | Dedicated Worker |
| コード共有 | Worker内でimport |
| requestId | インクリメンタル数値 |
| フォールバック | 起動時検出 + エラー時 |
| デバッグ切替 | URLパラメータ |
| メトリクス | performance.now() |
| 統合方式 | previewService.js拡張 |
| Vite設定 | デフォルト設定 |
