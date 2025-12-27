# Tasks: Markdownパーサ

**Input**: `/specs/002-markdown-parser/` の設計ドキュメント
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: テストは明示的に要求されていないため、手動テストのみ実施

**Organization**: タスクはユーザーストーリーごとにグループ化され、独立した実装とテストが可能

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: タスクが属するユーザーストーリー（例: US1, US2, US3, US4）
- 説明には正確なファイルパスを含む

## Path Conventions

- **プロジェクト構成**: リポジトリルートの `src/`
- 既存構造: `src/main.js`, `src/ui/layout.js`, `src/ui/theme.js`
- 新規追加: `src/services/`, `src/ui/bindings.js`

---

## Phase 1: セットアップ (共通基盤)

**Purpose**: 新規モジュールのディレクトリ構造を作成

- [x] T001 `src/services/` ディレクトリを作成する
- [x] T002 [P] 新規ファイルに対して ESLint と Prettier の設定が動作することを確認する

---

## Phase 2: 基盤実装 (ブロッキング前提条件)

**Purpose**: すべてのユーザーストーリーで共有される基盤コンポーネント

**⚠️ CRITICAL**: このフェーズが完了するまでユーザーストーリーの実装は開始できません

- [x] T003 `src/services/markdownService.js` に `escapeHtml()` 関数を実装する
- [x] T004 [P] `src/services/markdownService.js` に `sanitizeUrl()` 関数を実装する
- [x] T005 `src/services/previewService.js` に `debounce` ユーティリティ関数を実装する

**Checkpoint**: 基盤準備完了 - ユーザーストーリーの実装を開始可能

---

## Phase 3: ユーザーストーリー 1 - リアルタイムMarkdownプレビュー (Priority: P1) 🎯 MVP

**Goal**: エディタにMarkdownを入力すると、プレビューペインにリアルタイムでHTMLが表示される

**Independent Test**: エディタに「# 見出し」と入力し、プレビューに `<h1>` が表示されることを確認

### Implementation for User Story 1

- [x] T006 [US1] `src/services/markdownService.js` に見出しパース用の `parseBlocks()` (h1-h6) を実装する
- [x] T007 [US1] `src/services/markdownService.js` の `parseBlocks()` に段落ラップロジックを実装する
- [x] T008 [US1] `src/services/markdownService.js` に `ParseResult` を返すメインの `parse()` 関数を実装する
- [x] T009 [US1] `src/services/previewService.js` に `initPreview()` 関数を実装する
- [x] T010 [US1] `src/services/previewService.js` にデバウンス付きの `updatePreview()` を実装する
- [x] T011 [US1] `src/ui/bindings.js` に `initBindings()` 関数を作成する
- [x] T012 [US1] `src/ui/bindings.js` でエディタの入力イベントをプレビュー更新に紐付ける
- [x] T013 [US1] `src/main.js` を更新し、アプリ起動時に `initBindings()` を呼び出すようにする

**Checkpoint**: この時点で、見出し入力がプレビューに反映される最小限のMVPが動作

---

## Phase 4: ユーザーストーリー 2 - XSSからの保護 (Priority: P1)

**Goal**: 悪意のあるコードが入力されても、スクリプトが実行されず安全に表示される

**Independent Test**: `<script>alert('XSS')</script>` を入力し、テキストとしてエスケープ表示されることを確認

### Implementation for User Story 2

- [x] T014 [US2] `src/services/markdownService.js` の `parse()` フローの最初で `escapeHtml()` が呼び出されることを確認する
- [x] T015 [US2] `src/services/markdownService.js` に `sanitizeUrl()` バリデーション付きのリンクパースを実装する
- [x] T016 [US2] `src/services/markdownService.js` に `javascript:` スキーム拒否のテストケースを console.log 検証として追加する
- [x] T017 [US2] `src/services/previewService.js` において、`innerHTML` の使用が最終的な安全なHTMLのみに限定されていることを確認する

**Checkpoint**: XSS攻撃パターンがすべてブロックされ、安全に表示される

---

## Phase 5: ユーザーストーリー 3 - 基本的なMarkdown記法のサポート (Priority: P1)

**Goal**: 見出し、太字、斜体、リンク、コードブロックが正しく変換される

**Independent Test**: 各記法を個別に入力し、正しく整形されることを確認

### Implementation for User Story 3

- [x] T018 [P] [US3] `src/services/markdownService.js` の `parseInlines()` に太字パース (**text**) を実装する
- [x] T019 [P] [US3] `src/services/markdownService.js` の `parseInlines()` に斜体パース (_text_) を実装する
- [x] T020 [US3] `src/services/markdownService.js` の `parseInlines()` にインラインコードパース (`code`) を実装する
- [x] T021 [US3] `src/services/markdownService.js` にプレースホルダーパターンを用いたコードブロック抽出を実装する
- [x] T022 [US3] `src/services/markdownService.js` にインラインパース後のコードブロック復元を実装する
- [x] T023 [US3] `src/services/markdownService.js` のメインの `parse()` フローに `parseInlines()` を統合する
- [x] T024 [US3] `src/style.css` に `code`, `pre`, `strong`, `em` 要素用のCSSスタイルを追加する

**Checkpoint**: すべてのサポートされるMarkdown記法が正しく変換される

---

## Phase 6: ユーザーストーリー 4 - 不正な入力への耐性 (Priority: P2)

**Goal**: 不完全なMarkdown入力でもアプリケーションがクラッシュしない

**Independent Test**: `**太字`（閉じなし）を入力し、クラッシュせずにそのまま表示されることを確認

### Implementation for User Story 4

