# Tasks: 自動保存・デバウンス・ショートカット

**Input**: Design documents from `/specs/004-autosave-shortcuts/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 手動テスト（quickstart.mdの手順に従う）

**Organization**: タスクはユーザーストーリーごとにグループ化され、独立した実装とテストを可能にする。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: タスクが属するユーザーストーリー（例: US1, US2, US3）
- 説明には正確なファイルパスを含む

## Path Conventions

- **Single project**: `src/` at repository root
- 既存構造: `src/ui/`, `src/services/`, `src/repositories/`

---

## Phase 1: Setup

**Purpose**: 共通インフラストラクチャとトースト通知の基盤

- [x] T001 トースト通知用CSSスタイルを追加 in src/style.css
- [x] T002 [P] トーストDOM操作モジュールを作成 in src/ui/toast.js
- [x] T003 [P] トースト通知サービスを作成 in src/services/toastService.js

**Checkpoint**: トースト通知の基盤が完成、以降のフェーズで利用可能

---

## Phase 2: Foundational（ブロッキング前提条件）

**Purpose**: すべてのユーザーストーリーに必要なfileService拡張

**⚠️ CRITICAL**: このフェーズが完了するまでユーザーストーリーの実装は開始できない

- [x] T004 fileService.jsにonSaveSuccess/onSaveErrorコールバックを追加 in src/services/fileService.js
- [x] T005 saveCurrentFile()で保存成功/失敗時にコールバックを呼び出し in src/services/fileService.js

**Checkpoint**: fileServiceの拡張完了 - ユーザーストーリーの実装を開始可能

---

## Phase 3: User Story 1+2 - 自動保存とデバウンス (Priority: P1) 🎯 MVP

**Goal**: 入力停止後に自動保存、プレビューと自動保存を別タイマーでデバウンス

**Independent Test**: エディタに文章を入力し、入力停止後にブラウザをリロードして内容が復元されることを確認

### Implementation for User Story 1+2

- [x] T006 [US1] autosaveService.jsを作成（initAutosave, schedule, cancel, saveNow, destroy） in src/services/autosaveService.js
- [x] T007 [US1] デバウンス関数を実装（既存のpreviewService.jsを参考に） in src/services/autosaveService.js
- [x] T008 [US2] bindings.jsにautosaveServiceを統合（handleInputでschedule呼び出し） in src/ui/bindings.js
- [x] T009 [US1] main.jsでautosaveServiceを初期化 in src/main.js
- [x] T010 [US1] 自動保存成功時にトースト通知を表示（toastServiceと連携） in src/main.js
- [x] T011 [US1] 自動保存失敗時にエラー通知を表示 in src/main.js

**Checkpoint**: 自動保存とデバウンスが動作、入力停止後にデータが保存され復元可能

---

## Phase 4: User Story 5 - 保存状態の通知 (Priority: P2)

**Goal**: 保存完了/失敗をトースト通知でフィードバック

**Independent Test**: 自動保存または手動保存後に画面右下にトースト通知が表示されることを確認

### Implementation for User Story 5

- [x] T012 [US5] トースト通知の自動消去（成功3秒、エラー5秒）を実装 in src/services/toastService.js
- [x] T013 [US5] トースト表示アニメーション（フェードイン/アウト）を追加 in src/style.css
- [x] T014 [US5] 複数通知時の上書き動作を確認・調整 in src/services/toastService.js

**Checkpoint**: トースト通知が正常に表示・消去される

---

## Phase 5: User Story 3 - 手動保存ショートカット (Priority: P2)

**Goal**: Cmd/Ctrl+Sで即座に保存

**Independent Test**: エディタで編集後、Cmd/Ctrl+Sを押し「保存完了」通知が表示されることを確認

### Implementation for User Story 3

- [x] T015 [US3] shortcutService.jsを作成（initShortcuts, destroy） in src/services/shortcutService.js
- [x] T016 [US3] Cmd/Ctrl+Sハンドラを実装（event.preventDefault、即座に保存） in src/services/shortcutService.js
- [x] T017 [US3] main.jsでshortcutServiceを初期化 in src/main.js
- [x] T018 [US3] 手動保存時に「保存完了」トースト通知を表示 in src/main.js

**Checkpoint**: Cmd/Ctrl+Sで手動保存が動作

---

## Phase 6: User Story 4 - 太字ショートカット (Priority: P3)

**Goal**: Cmd/Ctrl+Bで選択テキストを太字に変換

**Independent Test**: テキストを選択し、Cmd/Ctrl+Bを押して`**選択テキスト**`に変換されることを確認

### Implementation for User Story 4

- [x] T019 [US4] toggleBold関数を実装（選択範囲ラップ、トグル対応） in src/services/shortcutService.js
- [x] T020 [US4] Cmd/Ctrl+Bハンドラを実装（event.preventDefault） in src/services/shortcutService.js
- [x] T021 [US4] 太字変換後にinputイベントを発火（プレビュー更新） in src/services/shortcutService.js
- [x] T022 [US4] 選択なし時のカーソル位置調整を実装 in src/services/shortcutService.js

**Checkpoint**: 太字ショートカットが動作（選択あり/なし、トグル）

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 品質向上とクリーンアップ

- [x] T023 ファイル切替時に自動保存タイマーをキャンセル in src/services/autosaveService.js
- [x] T024 ESLint/Prettier実行 `npm run lint && npm run format`
- [x] T025 JSDoc追加（新規作成したモジュール） in src/services/autosaveService.js, src/services/shortcutService.js, src/services/toastService.js, src/ui/toast.js
- [x] T026 quickstart.mdの手順で動作確認
- [x] T027 長文テスト（5,000〜20,000文字）でパフォーマンス確認

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし - 即座に開始可能
- **Foundational (Phase 2)**: Setup完了後 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-6)**: Foundational完了後に開始可能
  - Phase 3 (US1+2): P1優先、MVP
  - Phase 4 (US5): Phase 3と並列可能（トースト基盤はPhase 1で完了済み）
  - Phase 5 (US3): Phase 3完了後（autosaveServiceのsaveNowを利用）
  - Phase 6 (US4): Phase 5と並列可能
- **Polish (Phase 7)**: すべてのユーザーストーリー完了後

### User Story Dependencies

```
Phase 1 (Setup) ──┬── Phase 2 (Foundational)
                  │
                  └── Phase 3 (US1+2: 自動保存・デバウンス) ─── MVP!
                        │
                        ├── Phase 4 (US5: トースト通知) ─── 並列可能
                        │
                        └── Phase 5 (US3: 手動保存)
                              │
                              └── Phase 6 (US4: 太字) ─── Phase 5と並列可能
                                    │
                                    └── Phase 7 (Polish)
