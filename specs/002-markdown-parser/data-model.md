# Data Model: Markdownパーサ

**Feature**: 002-markdown-parser
**Date**: 2025-12-27

## Overview

このフィーチャーはMarkdownテキストを安全なHTMLに変換する。永続化は行わず、メモリ上でのデータ変換のみを扱う。

## Entities

### 1. MarkdownInput

ユーザーがエディタに入力した生のMarkdownテキスト。

| Field | Type | Description |
|-------|------|-------------|
| text | string | 生のMarkdownテキスト |

**Validation Rules**:
- 空文字列を許容（空のプレビューを返す）
- 文字数制限なし（パフォーマンスはデバウンスで制御）
- Unicode/絵文字を許容

---

### 2. ParseResult

パース処理の結果オブジェクト。

| Field | Type | Description |
|-------|------|-------------|
| html | string | 安全にエスケープされたHTML文字列 |
| headings | HeadingInfo[] | 見出し情報の配列（将来のOutline機能用、現時点ではオプション） |

**Validation Rules**:
- htmlは常に非nullの文字列
- 空入力時は空文字列

---

### 3. HeadingInfo（将来拡張用）

見出し情報。Sprint 6のOutline機能で使用予定。

| Field | Type | Description |
|-------|------|-------------|
| level | number | 見出しレベル（1-6） |
| text | string | 見出しテキスト（エスケープ済み） |
| id | string | アンカーID（オプション） |

---

### 4. CodeBlock（内部処理用）

パース中に一時的に保持するコードブロック情報。

| Field | Type | Description |
|-------|------|-------------|
| lang | string | 言語識別子（空文字列可） |
| code | string | エスケープ済みコード内容 |
| placeholder | string | 置換用プレースホルダ（例: `__CODEBLOCK_0__`） |

---

## Data Flow

```
┌─────────────────┐
│  MarkdownInput  │  ユーザー入力（生テキスト）
│     (text)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   escapeHtml()  │  全テキストをHTMLエスケープ
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ extractCodeBlocks() │  コードブロックを抽出・プレースホルダ化
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ parseBlocks()   │  行単位パース（見出し、段落）
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ parseInlines()  │  インラインパース（太字、斜体、リンク、コード）
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ restoreCodeBlocks() │  コードブロックを復元
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ParseResult   │  安全なHTML + 見出し情報
│  (html, headings) │
└─────────────────┘
```

## State Transitions

このフィーチャーはステートレス。入力に対して出力を返すのみ。

## Relationships

```
MarkdownInput ──parse()──▶ ParseResult
                              │
                              ├── html: string
                              │
                              └── headings: HeadingInfo[] (optional)
```

## Notes

- 永続化は行わない（Sprint 3で実装予定）
- Web Workerへの移行はSprint 5で実施
- 見出し抽出（headings）は現時点ではオプション。Sprint 6のOutline機能で必須化
