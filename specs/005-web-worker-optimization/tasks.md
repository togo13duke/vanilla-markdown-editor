# Tasks: Web Worker + パフォーマンス最適化

**Input**: Design documents from `/specs/005-web-worker-optimization/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/worker-protocol.md

**Tests**: 手動テスト（ブラウザ開発者ツール）- 自動テストは含まない

**Organization**: タスクはUser Story単位でグループ化し、独立した実装・テストを可能にする

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Story]**: 対応するUser Story（US1, US2, US3等）
- ファイルパスは正確に記載

## Path Conventions

本プロジェクトはSingle project構造:
- ソース: `src/`
- Worker: `src/workers/`（新規）
- サービス: `src/services/`

---

## Phase 1: Setup

**Purpose**: Worker機能追加のための基盤準備

- [ ] T001 workersディレクトリ作成 `src/workers/`
- [ ] T002 [P] Vite設定確認（Worker type='module' サポート確認）
- [ ] T003 [P] 既存コードのバックアップ確認（previewService.js）

---

## Phase 2: Foundational（基盤タスク）

**Purpose**: 全User Storyの前提となるWorker基盤を構築

**⚠️ CRITICAL**: このフェーズ完了まで各User Storyに着手不可

- [ ] T004 workerService.js骨格作成 `src/services/workerService.js`
  - モジュール構造（export関数の定義）
  - 状態変数（worker, currentRequestId, useMainThread）
- [ ] T005 markdown-worker.js骨格作成 `src/workers/markdown-worker.js`
  - markdownService.jsからparse関数をimport
  - self.onmessageハンドラの空実装

**Checkpoint**: Worker基盤準備完了

---

## Phase 3: User Story 1+2 - Worker基本動作 (Priority: P1) 🎯 MVP

**Goal**: MarkdownパースをWorkerで実行し、メインスレッドをブロックしない

**Independent Test**: 5,000文字以上のMarkdownを入力し、連続タイピング時に遅延がないことを確認

### Implementation

- [ ] T006 [US1] markdown-worker.jsにパース処理実装 `src/workers/markdown-worker.js`
  - self.onmessageで{text, requestId}を受信
  - parse(text)を実行
  - self.postMessageで{html, headings, requestId}を返却
- [ ] T007 [US1] workerService.jsにWorker初期化実装 `src/services/workerService.js`
  - initWorker()関数: new Worker()でWorker作成
  - type: 'module'オプション指定
  - worker.onerrorハンドラ設定
- [ ] T008 [US1] workerService.jsにrequestParse実装 `src/services/workerService.js`
  - requestParse(text, callback)関数
  - requestIdをインクリメント
  - worker.postMessage()で送信
- [ ] T009 [US2] workerService.jsにonmessageハンドラ実装 `src/services/workerService.js`
  - worker.onmessageでParseResult受信
  - コールバック呼び出し
- [ ] T010 [US2] previewService.jsをWorker対応に修正 `src/services/previewService.js`
  - initPreview()でworkerService.initWorker()呼び出し
  - updatePreviewをworkerService.requestParse()経由に変更
  - デバウンス機能は維持
- [ ] T011 [US1] main.jsでWorker初期化呼び出し `src/main.js`
  - アプリ起動時にworkerService.initWorker()

**Checkpoint**: Workerでパース処理が動作し、プレビューが非同期更新される

---

## Phase 4: User Story 4 - requestIdパターン (Priority: P1)

**Goal**: 古いパース結果を破棄し、最新結果のみをプレビューに反映

**Independent Test**: 高速タイピング時にプレビューがちらつかず、巻き戻りが発生しない

### Implementation

- [ ] T012 [US4] workerService.jsにrequestId検証追加 `src/services/workerService.js`
  - isLatestRequest(requestId)関数追加
  - onmessageハンドラでrequestId検証
  - 古い結果（requestId !== currentRequestId）は破棄
- [ ] T013 [US4] 破棄時のログ出力（開発モードのみ） `src/services/workerService.js`
  - import.meta.env.DEVで判定
  - console.log('[Worker] 古い結果を破棄:', requestId)

**Checkpoint**: 連続入力時に最新結果のみ反映される

---

## Phase 5: User Story 3 - フォールバック (Priority: P2)

**Goal**: Worker失敗時にメインスレッドで動作継続

**Independent Test**: `?useMainThread=true`でアクセスし、プレビューが正常動作

### Implementation

- [ ] T014 [US3] workerService.jsにフォールバック実装 `src/services/workerService.js`
  - Worker非サポート検出: typeof Worker === 'undefined'
  - useMainThread=trueでフラグ設定
  - requestParse()でuseMainThread時はparse()を直接呼び出し
- [ ] T015 [US3] URLパラメータによるデバッグモード `src/services/workerService.js`
  - shouldUseMainThread()関数
  - URLSearchParamsで?useMainThread=true検出
  - initWorker()冒頭でチェック
- [ ] T016 [US3] Console APIによるモード切替 `src/services/workerService.js`
  - window.__markdownEditor = { useMainThread, useWorker }
  - 開発者ツールからの切替を可能に
- [ ] T017 [US3] Worker初期化失敗時のトースト通知 `src/services/workerService.js`
  - toastService.jsをimport
  - onerrorで「Workerが利用できません。メインスレッドで動作します」表示

**Checkpoint**: Worker/メインスレッド両モードで動作確認可能

---

## Phase 6: User Story 5 - メトリクス (Priority: P3)

**Goal**: パース処理時間をコンソール出力

**Independent Test**: 開発者ツールでparseTime（ミリ秒）が表示される

### Implementation

- [ ] T018 [US5] markdown-worker.jsにメトリクス追加 `src/workers/markdown-worker.js`
  - performance.now()で処理時間計測
  - ParseResultにmetrics: { parseTime }を追加
- [ ] T019 [US5] workerService.jsでメトリクスログ出力 `src/services/workerService.js`
  - onmessageでmetrics受信時にconsole.log
  - 開発モード(import.meta.env.DEV)でのみ出力

**Checkpoint**: パース時間がコンソールに表示される

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 品質向上と最終確認

- [ ] T020 ESLint実行と修正 `npm run lint`
- [ ] T021 [P] Prettier実行 `npm run format`
- [ ] T022 JSDocコメント追加 `src/services/workerService.js`
  - 各export関数に@param, @returns追加
- [ ] T023 [P] JSDocコメント追加 `src/workers/markdown-worker.js`
  - ファイル先頭に概要コメント
- [ ] T024 quickstart.md手順に従って手動テスト実行
  - 基本動作確認（Worker有効）
  - Worker動作確認（開発者ツール）
  - requestIdパターン確認
  - メインスレッドフォールバック確認
  - パフォーマンスメトリクス確認
- [ ] T025 長文テスト（5,000文字以上）で入力遅延確認
- [ ] T026 [P] 不要なconsole.log削除（開発用ログは残す）
- [ ] T027 CLAUDE.md Active Technologies更新

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし - 即座に開始可能
- **Foundational (Phase 2)**: Setup完了後 - 全User Storyをブロック
- **User Story 1+2 (Phase 3)**: Foundational完了後 - MVP
- **User Story 4 (Phase 4)**: Phase 3完了後（requestIdはPhase 3で基盤実装済み）
- **User Story 3 (Phase 5)**: Foundational完了後（Phase 3と並列可能だが推奨しない）
- **User Story 5 (Phase 6)**: Phase 3完了後（Worker動作が前提）
- **Polish (Phase 7)**: 全User Story完了後

### User Story Dependencies

- **US1+US2 (P1)**: Foundational完了後 - Worker基本動作
- **US4 (P1)**: US1+US2完了後 - requestIdパターンはWorker動作が前提
- **US3 (P2)**: Foundational完了後 - フォールバック（US1+US2と独立可能だが後から実装推奨）
- **US5 (P3)**: US1+US2完了後 - メトリクスはWorker動作が前提

### Parallel Opportunities

**Phase 1 (Setup)**:
```
並列: T002, T003
```

**Phase 2 (Foundational)**:
```
並列不可: T004 → T005（T004の構造がT005に必要）
```

**Phase 3 (US1+US2)**:
```
T006 → T007 → T008 → T009 → T010 → T011
（順次依存関係あり）
```

**Phase 7 (Polish)**:
```
並列: T021, T022, T023, T026
```

---

## Implementation Strategy

### MVP First (User Story 1+2)

1. Phase 1: Setup完了
2. Phase 2: Foundational完了（CRITICAL）
3. Phase 3: User Story 1+2完了
4. **STOP and VALIDATE**: Worker動作を手動テスト
5. 長文入力でスムーズさを確認

### Incremental Delivery

1. Setup + Foundational → 基盤完了
2. US1+US2 → Worker基本動作（MVP!）
3. US4 → requestIdパターン追加
4. US3 → フォールバック追加
5. US5 → メトリクス追加
6. Polish → 品質確認

### 推奨実行順序

```
T001 → T002/T003(並列) → T004 → T005 →
T006 → T007 → T008 → T009 → T010 → T011 →
[MVP確認] →
T012 → T013 →
T014 → T015 → T016 → T017 →
T018 → T019 →
T020 → T021/T022/T023/T026(並列) → T024 → T025 → T027
```

---

## Notes

- [P] タスク = 異なるファイル、依存なし
- [Story] ラベルでUser Storyとのトレーサビリティ確保
- Phase 3完了時点でMVPとして動作確認可能
- 手動テストはquickstart.mdの手順に従う
- コミットは各タスク完了後に推奨
