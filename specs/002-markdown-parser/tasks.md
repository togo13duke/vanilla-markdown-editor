# Tasks: Markdownパーサ

**Input**: Design documents from `/specs/002-markdown-parser/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: テストは明示的に要求されていないため、手動テストのみ実施

**Organization**: タスクはユーザーストーリーごとにグループ化され、独立した実装とテストが可能

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: タスクが属するユーザーストーリー（例: US1, US2, US3, US4）
- 説明には正確なファイルパスを含む

## Path Conventions

- **Single project**: `src/` at repository root
- 既存構造: `src/main.js`, `src/ui/layout.js`, `src/ui/theme.js`
- 新規追加: `src/services/`, `src/ui/bindings.js`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 新規モジュールのディレクトリ構造を作成

- [ ] T001 Create services directory at src/services/
- [ ] T002 [P] Verify ESLint and Prettier configuration works for new files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: すべてのユーザーストーリーで共有される基盤コンポーネント

**⚠️ CRITICAL**: このフェーズが完了するまでユーザーストーリーの実装は開始できません

- [ ] T003 Implement escapeHtml() function in src/services/markdownService.js
- [ ] T004 [P] Implement sanitizeUrl() function in src/services/markdownService.js
- [ ] T005 Implement debounce utility function in src/services/previewService.js

**Checkpoint**: 基盤準備完了 - ユーザーストーリーの実装を開始可能

---

## Phase 3: User Story 1 - リアルタイムMarkdownプレビュー (Priority: P1) 🎯 MVP

**Goal**: エディタにMarkdownを入力すると、プレビューペインにリアルタイムでHTMLが表示される

**Independent Test**: エディタに「# 見出し」と入力し、プレビューに`<h1>`が表示されることを確認

### Implementation for User Story 1

- [ ] T006 [US1] Implement parseBlocks() for heading parsing (h1-h6) in src/services/markdownService.js
- [ ] T007 [US1] Implement paragraph wrapping logic in parseBlocks() in src/services/markdownService.js
- [ ] T008 [US1] Implement main parse() function that returns ParseResult in src/services/markdownService.js
- [ ] T009 [US1] Implement initPreview() function in src/services/previewService.js
- [ ] T010 [US1] Implement updatePreview() with debounce in src/services/previewService.js
- [ ] T011 [US1] Create initBindings() function in src/ui/bindings.js
- [ ] T012 [US1] Wire up editor input event to preview update in src/ui/bindings.js
- [ ] T013 [US1] Update main.js to call initBindings() on app startup in src/main.js

**Checkpoint**: この時点で、見出し入力がプレビューに反映される最小限のMVPが動作

---

## Phase 4: User Story 2 - XSSからの保護 (Priority: P1)

**Goal**: 悪意のあるコードが入力されても、スクリプトが実行されず安全に表示される

**Independent Test**: `<script>alert('XSS')</script>`を入力し、テキストとしてエスケープ表示されることを確認

### Implementation for User Story 2

- [ ] T014 [US2] Ensure escapeHtml() is called first in parse() flow in src/services/markdownService.js
- [ ] T015 [US2] Implement link parsing with sanitizeUrl() validation in src/services/markdownService.js
- [ ] T016 [US2] Add javascript: scheme rejection test cases as console.log verification in src/services/markdownService.js
- [ ] T017 [US2] Verify innerHTML usage is limited to final safe HTML only in src/services/previewService.js

**Checkpoint**: XSS攻撃パターンがすべてブロックされ、安全に表示される

---

## Phase 5: User Story 3 - 基本的なMarkdown記法のサポート (Priority: P1)

**Goal**: 見出し、太字、斜体、リンク、コードブロックが正しく変換される

**Independent Test**: 各記法を個別に入力し、正しく整形されることを確認

### Implementation for User Story 3

- [ ] T018 [P] [US3] Implement bold parsing (**text**) in parseInlines() in src/services/markdownService.js
- [ ] T019 [P] [US3] Implement italic parsing (*text*) in parseInlines() in src/services/markdownService.js
- [ ] T020 [US3] Implement inline code parsing (`code`) in parseInlines() in src/services/markdownService.js
- [ ] T021 [US3] Implement code block extraction with placeholder pattern in src/services/markdownService.js
- [ ] T022 [US3] Implement code block restoration after inline parsing in src/services/markdownService.js
- [ ] T023 [US3] Integrate parseInlines() into main parse() flow in src/services/markdownService.js
- [ ] T024 [US3] Add CSS styles for code, pre, strong, em elements in src/style.css

**Checkpoint**: すべてのサポートされるMarkdown記法が正しく変換される

---

## Phase 6: User Story 4 - 不正な入力への耐性 (Priority: P2)

**Goal**: 不完全なMarkdown入力でもアプリケーションがクラッシュしない

**Independent Test**: `**太字`（閉じなし）を入力し、クラッシュせずにそのまま表示されることを確認

### Implementation for User Story 4

- [ ] T025 [US4] Add try-catch error handling wrapper in parse() in src/services/markdownService.js
- [ ] T026 [US4] Implement fallback to escaped text on parse error in src/services/markdownService.js
- [ ] T027 [US4] Add console.error logging for parse errors in src/services/markdownService.js
- [ ] T028 [US4] Test with edge cases: empty input, long text, unicode, incomplete syntax in browser console

**Checkpoint**: 不正な入力でもアプリケーションが安定して動作

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 複数のユーザーストーリーに影響する改善

- [ ] T029 [P] Run ESLint and fix any issues across all new files
- [ ] T030 [P] Run Prettier and format all new files
- [ ] T031 Verify all acceptance scenarios from spec.md work correctly
- [ ] T032 Run quickstart.md validation in browser
- [ ] T033 [P] Add JSDoc comments to exported functions in src/services/markdownService.js
- [ ] T034 [P] Add JSDoc comments to exported functions in src/services/previewService.js

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし - 即座に開始可能
- **Foundational (Phase 2)**: Setup完了後 - すべてのユーザーストーリーをブロック
- **User Story 1 (Phase 3)**: Foundational完了後
- **User Story 2 (Phase 4)**: Foundational完了後（US1と並列可能だが、parse()がUS1で作成されるため実質US1後）
- **User Story 3 (Phase 5)**: US1完了後（parse()の基本構造に依存）
- **User Story 4 (Phase 6)**: US1/US3完了後（エラーハンドリングはパース処理全体に適用）
- **Polish (Phase 7)**: すべてのユーザーストーリー完了後

### User Story Dependencies

- **User Story 1 (P1)**: Foundational完了後に開始可能 - 他のストーリーに依存しない
- **User Story 2 (P1)**: US1で作成されるparse()に依存（escapeHtml統合）
- **User Story 3 (P1)**: US1で作成されるparse()に依存（parseInlines追加）
- **User Story 4 (P2)**: US1/US3で作成されるパース処理に依存（エラーハンドリング追加）

### Within Each User Story

- 基盤関数は先に実装
- サービス層の実装後にUI層を実装
- 統合は最後に実施

### Parallel Opportunities

- T002: Setup中に並列実行可能
- T003, T004: Foundationalで並列実行可能
- T018, T019: US3内で並列実行可能
- T029, T030, T033, T034: Polishで並列実行可能

---

## Parallel Example: User Story 3

```bash
# Launch bold and italic parsing together:
Task: "Implement bold parsing (**text**) in parseInlines() in src/services/markdownService.js"
Task: "Implement italic parsing (*text*) in parseInlines() in src/services/markdownService.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup完了
2. Phase 2: Foundational完了（CRITICAL - すべてのストーリーをブロック）
3. Phase 3: User Story 1完了
4. **STOP and VALIDATE**: 見出しがプレビューに反映されることを確認
5. 必要に応じてデモ可能

