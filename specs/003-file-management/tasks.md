# Tasks: ファイル管理機能

**Input**: Design documents from `/specs/003-file-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 手動テスト（ユーザーシナリオベース）- 自動テストは要件に含まれていません

**Organization**: P1ストーリー（US1-3）は相互依存が高いためFoundationalフェーズでまとめて実装。P2ストーリー（US4-6）は独立して実装可能。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

```text
src/
├── repositories/fileRepository.js  # [NEW] IndexedDB CRUD
├── services/fileService.js         # [NEW] ファイル操作ロジック
├── ui/fileList.js                  # [NEW] ファイルリストUI
├── ui/bindings.js                  # 更新: ファイル関連イベント追加
└── main.js                         # 更新: fileService初期化追加
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 新規ディレクトリとファイルの作成

- [ ] T001 Create repositories directory at src/repositories/
- [ ] T002 [P] Create FileEntity factory functions in src/repositories/fileRepository.js (createFileEntity, updateFileEntity)

---

## Phase 2: Foundational (Core P1 Stories: US1 + US2 + US3)

**Purpose**: P1ストーリーの基盤となるRepository層とService層を実装。これらは相互依存が高く、まとめて実装する必要がある。

**⚠️ CRITICAL**: P2ストーリーはこのフェーズが完了するまで開始できません

### Repository Layer (IndexedDB)

- [ ] T003 Implement IndexedDB initialization with Promise wrapper in src/repositories/fileRepository.js
- [ ] T004 Implement getAll() method (updatedAt descending) in src/repositories/fileRepository.js
- [ ] T005 Implement getById(id) method in src/repositories/fileRepository.js
- [ ] T006 Implement create(entity) method in src/repositories/fileRepository.js
- [ ] T007 Implement update(entity) method in src/repositories/fileRepository.js
- [ ] T008 Implement delete(id) method in src/repositories/fileRepository.js

### Service Layer (Business Logic)

- [ ] T009 Implement fileService state management (files, activeFile, isDirty) in src/services/fileService.js
- [ ] T010 Implement init(callbacks) method with IndexedDB availability check in src/services/fileService.js
- [ ] T011 [US1] Implement createFile() method in src/services/fileService.js
- [ ] T012 [US2] Implement selectFile(id) method with auto-save in src/services/fileService.js
- [ ] T013 [US3] Implement saveCurrentFile() method in src/services/fileService.js
- [ ] T014 Implement updateContent(content) method in src/services/fileService.js
- [ ] T015 Implement getActiveFile() and getFiles() methods in src/services/fileService.js

### UI Layer (File List)

- [ ] T016 Create fileList.js with renderFileList(files) function in src/ui/fileList.js
- [ ] T017 [US1] Add new file button with click handler in src/ui/fileList.js
- [ ] T018 [US2] Add file item click handler for file selection in src/ui/fileList.js
- [ ] T019 Add active file highlighting (CSS class toggle) in src/ui/fileList.js
- [ ] T020 [US3] Add empty state message when no files exist in src/ui/fileList.js

### Integration

- [ ] T021 Update main.js to initialize fileService with callbacks
- [ ] T022 Update bindings.js to connect editor input to fileService.updateContent()
- [ ] T023 Add CSS styles for file list in src/style.css

**Checkpoint**: US1-3が完了。ファイル作成・切替・永続化が動作する状態

---

## Phase 3: User Story 4 - ファイル削除 (Priority: P2)

**Goal**: ユーザーは確認ダイアログ付きでファイルを削除できる

**Independent Test**: ファイルの「×」ボタンをクリックし、確認後に削除されることを確認

### Implementation for User Story 4

- [ ] T024 [US4] Implement deleteFile(id) method in src/services/fileService.js
- [ ] T025 [US4] Add delete button to file list items in src/ui/fileList.js
- [ ] T026 [US4] Implement confirmation dialog (window.confirm or custom modal) in src/ui/fileList.js
- [ ] T027 [US4] Handle active file deletion (auto-select next file) in src/services/fileService.js
- [ ] T028 [US4] Add delete button CSS styles in src/style.css

**Checkpoint**: US4が完了。ファイル削除（確認付き）が動作する状態

---

