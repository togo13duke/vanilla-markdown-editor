# tech.md — Vanilla Markdown Editor（How）

## 1. 技術スタック
- HTML: セマンティックな基本構造
- CSS: Grid + Flex、Variables、prefers-color-scheme（ダークモード）
- JavaScript: ES2020+、ES Modules
- Web APIs:
  - IndexedDB（永続化）
  - Web Workers（Markdownパースのオフロード）
  - File API（インポート/エクスポート）
  - Clipboard API（任意）
  - ResizeObserver（レスポンシブ切替）
  - (任意) MutationObserver（UI補助）

## 2. 開発ツール（推奨）
- Vite（開発サーバ / ビルド。Vanillaテンプレで十分）
- ESLint + Prettier（品質担保）
- GitHub Actions（任意：lint/build）
- 依存を増やさない方針（学習目的に一致）

代替案:
- Bundlerなし（素のscript type="module"）
  - メリット: 依存ゼロ
  - デメリット: 開発体験（HMR等）とworker取り回しが悪化

## 3. アーキテクチャ
モジュール分割（例）
- app/bootstrap.js: 起動処理
- ui/
  - layout.js: DOM参照・描画
  - bindings.js: イベントハンドリング
- services/
  - editorService.js: 入力/カーソル/ショートカット
  - previewService.js: debounce + worker通信
  - markdownService.js: パース仕様（主にworker側に移譲）
  - autosaveService.js: 自動保存スケジューリング
  - outlineService.js: 見出し抽出
- repositories/
  - fileRepository.js: IndexedDB CRUD
- workers/
  - markdown-worker.js: parse(text) => { html, outline }

設計意図
- “書込み（DB）” と “計算（parse）” をUIから隔離し、メインスレッドを軽くする

## 4. パフォーマンス要件
- 入力イベントでは「重い処理をしない」
  - debounceで頻度制御
  - パースはWorkerで実行
- プレビュー更新は差分更新を理想とするが、MVPは全置換でも可（ただしXSS対策は必須）
- 大きい文書での悪化要因
  - 正規表現の多段replace
  - DOMの大規模再構築

対策
- regexの適用順序を固定（コードブロック→リンク→強調→見出し等）
- Workerで処理し、UIは受け取ったHTMLを反映するだけにする

## 5. セキュリティ要件（最重要）
- raw HTML（ユーザーが書いた <script> 等）を許可しない
- 出力は「エスケープ済みテキスト」から安全なタグのみ構築する
- innerHTMLは“最終反映”に限定し、生成HTMLは安全性が担保されたもののみ
- 可能ならCSPを追加（script-src 'self' 等）
- URLリンクはスキーム制限（javascript: を拒否）

代替案（より堅牢）
- DOMPurify等でサニタイズ
  - メリット: 防御層が増える
  - デメリット: 依存追加（学習目的とのバランス要検討）

## 6. 永続化（IndexedDB）
- DB: MarkdownDB
- store: files（keyPath: id）
- settings storeを分けてもよい

実装方針
- open/upgradeの責務をRepositoryに閉じる
- UI層は async repository.save(file) のみ呼ぶ

フォールバック案
- IndexedDBが使えない/失敗する環境ではLocalStorage（容量制限あり）
  - ただし複数ファイルは破綻しやすいため、最低限の動作保証に留める

## 7. Worker運用
- メイン→Worker: { text, options, requestId }
- Worker→メイン: { html, outline, requestId, metrics? }

要件
- 連続入力でmessageが詰まらないよう、最新のみ反映（requestIdで捨てる）
- main側でインクリメントするrequestIdを付与し、古い返答は無視

## 8. テスト方針（軽量）
MVP段階
- パーサ（markdownService）のユニットテストを最小限（例: 見出し/太字/コードブロック）
- 主要手動テスト手順（sprint.mdのDoD）

代替案
- PlaywrightでE2E
  - メリット: 品質が上がる
  - デメリット: 学習スコープが増える（後半で追加が妥当）
