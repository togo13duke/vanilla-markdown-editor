# structure.md — Vanilla Markdown Editor（What）

## 1. 画面構成（情報設計）
- Header
  - アプリ名
  - 主要アクション: 保存(手動), エクスポート, 設定
- Left Sidebar
  - Files（一覧 / 新規 / リネーム / 削除）
  - Outline（見出しツリー。MVP外でも可）
- Main
  - Editor（textarea推奨）
  - Preview（HTMLレンダリング）

レイアウトはデスクトップで3カラム、幅が狭い場合はタブ切替（Editor/Preview）に縮退する。

## 2. 入力（Inputs）
ユーザー入力
- キーボード入力（Markdown本文）
- ファイル操作（新規/選択/削除/リネーム）
- ショートカット
  - Cmd/Ctrl+S: 保存（手動）
  - Cmd/Ctrl+B: 太字（選択範囲を ** でラップ） 等

ブラウザAPI入力
- File API: インポート（.md/.txt）
- Clipboard API: コピー/ペースト支援（任意）
- Resize Observer: レイアウト切替トリガ
- Worker message: パース結果HTML

## 3. 出力（Outputs）
- Preview HTML（安全なサブセット）
- ダウンロードファイル（.md、将来的に.html/.pdfは拡張）
- 永続化データ（IndexedDB）
- UI通知（保存完了、エラー、コピー成功など）

## 4. ドメインモデル（データ設計）
FileEntity（例）
- id: string（UUID）
- title: string（例: README.md）
- content: string（Markdown本文）
- createdAt: number（epoch ms）
- updatedAt: number
- sortKey: number（一覧並び用）
- cursor: { start: number, end: number }（任意：復元に便利）
- meta: { pinned?: boolean, tags?: string[] }（任意）

AppState（最小）
- activeFileId: string
- ui:
  - theme: 'system' | 'light' | 'dark'
  - layout: 'desktop' | 'mobile'
  - sidebarOpen: boolean
- runtime:
  - isDirty: boolean（未保存フラグ）
  - lastSavedAt: number | null

派生状態（Derived）
- outline: HeadingNode[]（contentから生成）
- previewHtml: string（worker結果）

## 5. ビジネスロジック / フロー（代表シナリオ）
(1) 起動
1. Repository（IndexedDB）からファイル一覧ロード
2. activeFileId復元（なければ最新更新のファイル）
3. Editorにcontent反映
4. プレビュー更新要求（デバウンス→worker）

(2) 入力→プレビュー更新
1. inputイベント
2. isDirty=true
3. autoSaveタイマー（debounce 700〜1200ms目安）を再セット
4. preview更新タイマー（debounce 100〜250ms目安）を再セット
5. preview更新時: workerへ { text } をpostMessage
6. workerがparse→ { html, outline } を返却
7. UIがpreviewを更新、outline更新

(3) 自動保存
1. autoSave発火
2. active fileを更新（content/updatedAt）
3. 書込み成功→ lastSavedAt更新、isDirty=false（設計次第で手動保存と分離可）
4. 失敗→ エラー通知、isDirtyは維持

(4) ファイル切替
1. 現在ファイルがdirtyなら
   - 仕様A: 自動保存済み前提でそのまま切替（推奨：摩擦が少ない）
   - 仕様B: 確認ダイアログ（データ損失防止、ただしUX低下）
2. activeFileId更新
3. content反映、プレビュー更新

(5) エクスポート
1. 現在のcontentをBlob化
2. a.downloadで保存
3. URL.revokeObjectURL

(6) インポート（任意）
1. input[type=file]で選択
2. file.text()で読み込み
3. 新規ファイルとして作成 or 現在ファイルに取り込み（仕様選択）

## 6. Markdown対応仕様（サブセット定義）
対応（MVP）
- 見出し: #〜######（行頭）
- 強調:
  - 太字: **text**
  - 斜体: *text*
- リンク: [text](url)
- コードブロック: ```lang?\n...\n```
- 改行: \n → <br>（段落は簡易でも可）

非対応（MVP）
- 表、脚注、タスクリスト、数式、HTML直書き、ネストの厳密解釈

要求品質
- “仕様外入力でも落ちない”
- 表示崩れは許容するが、XSSは許容しない

## 7. 規約・原則
アーキテクチャ原則
- UIと永続化/パースを分離（View / Controller / Service / Repository）
- 直接DOM操作はView層に限定（innerHTMLは最小限）
- 例外は握りつぶさず、UIで可視化（toast + console）

コーディング規約（推奨）
- ES Modulesで分割（1ファイル1責務）
- 例: /src
  - /ui（DOM描画・イベント）
  - /services（markdown/outline/autosave）
  - /repositories（indexeddb）
  - /workers（markdown-worker）

## 8. 例外・エラーハンドリング
- IndexedDB open失敗: 「ブラウザがストレージを拒否」等を通知し、LocalStorageへフォールバック（選択肢）
- Clipboard失敗: 権限拒否を通知
- File読み込み失敗: 再試行案内
- Worker未対応: メインスレッドで低機能フォールバック（選択肢）

## 9. 代替設計（比較）
- OutlineをMutationObserverでpreview DOMから生成
  - メリット: 実装が直感的
  - デメリット: 監視コスト、DOM依存、XSS対策と絡む
- OutlineをMarkdown解析結果から生成（推奨）
  - メリット: 一貫性、DOM依存が減る
  - デメリット: パーサ設計が必要
