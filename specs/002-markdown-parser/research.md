# Research: Markdownパーサ

**Feature**: 002-markdown-parser
**Date**: 2025-12-27
**Status**: Complete

## 1. 正規表現ベースMarkdownパースのベストプラクティス

### Decision: 段階的パース戦略（Block → Inline）

Markdownパースは以下の2段階で行う：
1. **Block-level parsing**: 行単位で処理（見出し、コードブロック、段落）
2. **Inline-level parsing**: 各ブロック内のインライン要素を処理（太字、斜体、リンク、インラインコード）

### Rationale

- 正規表現でフルMarkdownを実装するのは非現実的（ネスト、エッジケースが複雑）
- 2段階に分けることで、各正規表現をシンプルに保てる
- ブロック優先により、コードブロック内のテキストをインラインパースから除外できる

### Alternatives Considered

| 代替案 | 却下理由 |
|--------|----------|
| 外部ライブラリ（marked等） | 憲法 I. Vanilla JS Only に違反、学習目的に反する |
| 完全なパーサ（AST構築） | 複雑すぎる、YAGNI原則に反する |
| 単一パスパース | コードブロック内のテキストが誤変換される |

---

## 2. XSS対策の実装パターン

### Decision: エスケープ・ファースト戦略

1. **最初に全テキストをHTMLエスケープ**する（`<`, `>`, `&`, `"`, `'`）
2. **エスケープ済みテキストから安全なタグのみを構築**する
3. **URLは許可リスト方式**で検証（`http:`, `https:`, `mailto:`のみ許可）

### Rationale

- 「エスケープし忘れ」のリスクを排除
- 新しいMarkdown記法を追加しても、XSS脆弱性が生じにくい設計
- innerHTMLは最終的な安全なHTML反映にのみ使用

### Implementation Pattern

```javascript
// 安全なHTMLエスケープ
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

// 安全なURL検証
function sanitizeUrl(url) {
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('mailto:')) {
    return url.trim();
  }
  return ''; // 危険なURLは空文字に
}
```

### Alternatives Considered

| 代替案 | 却下理由 |
|--------|----------|
| DOMPurify等のサニタイザ | 外部ライブラリ禁止 |
| ブラックリスト方式 | 抜け穴が生じやすい |
| テキストノードのみ使用 | Markdownの整形表示が不可能 |

---

## 3. デバウンス実装パターン

### Decision: プレビュー専用デバウンス（100-250ms）

入力イベントに対して、プレビュー更新をデバウンスする。自動保存は別スプリント（S4）で実装。

### Rationale

- 連続入力時のパース頻度を制御し、UIの滑らかさを維持
- 150ms程度のデバウンスで「リアルタイム感」と「パフォーマンス」を両立
- タイマーIDを保持し、新しい入力で前回のタイマーをキャンセル

### Implementation Pattern

```javascript
let debounceTimer = null;

function debounce(fn, delay) {
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn(...args), delay);
  };
}

const updatePreview = debounce((markdown) => {
  const html = parse(markdown);
  previewElement.innerHTML = html;
}, 150);
```

### Alternatives Considered

| 代替案 | 却下理由 |
|--------|----------|
| スロットリング | 最後の入力が反映されない可能性がある |
| requestAnimationFrame | デバウンスの方が制御しやすい |
| デバウンスなし | 長文で入力が重くなる |

---

## 4. Markdown記法の正規表現パターン

### Decision: シンプルで堅牢な正規表現セット

各記法に対して、シンプルで誤マッチしにくい正規表現を使用する。

### Patterns

| 記法 | 正規表現 | 出力 |
|------|----------|------|
| 見出し | `/^(#{1,6})\s+(.+)$/gm` | `<h1>`〜`<h6>` |
| 太字 | `/\*\*(.+?)\*\*/g` | `<strong>` |
| 斜体 | `/\*(.+?)\*/g` | `<em>` |
| リンク | `/\[([^\]]+)\]\(([^)]+)\)/g` | `<a href>` |
| インラインコード | `/`(.+?)`/g` | `<code>` |
| コードブロック | `/```(\w*)\n([\s\S]*?)```/g` | `<pre><code>` |

### Rationale

- 非貪欲マッチ（`+?`）で最短マッチを優先
- コードブロックを先に処理し、内部テキストをプレースホルダで保護
- エッジケース（閉じタグなし等）は「そのまま表示」で対応

### Edge Case Handling

| ケース | 対応 |
|--------|------|
| `**太字`（閉じなし） | マッチせず、そのまま表示 |
| `[リンク](不完全` | マッチせず、そのまま表示 |
| ネスト（`***太字斜体***`） | 太字優先でパース |
| 空入力 | 空文字列を返却 |

---

## 5. コードブロック保護パターン

### Decision: プレースホルダ置換方式

コードブロックをパース前にプレースホルダ（`__CODEBLOCK_N__`）に置換し、インラインパース後に復元する。

### Rationale

- コードブロック内のMarkdown記法（`**`など）が誤変換されるのを防ぐ
- シンプルな実装で確実に動作
- 将来的にシンタックスハイライト追加時にも対応しやすい

### Implementation Pattern

```javascript
function parseMarkdown(text) {
  const codeBlocks = [];

  // コードブロックを抽出・置換
  let processed = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const index = codeBlocks.length;
    codeBlocks.push({ lang, code: escapeHtml(code) });
    return `__CODEBLOCK_${index}__`;
  });

  // 通常のパース処理
  processed = parseBlocks(processed);
  processed = parseInlines(processed);

  // コードブロックを復元
  codeBlocks.forEach((block, i) => {
    const html = `<pre><code>${block.code}</code></pre>`;
    processed = processed.replace(`__CODEBLOCK_${i}__`, html);
  });

  return processed;
}
```

---

## 6. エラーハンドリング戦略

### Decision: フェイルセーフ（崩れても落ちない）

パース中のエラーは静かに処理し、アプリケーションをクラッシュさせない。

### Rationale

- 憲法 II. XSS Prevention の「仕様外入力でも崩れても落ちない」に準拠
- ユーザー入力は予測不可能であり、常にエラーの可能性がある
- エラー時は入力テキストをエスケープしてそのまま表示

### Implementation Pattern

```javascript
function parse(markdown) {
  try {
    return parseMarkdown(markdown);
  } catch (error) {
    console.error('Markdown parse error:', error);
    // フォールバック: エスケープしてそのまま表示
    return `<p>${escapeHtml(markdown)}</p>`;
  }
}
```

---

## Summary

| 項目 | 決定 |
|------|------|
| パース戦略 | 2段階（Block → Inline） |
| XSS対策 | エスケープ・ファースト + URL許可リスト |
| デバウンス | プレビュー更新に150ms |
| コードブロック | プレースホルダ保護 |
| エラー処理 | フェイルセーフ（落ちない） |
| 正規表現 | 非貪欲マッチ、シンプルなパターン |

全ての決定は憲法の原則に準拠しており、Phase 1への移行が可能。
