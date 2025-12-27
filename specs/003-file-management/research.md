# Research: ファイル管理機能

**Feature**: 003-file-management
**Date**: 2025-12-27

## 1. IndexedDB アーキテクチャ設計

### Decision
Promise ベースのラッパー関数を作成し、IndexedDB のコールバック API をカプセル化する。

### Rationale
- IndexedDB のネイティブ API は `onsuccess`/`onerror` コールバックベースで扱いにくい
- async/await で使えるようにすることで、コードの可読性と保守性が向上
- 外部ライブラリ（idb, Dexie等）を使用せず、Constitution の Vanilla JS 原則に準拠

### Alternatives Considered
1. **外部ライブラリ（idb）使用**: より簡潔だが、Constitution 違反
2. **生の IndexedDB API をそのまま使用**: コードが冗長で可読性が低い
3. **LocalStorage**: 容量制限（5MB）が厳しく、構造化データに不向き

### Implementation Pattern
```javascript
// Promise ラッパーの基本パターン
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('markdown-editor', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('files')) {
        const store = db.createObjectStore('files', { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
}
```

---

## 2. データベーススキーマ設計

### Decision
単一の ObjectStore `files` を使用し、`id` を keyPath とする。`updatedAt` にインデックスを作成してソートを効率化。

### Rationale
- ファイル管理は単一エンティティで完結するため、シンプルな構造で十分
- `updatedAt` インデックスにより、「更新日時降順」のファイルリスト取得が効率的
- バージョン 1 から開始し、スキーマ変更時は `onupgradeneeded` でマイグレーション

### Schema
```javascript
// ObjectStore: files
{
  id: string,        // UUID (keyPath)
  title: string,     // ファイル名
  content: string,   // Markdown本文
  createdAt: number, // epoch ms
  updatedAt: number, // epoch ms (indexed)
  sortKey: number    // カスタムソート用（将来拡張）
}
```

### Alternatives Considered
1. **複数 ObjectStore（files, settings, history）**: 現時点では過剰
2. **createdAt を keyPath**: 同時刻作成時に衝突リスク
3. **autoIncrement キー**: UUID のほうが分散環境に適している

---

## 3. UUID 生成戦略

### Decision
`crypto.randomUUID()` を使用する。非対応ブラウザは想定外（モダンブラウザ前提）。

### Rationale
- ネイティブ API で暗号学的に安全な UUID v4 を生成
- Safari 15.4+, Chrome 92+, Firefox 95+ で対応済み
- 外部ライブラリ不要

### Implementation
```javascript
export function generateUUID() {
  return crypto.randomUUID();
}
```

### Alternatives Considered
1. **uuid ライブラリ**: 依存追加で Constitution 違反
2. **Date.now() + Math.random()**: 衝突リスクがある
3. **自作 UUID 実装**: 標準 API があるため不要

---

## 4. ファイル切替時の自動保存戦略

### Decision
ファイル切替時に現在のファイルを即座に保存する（デバウンスなし）。

### Rationale
- ファイル切替は頻繁ではないため、デバウンスのメリットが薄い
- 切替後に元ファイルの内容が失われることを確実に防ぐ
- Sprint 4 で導入予定の自動保存とは別の即時保存として実装

### Flow
```
1. ユーザーが別ファイルをクリック
2. 現在のファイル内容を IndexedDB に保存
3. 新しいファイルを読み込み
4. エディタに表示
```

### Alternatives Considered
1. **デバウンス付き保存**: 切替直後の保存漏れリスク
2. **確認ダイアログ**: UX が悪化
3. **保存しない**: データ消失（Constitution 違反）

---

## 5. ファイルエクスポート実装

### Decision
Blob API + `<a download>` パターンを使用する。

### Rationale
- 標準的なブラウザダウンロード手法
- File System Access API は対応ブラウザが限定的
- showSaveFilePicker は Chrome 系のみで Safari 非対応

### Implementation Pattern
```javascript
export function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

### Alternatives Considered
1. **File System Access API**: Safari 非対応
2. **FileSaver.js ライブラリ**: Constitution 違反
3. **data: URL**: 大きいファイルで問題

---

## 6. ファイルリスト UI パターン

### Decision
サイドバー内にスクロール可能なファイルリストを配置。各アイテムはクリックで選択、ダブルクリックでリネーム、削除ボタン付き。

### Rationale
- 既存の 3 ペインレイアウト（Files / Editor / Preview）に適合
- モバイル時はサイドバー切替で対応（Sprint 1 で実装済み）
- シンプルな HTML 構造でスタイリング容易

### HTML Structure
```html
<aside class="sidebar">
  <div class="file-list-header">
    <h2>Files</h2>
    <button class="new-file-btn">+</button>
  </div>
  <ul class="file-list">
    <li class="file-item active">
      <span class="file-name">README.md</span>
      <button class="file-delete-btn">×</button>
    </li>
    <!-- ... -->
  </ul>
</aside>
```

### Alternatives Considered
1. **ツリー構造（フォルダ対応）**: MVP では過剰
2. **タブ UI**: 多ファイル時に見切れる
3. **ドロップダウン選択**: 一覧性が低い

---

## 7. 空状態の表示

### Decision
ファイルが 0 件の場合、サイドバーに「新規作成」を促すメッセージと、エディタ領域に空状態メッセージを表示する。

### Rationale
- 初回起動時のユーザーガイダンス
- 削除後の状態遷移を明確化
- アクティブファイルが null の場合の処理を明示

### UX Flow
```
ファイル 0 件:
- サイドバー: "ファイルがありません。「+」で新規作成"
- エディタ: 無効化または「ファイルを選択または作成してください」
- プレビュー: 空白
```

---

## 8. IndexedDB 利用不可時のフォールバック

### Decision
プライベートモードや IndexedDB 非対応時は警告メッセージを表示し、一時的なメモリ内動作のみ許可する。

### Rationale
- Constitution ではデータ消失がブロッカー扱いだが、技術的制約は回避不能
- ユーザーに明示的に警告することで期待値を管理
- LocalStorage フォールバックは容量制限で実用的でない

### Implementation
```javascript
async function checkIndexedDBAvailability() {
  try {
    const db = await openDatabase();
    db.close();
    return true;
  } catch (e) {
    console.warn('IndexedDB not available:', e);
    return false;
  }
}
```

---

## Summary

| 項目 | 決定 |
|------|------|
| IndexedDB ラッパー | Promise ベースの自作ラッパー |
| スキーマ | 単一 ObjectStore `files`、`updatedAt` インデックス |
| UUID | `crypto.randomUUID()` |
| 切替時保存 | 即時保存（デバウンスなし） |
| エクスポート | Blob + `<a download>` |
| UI パターン | サイドバー内リスト |
| 空状態 | メッセージ表示 + エディタ無効化 |
| フォールバック | 警告表示 + メモリ内動作 |