### Incremental Delivery

1. Setup + Foundational完了 → 基盤準備完了
2. User Story 1追加 → テスト → デプロイ/デモ (MVP!)
3. User Story 2追加 → XSSテスト → セキュリティ確認
4. User Story 3追加 → 全記法テスト → 機能完成
5. User Story 4追加 → エッジケーステスト → 堅牢性確認
6. 各ストーリーは前のストーリーを壊さずに価値を追加

### Single Developer Strategy

1. Phase 1-2を完了（Setup + Foundational）
2. Phase 3を完了（US1 - MVP）→ 動作確認
3. Phase 4を完了（US2 - Security）→ XSSテスト
4. Phase 5を完了（US3 - All Syntax）→ 全記法テスト
5. Phase 6を完了（US4 - Robustness）→ エッジケーステスト
6. Phase 7を完了（Polish）→ 最終確認

---

## Summary

| Category | Count |
|----------|-------|
| Total Tasks | 34 |
| Setup Phase | 2 |
| Foundational Phase | 3 |
| User Story 1 (P1) | 8 |
| User Story 2 (P1) | 4 |
| User Story 3 (P1) | 7 |
| User Story 4 (P2) | 4 |
| Polish Phase | 6 |
| Parallelizable Tasks | 10 |

## Notes

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベルはタスクを特定のユーザーストーリーにマッピング
- 各ユーザーストーリーは独立して完了・テスト可能
- 各タスクまたは論理グループの後にコミット
- 任意のチェックポイントで停止してストーリーを個別に検証可能
- 避けるべき: 曖昧なタスク、同一ファイルの競合、独立性を壊すストーリー間依存