- [x] T025 [US4] `src/services/markdownService.js` の `parse()` に try-catch エラーハンドリングラッパーを追加する
- [x] T026 [US4] `src/services/markdownService.js` でパースエラー時にエスケープ済みテキストへフォールバックするよう実装する
- [x] T027 [US4] `src/services/markdownService.js` にパースエラー用の `console.error` ログを追加する
- [x] T028 [US4] ブラウザコンソールで、空の入力、長文、Unicode、不完全な構文などのエッジケースをテストする

**Checkpoint**: 不正な入力でもアプリケーションが安定して動作

---

## Phase 7: ブラッシュアップ & 横断的関心事

**Purpose**: 複数のユーザーストーリーに影響する改善

- [x] T029 [P] 全体で ESLint を実行し、新規ファイルのすべての問題を修正する
- [x] T030 [P] 全体で Prettier を実行し、すべての新規ファイルを整形する
- [x] T031 `spec.md` のすべての受け入れシナリオが正しく動作することを確認する
- [x] T032 ブラウザで `quickstart.md` のバリデーションを実行する
- [x] T033 [P] `src/services/markdownService.js` のエクスポート関数に JSDoc コメントを追加する
- [x] T034 [P] `src/services/previewService.js` のエクスポート関数に JSDoc コメントを追加する

---

## 依存関係と実行順序

### フェーズ間の依存関係

- **セットアップ (Phase 1)**: 依存なし - 即座に開始可能
- **基盤実装 (Phase 2)**: Setup完了後 - すべてのユーザーストーリーをブロック
- **ユーザーストーリー 1 (Phase 3)**: Foundational完了後
- **ユーザーストーリー 2 (Phase 4)**: Foundational完了後（US1と並列可能だが、`parse()` がUS1で作成されるため実質US1後）
- **ユーザーストーリー 3 (Phase 5)**: US1完了後（`parse()` の基本構造に依存）
- **ユーザーストーリー 4 (Phase 6)**: US1/US3完了後（エラーハンドリングはパース処理全体に適用）
- **ブラッシュアップ (Phase 7)**: すべてのユーザーストーリー完了後

### ユーザーストーリー間の依存関係

- **ユーザーストーリー 1 (P1)**: Foundational完了後に開始可能 - 他のストーリーに依存しない
- **ユーザーストーリー 2 (P1)**: US1で作成される `parse()` に依存（`escapeHtml` 統合）
- **ユーザーストーリー 3 (P1)**: US1で作成される `parse()` に依存（`parseInlines` 追加）
- **ユーザーストーリー 4 (P2)**: US1/US3で作成されるパース処理に依存（エラーハンドリング追加）

### 各ユーザーストーリー内

- 基盤関数は先に実装
- サービス層の実装後にUI層を実装
- 統合は最後に実施

### 並列実行の機会

- T002: セットアップ中に並列実行可能
- T003, T004: 基盤実装で並列実行可能
- T018, T019: US3内で並列実行可能
- T029, T030, T033, T034: ブラッシュアップで並列実行可能

---

## 並列実行の例: ユーザーストーリー 3

```bash
# 太字と斜体のパースを同時に開始:
Task: "src/services/markdownService.js の parseInlines() に太字パース (**text**) を実装する"
Task: "src/services/markdownService.js の parseInlines() に斜体パース (*text*) を実装する"
```

---

## 実装戦略

### MVP優先 (ユーザーストーリー 1 のみ)

1. Phase 1: セットアップ完了
2. Phase 2: 基盤実装完了（CRITICAL - すべてのストーリーをブロック）
3. Phase 3: ユーザーストーリー 1 完了
4. **停止して検証**: 見出しがプレビューに反映されることを確認
5. 必要に応じてデモ可能

### 増分提供

1. セットアップ + 基盤実装完了 → 基盤準備完了
2. ユーザーストーリー 1 追加 → テスト → デプロイ/デモ (MVP!)
3. ユーザーストーリー 2 追加 → XSSテスト → セキュリティ確認
4. ユーザーストーリー 3 追加 → 全記法テスト → 機能完成
5. ユーザーストーリー 4 追加 → エッジケーステスト → 堅牢性確認
6. 各ストーリーは前のストーリーを壊さずに価値を追加

### 単独開発者戦略

1. Phase 1-2 を完了（セットアップ + 基盤実装）
2. Phase 3 を完了（US1 - MVP）→ 動作確認
3. Phase 4 を完了（US2 - セキュリティ）→ XSSテスト
4. Phase 5 を完了（US3 - 全構文）→ 全記法テスト
5. Phase 6 を完了（US4 - 堅牢性）→ エッジケーステスト
6. Phase 7 を完了（ブラッシュアップ）→ 最終確認

---

## まとめ

| カテゴリ                  | 数  |
| ------------------------- | --- |
| 合計タスク数              | 34  |
| セットアップフェーズ      | 2   |
| 基盤実装フェーズ          | 3   |
| ユーザーストーリー 1 (P1) | 8   |
| ユーザーストーリー 2 (P1) | 4   |
| ユーザーストーリー 3 (P1) | 7   |
| ユーザーストーリー 4 (P2) | 4   |
| ブラッシュアップフェーズ  | 6   |
| 並列実行可能なタスク      | 10  |

## 備考

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベルはタスクを特定のユーザーストーリーにマッピング
- 各ユーザーストーリーは独立して完了・テスト可能
- 各タスクまたは論理グループの後にコミット
- 任意のチェックポイントで停止してストーリーを個別に検証可能
- 避けるべき: 曖昧なタスク、同一ファイルの競合、独立性を壊すストーリー間依存
