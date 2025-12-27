# Internal API Contracts: Markdownパーサ

**Feature**: 002-markdown-parser
**Date**: 2025-12-27

## Overview

このフィーチャーはフロントエンドのみで動作し、外部APIは存在しない。
以下は内部モジュール間のインターフェース定義。

---

## 1. markdownService.js

Markdownテキストを安全なHTMLに変換するサービス。

### `parse(markdown: string): ParseResult`

Markdownテキストをパースし、安全なHTMLを返す。

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| markdown | string | Yes | 生のMarkdownテキスト |

**Returns**: `ParseResult`
```typescript
interface ParseResult {
  html: string;        // 安全なHTML文字列
  headings?: HeadingInfo[];  // 見出し情報（オプション）
}

interface HeadingInfo {
  level: number;       // 1-6
  text: string;        // エスケープ済みテキスト
}
```

**Example**:
```javascript
import { parse } from './services/markdownService.js';

const result = parse('# Hello\n\nThis is **bold**.');
// result.html === '<h1>Hello</h1>\n<p>This is <strong>bold</strong>.</p>'
```

**Error Handling**:
- パースエラー時は入力テキストをエスケープしてそのまま返却
- 例外をスローしない（フェイルセーフ）

---

### `escapeHtml(text: string): string`

HTMLの危険な文字をエスケープする。

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| text | string | Yes | エスケープ対象のテキスト |

**Returns**: `string` - エスケープ済みテキスト

**Escape Mapping**:
| Character | Escaped |
|-----------|---------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#039;` |

---

### `sanitizeUrl(url: string): string`

URLを検証し、危険なスキームを除去する。

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| url | string | Yes | 検証対象のURL |

**Returns**: `string` - 安全なURL、または空文字列

**Allowed Schemes**:
- `http://`
- `https://`
- `mailto:`

**Example**:
```javascript
sanitizeUrl('https://example.com');  // 'https://example.com'
sanitizeUrl('javascript:alert(1)');  // ''
sanitizeUrl('  HTTPS://SAFE.com '); // 'https://SAFE.com'
```

---

## 2. previewService.js

プレビュー更新を制御するサービス。

### `initPreview(options: PreviewOptions): PreviewController`

プレビューサービスを初期化する。

**Parameters**:
```typescript
interface PreviewOptions {
  editorElement: HTMLTextAreaElement;  // エディタのtextarea
  previewElement: HTMLElement;         // プレビュー表示先
  debounceDelay?: number;              // デバウンス遅延（ms）、デフォルト150
}
```

**Returns**: `PreviewController`
```typescript
interface PreviewController {
  update: () => void;        // 手動更新
  destroy: () => void;       // イベントリスナー解除
}
```

**Example**:
```javascript
import { initPreview } from './services/previewService.js';

const controller = initPreview({
  editorElement: document.querySelector('.editor-input'),
  previewElement: document.querySelector('.preview-content'),
  debounceDelay: 150
});

// クリーンアップ時
controller.destroy();
```

---

### `updatePreview(markdown: string, targetElement: HTMLElement): void`

指定されたMarkdownをパースしてプレビュー要素に反映する。

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| markdown | string | Yes | Markdownテキスト |
| targetElement | HTMLElement | Yes | 更新先のDOM要素 |

**Side Effects**:
- `targetElement.innerHTML`を更新

---

## 3. ui/bindings.js

UIイベントバインディングを管理する。

### `initBindings(): void`

エディタのイベントリスナーを初期化する。

**Side Effects**:
- `.editor-input`の`input`イベントにリスナーを登録
- プレビューサービスを起動

**Example**:
```javascript
import { initBindings } from './ui/bindings.js';

// アプリ起動時に呼び出し
initBindings();
```

---

## Usage Flow

```
main.js
    │
    ├── initLayout()        // ui/layout.js（既存）
    ├── initTheme()         // ui/theme.js（既存）
    └── initBindings()      // ui/bindings.js（新規）
            │
            └── initPreview()    // services/previewService.js
                    │
                    └── parse()  // services/markdownService.js
```

## Notes

- すべての関数は同期的に動作（Sprint 5でWorker化予定）
- DOM要素が存在しない場合は静かに失敗（エラーログのみ）
- グローバル状態は使用しない（モジュールスコープ内で完結）
