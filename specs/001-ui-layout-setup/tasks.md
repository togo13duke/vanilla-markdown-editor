# Tasks: UIレイアウトとプロジェクトセットアップ

**Input**: Design documents from `/specs/001-ui-layout-setup/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: テストは明示的に要求されていないため、このフェーズでは手動テストのみ

**Organization**: タスクはユーザーストーリーごとにグループ化

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: ユーザーストーリーラベル（US1, US2, US3...）
- ファイルパスは絶対パスまたはルート相対パスで記載

---

## Phase 1: Setup（プロジェクト初期化）

**Purpose**: 開発環境の構築とプロジェクト基盤の作成

- [ ] T001 package.jsonを作成し、Vite、ESLint、Prettierの依存関係を定義する in package.json
- [ ] T002 Vite設定ファイルを作成する in vite.config.js
- [ ] T003 [P] ESLint flat config設定ファイルを作成する in eslint.config.js
- [ ] T004 [P] Prettier設定ファイルを作成する in .prettierrc
- [ ] T005 [P] .gitignoreにnode_modules、distを追加する in .gitignore
- [ ] T006 npm installを実行し、依存関係をインストールする
- [ ] T007 npm run devでサーバーが起動することを確認する

**Checkpoint**: `npm run dev`、`npm run lint`、`npm run format` が動作する

---

## Phase 2: Foundational（HTML/CSS基盤）

**Purpose**: 全ユーザーストーリーに必要なHTML構造とCSS基盤

**⚠️ CRITICAL**: このフェーズが完了するまでユーザーストーリーの実装は開始できない

- [ ] T008 HTMLエントリポイントを作成し、基本構造（Header、Sidebar、Main）を定義する in index.html
- [ ] T009 CSS Variablesを定義し、ライトテーマのカラーパレットを設定する in src/style.css
- [ ] T010 [P] アプリエントリポイントを作成し、CSSとモジュールをインポートする in src/main.js
- [ ] T011 CSS Grid基本レイアウト（Header + Main area）を実装する in src/style.css
- [ ] T012 src/uiディレクトリを作成する

**Checkpoint**: ブラウザでHeader、Sidebar、Mainの骨格が表示される

---

## Phase 3: User Story 2 - 3ペインレイアウト (Priority: P1) 🎯 MVP

**Goal**: デスクトップ幅で Files / Editor / Preview の3ペインが横並びで表示される

**Independent Test**: ブラウザでアプリを開き、3つの領域が適切なサイズで表示されることを確認

### Implementation

- [ ] T013 [US2] CSS Gridで3カラムレイアウト（Sidebar 200px / Editor 1fr / Preview 1fr）を実装する in src/style.css
- [ ] T014 [US2] Sidebar（Files領域）のHTML構造とスタイルを実装する in index.html, src/style.css
- [ ] T015 [US2] Editor領域のHTML構造（textareaを含む）とスタイルを実装する in index.html, src/style.css
- [ ] T016 [US2] Preview領域のHTML構造とスタイルを実装する in index.html, src/style.css
- [ ] T017 [US2] 各ペインのスクロール設定（overflow-y: auto）を実装する in src/style.css
- [ ] T018 [US2] ペイン間のボーダーと視覚的な区切りを実装する in src/style.css

**Checkpoint**: デスクトップ幅（600px以上）で3ペインが正しく表示され、Editorにテキスト入力可能

---

## Phase 4: User Story 3 - モバイルレスポンシブ (Priority: P2)

**Goal**: 600px未満でSidebarが非表示になり、Editor/Previewがタブ切替で表示される

**Independent Test**: ブラウザ幅を600px未満に縮小し、レイアウトが縮退モードに切り替わることを確認

### Implementation

- [ ] T019 [US3] LayoutState管理モジュールを作成する in src/ui/layout.js
- [ ] T020 [US3] ResizeObserverでコンテナ幅を監視し、モード（desktop/mobile）を切り替える in src/ui/layout.js
- [ ] T021 [US3] モバイルレイアウト用CSSメディアクエリ（max-width: 599px）を実装する in src/style.css
- [ ] T022 [US3] Editor/Preview切替タブUIをHTMLに追加する in index.html
- [ ] T023 [US3] タブ切替ロジック（activePane管理）を実装する in src/ui/layout.js
- [ ] T024 [US3] モバイル時のSidebar非表示スタイルを実装する in src/style.css
- [ ] T025 [US3] main.jsからlayout.jsを初期化する in src/main.js

**Checkpoint**: 幅600px未満でモバイルレイアウト、600px以上でデスクトップレイアウトに自動切替

---

## Phase 5: User Story 4 - ダークモード (Priority: P3)

**Goal**: OSのダークモード設定に連動してアプリの配色が自動的に切り替わる

**Independent Test**: OSのダークモード設定を切り替え、アプリの配色が連動して変化することを確認

### Implementation

- [ ] T026 [US4] ダークテーマ用CSS Variables（prefers-color-scheme: dark）を定義する in src/style.css
- [ ] T027 [US4] ThemeState管理モジュールを作成する in src/ui/theme.js
- [ ] T028 [US4] matchMediaでシステムテーマを検出し、changeイベントをリッスンする in src/ui/theme.js
- [ ] T029 [US4] main.jsからtheme.jsを初期化する in src/main.js
- [ ] T030 [US4] 全UIコンポーネント（Header、Sidebar、Editor、Preview）にテーマ変数を適用する in src/style.css

**Checkpoint**: OSダークモード切替でリロードなしに配色が変更される

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 品質向上と最終確認

- [ ] T031 [P] 全ソースコードに対してnpm run lintを実行し、警告を解消する
- [ ] T032 [P] 全ソースコードに対してnpm run formatを実行する
- [ ] T033 quickstart.mdのチェックリストを手動で実行し、全項目を確認する
- [ ] T034 エッジケース（境界値600px、最小幅320px）をテストする
- [ ] T035 不要なconsole.logやコメントを削除する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 依存なし - 即座に開始可能
- **Phase 2 (Foundational)**: Phase 1完了後 - 全ユーザーストーリーをブロック
- **Phase 3 (US2)**: Phase 2完了後 - MVPの核心
- **Phase 4 (US3)**: Phase 3完了後 - US2のレイアウトが必要
- **Phase 5 (US4)**: Phase 2完了後 - US2/US3と並列可能
- **Phase 6 (Polish)**: Phase 3-5完了後

### User Story Dependencies

- **US2 (3ペインレイアウト)**: Foundational後に開始 - 他ストーリーに依存なし
- **US3 (モバイル)**: US2完了後 - 基本レイアウトが必要
- **US4 (ダークモード)**: Foundational後に開始 - US2/US3と並列可能（独立したCSS変更）

### Parallel Opportunities

Phase 1内:
```bash
# T003, T004, T005 は並列実行可能
Task: "ESLint flat config設定ファイルを作成する in eslint.config.js"
Task: "Prettier設定ファイルを作成する in .prettierrc"
Task: ".gitignoreにnode_modules、distを追加する in .gitignore"
```

Phase 2内:
```bash
# T010 は T008, T009 完了後に実行
# T008, T009 は順序依存（HTMLが先、CSSが後）
```

Phase 6内:
```bash
# T031, T032 は並列実行可能
Task: "全ソースコードに対してnpm run lintを実行"
Task: "全ソースコードに対してnpm run formatを実行"
```

---

## Implementation Strategy

### MVP First (Phase 1-3)

1. Phase 1: Setup完了
2. Phase 2: Foundational完了
3. Phase 3: US2（3ペインレイアウト）完了
4. **STOP and VALIDATE**: デスクトップで3ペインが動作することを確認
5. この時点でデモ可能

### Incremental Delivery

1. Setup + Foundational → 開発環境準備完了
2. US2追加 → デスクトップ版MVP完成
3. US3追加 → モバイル対応完了
4. US4追加 → ダークモード対応完了
5. Polish → 品質確保

---

## Notes

- US1（開発サーバー起動）とUS5（コード品質）はPhase 1のSetupに統合済み
- テストは手動テストのみ（spec.mdで自動テストは要求されていない）
- 各チェックポイントでquickstart.mdの該当項目を確認
- コミットはタスク単位または論理的なグループ単位で行う