```

### Parallel Opportunities

**Phase 1 内**:

```
T001 (style.css)
  ├── T002 (ui/toast.js) [P]
  └── T003 (toastService.js) [P] ← T002完了後
```

**Phase 3+4 並列**:

- Phase 3のUS1+2とPhase 4のUS5は並列実行可能（異なるファイル）

**Phase 5+6 並列**:

- T019-T022 (太字機能) はT015-T018 (保存ショートカット) と同一ファイルだが、
  shortcutService.js内で独立したハンドラのため部分的に並列可能

---

## Implementation Strategy

### MVP First (User Story 1+2 Only)

1. Phase 1: Setup完了
2. Phase 2: Foundational完了
3. Phase 3: User Story 1+2完了
4. **STOP and VALIDATE**: 自動保存とデバウンスを独立テスト
5. 必要ならデプロイ/デモ

### Incremental Delivery

1. Setup + Foundational → 基盤完了
2. User Story 1+2 (自動保存) → テスト → MVP!
3. User Story 5 (トースト通知) → テスト → UX向上
4. User Story 3 (手動保存) → テスト → ショートカット対応
5. User Story 4 (太字) → テスト → 完全版
6. Polish → 最終確認

---

## Notes

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベルはタスクを特定のユーザーストーリーにマッピング
- 各ユーザーストーリーは独立して完了・テスト可能
- タスクまたは論理的なグループごとにコミット
- チェックポイントでストーリーを独立して検証可能

---

## Summary

| カテゴリ                              | タスク数 |
| ------------------------------------- | -------- |
| Phase 1: Setup                        | 3        |
| Phase 2: Foundational                 | 2        |
| Phase 3: US1+2 (自動保存・デバウンス) | 6        |
| Phase 4: US5 (トースト通知)           | 3        |
| Phase 5: US3 (手動保存)               | 4        |
| Phase 6: US4 (太字)                   | 4        |
| Phase 7: Polish                       | 5        |
| **合計**                              | **27**   |