## Phase 4: User Story 5 - ファイルエクスポート (Priority: P2)

**Goal**: ユーザーは現在のファイルを.md形式でダウンロードできる

**Independent Test**: エクスポートボタンをクリックし、.mdファイルがダウンロードされることを確認

### Implementation for User Story 5

- [ ] T029 [P] [US5] Implement downloadFile(filename, content) utility function in src/services/fileService.js
- [ ] T030 [US5] Implement exportCurrentFile() method in src/services/fileService.js
- [ ] T031 [US5] Add export button to UI (header or file list area) in src/ui/fileList.js
- [ ] T032 [US5] Connect export button to fileService.exportCurrentFile() in src/ui/bindings.js

**Checkpoint**: US5が完了。ファイルエクスポートが動作する状態

---

## Phase 5: User Story 6 - ファイル名編集 (Priority: P2)

**Goal**: ユーザーはファイル名をダブルクリックで編集できる

**Independent Test**: ファイル名をダブルクリックし、新しい名前を入力してEnterで確定することを確認

### Implementation for User Story 6

- [ ] T033 [US6] Implement updateTitle(title) method in src/services/fileService.js
- [ ] T034 [US6] Add dblclick handler for inline editing in src/ui/fileList.js
- [ ] T035 [US6] Implement inline edit input field (replace span with input) in src/ui/fileList.js
- [ ] T036 [US6] Handle Enter key to confirm and Escape to cancel in src/ui/fileList.js
- [ ] T037 [US6] Add inline edit CSS styles in src/style.css

**Checkpoint**: US6が完了。ファイル名編集が動作する状態

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: エッジケース対応とUX改善

- [ ] T038 [P] Handle IndexedDB unavailable (private mode) with warning message in src/services/fileService.js
- [ ] T039 [P] Add file name truncation with tooltip for long names in src/ui/fileList.js
- [ ] T040 Run quickstart.md validation (manual testing checklist)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all P2 user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - P2 stories (US4, US5, US6) can proceed in parallel after Phase 2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1-3 (P1)**: Implemented together in Foundational phase (tight coupling)
- **US4 (P2)**: Can start after Foundational - No dependencies on US5/US6
- **US5 (P2)**: Can start after Foundational - No dependencies on US4/US6
- **US6 (P2)**: Can start after Foundational - No dependencies on US4/US5

### Within Each Phase

- Repository before Service
- Service before UI
- Core implementation before integration

### Parallel Opportunities

- T002 can run in parallel with T001 completion
- T029 (download utility) can run in parallel with other Phase 4 tasks
- Phase 3, 4, 5 can run in parallel (different functionality)
- All Phase 6 tasks marked [P] can run in parallel

---

## Parallel Example: P2 Stories

```bash
# After Foundational phase completes, launch P2 stories in parallel:

# Developer A: User Story 4 (Delete)
Task: "T024 [US4] Implement deleteFile(id) method in src/services/fileService.js"
Task: "T025 [US4] Add delete button to file list items in src/ui/fileList.js"
...

# Developer B: User Story 5 (Export)
Task: "T029 [P] [US5] Implement downloadFile utility in src/services/fileService.js"
Task: "T030 [US5] Implement exportCurrentFile() method in src/services/fileService.js"
...

# Developer C: User Story 6 (Rename)
Task: "T033 [US6] Implement updateTitle(title) method in src/services/fileService.js"
Task: "T034 [US6] Add dblclick handler in src/ui/fileList.js"
...
```

---

## Implementation Strategy

### MVP First (US1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (US1-3)
3. **STOP and VALIDATE**: Test file create, switch, persist independently
4. Deploy/demo if ready - this is functional MVP!

### Incremental Delivery

1. Complete Setup + Foundational → Core file management ready (MVP)
2. Add US4 (Delete) → Test independently → Deploy/Demo
3. Add US5 (Export) → Test independently → Deploy/Demo
4. Add US6 (Rename) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 4 (Delete)
   - Developer B: User Story 5 (Export)
   - Developer C: User Story 6 (Rename)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1-3 are tightly coupled (all P1) - implemented together in Foundational
- US4-6 are independent (all P2) - can be implemented in any order after Foundational
- Verify each story independently before moving to next
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
