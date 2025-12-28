# タスク: ファイル管理機能

**インプット**: `/specs/003-file-management/` の設計ドキュメント
**前提条件**: plan.md, spec.md, research.md, data-model.md, contracts/

**テスト**: 手動テスト（ユーザーシナリオベース）- 自動テストは要件に含まれていません

**構成**: P1ストーリー（US1-3）は相互依存が高いため、Foundationalフェーズでまとめて実装します。P2ストーリー（US4-6）は独立して実装可能です。

## フォーマット: `[ID] [P?] [Story] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: タスクが属するユーザーストーリー（例: US1, US2, US3）
- 説明には正確なファイルパスを含めること

## パス規則

```text
src/
├── repositories/fileRepository.js  # [新規] IndexedDB CRUD
├── services/fileService.js         # [新規] ファイル操作ロジック
├── ui/fileList.js                  # [新規] ファイルリストUI
├── ui/bindings.js                  # 更新: ファイル関連イベントの追加
└── main.js                         # 更新: fileServiceの初期化を追加
```

---

## フェーズ 1: セットアップ (共通インフラ)

**目的**: 新規ディレクトリとファイルの作成

- [x] T001 `src/repositories/` ディレクトリを作成する
- [x] T002 [P] `src/repositories/fileRepository.js` に FileEntity ファクトリ関数（createFileEntity, updateFileEntity）を作成する

---

## フェーズ 2: 基盤実装 (Core P1 ストーリー: US1 + US2 + US3)

**目的**: P1ストーリーの基盤となるRepository層とService層を実装。これらは相互依存が高いため、まとめて実装する必要がある。

**⚠️ 重要**: P2ストーリーはこのフェーズが完了するまで開始できません。

### Repository層 (IndexedDB)

- [x] T003 `src/repositories/fileRepository.js` に Promise ラッパーを用いた IndexedDB の初期化を実装する
- [x] T004 `src/repositories/fileRepository.js` に getAll() メソッドを実装する（updatedAt の降順）
- [x] T005 `src/repositories/fileRepository.js` に getById(id) メソッドを実装する
- [x] T006 `src/repositories/fileRepository.js` に create(entity) メソッドを実装する
- [x] T007 `src/repositories/fileRepository.js` に update(entity) メソッドを実装する
- [x] T008 `src/repositories/fileRepository.js` に delete(id) メソッドを実装する

### Service層 (ビジネスロジック)

- [x] T009 `src/services/fileService.js` に fileService の状態管理（files, activeFile, isDirty）を実装する
- [x] T010 `src/services/fileService.js` に IndexedDB の可用性チェックを含む init(callbacks) メソッドを実装する
- [x] T011 [US1] `src/services/fileService.js` に createFile() メソッドを実装する
- [x] T012 [US2] `src/services/fileService.js` に自動保存機能付きの selectFile(id) メソッドを実装する
- [x] T013 [US3] `src/services/fileService.js` に saveCurrentFile() メソッドを実装する
- [x] T014 `src/services/fileService.js` に updateContent(content) メソッドを実装する
- [x] T015 `src/services/fileService.js` に getActiveFile() および getFiles() メソッドを実装する

### UI層 (ファイルリスト)

- [x] T016 `src/ui/fileList.js` を作成し、renderFileList(files) 関数を実装する
- [x] T017 [US1] `src/ui/fileList.js` にクリックハンドラ付きの新規ファイル作成ボタンを追加する
- [x] T018 [US2] `src/ui/fileList.js` にファイル選択用のアイテムクリックハンドラを追加する
- [x] T019 `src/ui/fileList.js` にアクティブなファイルのハイライト表示（CSSクラスの切り替え）を追加する
- [x] T020 [US3] `src/ui/fileList.js` にファイルが存在しない場合の空状態メッセージを追加する

### 統合

- [x] T021 `main.js` を更新し、コールバックを使用して fileService を初期化する
- [x] T022 `bindings.js` を更新し、エディタの入力を `fileService.updateContent()` に接続する
- [x] T023 `src/style.css` にファイルリスト用のCSSスタイルを追加する

**チェックポイント**: US1-3が完了。ファイルの作成・切り替え・永続化が動作する状態。

---

## フェーズ 3: ユーザーストーリー 4 - ファイル削除 (優先度: P2)

**ゴール**: ユーザーが確認ダイアログ付きでファイルを削除できること

**独立テスト**: ファイルの「×」ボタンをクリックし、確認後に削除されることを確認する

### ユーザーストーリー 4 の実装

- [x] T024 [US4] `src/services/fileService.js` に deleteFile(id) メソッドを実装する
- [x] T025 [US4] `src/ui/fileList.js` のファイルリストアイテムに削除ボタンを追加する
- [x] T026 [US4] `src/ui/fileList.js` に確認ダイアログ（window.confirm またはカスタムモーダル）を実装する
- [x] T027 [US4] `src/services/fileService.js` でアクティブなファイルの削除を処理する（次のファイルを自動選択）
- [x] T028 [US4] `src/style.css` に削除ボタンのCSSスタイルを追加する

**チェックポイント**: US4が完了。ファイル削除（確認付き）が動作する状態。

---

## フェーズ 4: ユーザーストーリー 5 - ファイルエクスポート (優先度: P2)

**ゴール**: ユーザーが現在のファイルを .md 形式でダウンロードできること

**独立テスト**: エクスポートボタンをクリックし、 .md ファイルがダウンロードされることを確認する

### ユーザーストーリー 5 の実装

- [x] T029 [P] [US5] `src/services/fileService.js` に downloadFile(filename, content) ユーティリティ関数を実装する
- [x] T030 [US5] `src/services/fileService.js` に exportCurrentFile() メソッドを実装する
- [x] T031 [US5] `src/ui/fileList.js` のUI（ヘッダーまたはファイルリストエリア）にエクスポートボタンを追加する
- [x] T032 [US5] `src/ui/bindings.js` でエクスポートボタンを `fileService.exportCurrentFile()` に接続する

**チェックポイント**: US5が完了。ファイルエクスポートが動作する状態。

---

## フェーズ 5: ユーザーストーリー 6 - ファイル名編集 (優先度: P2)

**ゴール**: ユーザーがファイル名をダブルクリックで編集できること

**独立テスト**: ファイル名をダブルクリックし、新しい名前を入力して Enter で確定することを確認する

### ユーザーストーリー 6 の実装

- [x] T033 [US6] `src/services/fileService.js` に updateTitle(title) メソッドを実装する
- [x] T034 [US6] `src/ui/fileList.js` にインライン編集用のダブルクリックハンドラを追加する
- [x] T035 [US6] `src/ui/fileList.js` にインライン編集用入力フィールドを実装する（span を input に置換）
- [x] T036 [US6] `src/ui/fileList.js` で Enter キーによる確定と Escape キーによるキャンセルを処理する
- [x] T037 [US6] `src/style.css` にインライン編集用のCSSスタイルを追加する

**チェックポイント**: US6が完了。ファイル名編集が動作する状態。

---

## フェーズ 6: ブラッシュアップ & 横断的関心事

**目的**: エッジケースへの対応とUXの改善

- [x] T038 [P] `src/services/fileService.js` で IndexedDB が使用不可（プライベートモードなど）な場合に警告メッセージを表示する処理を追加する
- [x] T039 [P] `src/ui/fileList.js` に長いファイル名の省略表示とツールチップを追加する
- [x] T040 `quickstart.md` の検証を実行する（手動テストチェックリスト）

---

## 依存関係と実行順序

### フェーズの依存関係

- **セットアップ (フェーズ 1)**: 依存関係なし - すぐに開始可能
- **基盤実装 (フェーズ 2)**: セッアップに依存 - すべての P2 ユーザーストーリーをブロックします
- **ユーザーストーリー (フェーズ 3-5)**: すべて基盤実装フェーズの完了に依存します
  - P2 ストーリー（US4, US5, US6）はフェーズ2完了後に並列で進めることが可能です
- **ブラッシュアップ (フェーズ 6)**: すべてのユーザーストーリーの完了に依存します

### ユーザーストーリーの依存関係

- **US1-3 (P1)**: 基盤実装フェーズでまとめて実装（密結合）
- **US4 (P2)**: 基盤実装後に開始可能 - US5/US6 への依存なし
- **US5 (P2)**: 基盤実装後に開始可能 - US4/US6 への依存なし
- **US6 (P2)**: 基盤実装後に開始可能 - US4/US5 への依存なし

### 各フェーズ内での順序

1. Repository層の後にService層
2. Service層の後にUI層
3. 統合の前にコア実装

### 並列実行の機会

- T002 は T001 の完了と並列で実行可能
- T029（ダウンロードユーティリティ）はフェーズ4の他のタスクと並列で実行可能
- フェーズ 3, 4, 5 は相互に並列で実行可能（異なる機能のため）
- フェーズ 6 の [P] 印が付いたタスクはすべて並列で実行可能

---

## 並列実行の例: P2 ストーリー

```bash
# 基盤実装フェーズ完了後、P2ストーリーを並列で開始する場合:

# 開発者 A: ユーザーストーリー 4 (削除)
Task: "T024 [US4] src/services/fileService.js に deleteFile(id) メソッドを実装する"
Task: "T025 [US4] src/ui/fileList.js のファイルリストアイテムに削除ボタンを追加する"
...

# 開発者 B: ユーザーストーリー 5 (エクスポート)
Task: "T029 [P] [US5] src/services/fileService.js に downloadFile ユーティリティを実装する"
Task: "T030 [US5] src/services/fileService.js に exportCurrentFile() メソッドを実装する"
...

# 開発者 C: ユーザーストーリー 6 (名前変更)
Task: "T033 [US6] src/services/fileService.js に updateTitle(title) メソッドを実装する"
Task: "T034 [US6] src/ui/fileList.js にダブルクリックハンドラを追加する"
...
```

---

## 実装戦略

### MVP優先 (US1-3 のみ)

1. フェーズ 1: セットアップを完了する
2. フェーズ 2: 基盤実装 (US1-3) を完了する
3. **停止して検証**: ファイルの作成、切り替え、永続化が独立して動作することを確認する
4. 準備ができればデプロイ/デモを行う - これが機能的な MVP となる

### インクリメンタルな提供

1. セットアップ + 基盤実装の完了 → コアなファイル管理が完了 (MVP)
2. US4 (削除) の追加 → 独立してテスト → デプロイ/デモ
3. US5 (エクスポート) の追加 → 独立してテスト → デプロイ/デモ
4. US6 (名前変更) の追加 → 独立してテスト → デプロイ/デモ
5. 各ストーリーは以前の機能を壊すことなく価値を追加する

### 並列チーム戦略

複数の開発者がいる場合:

1. チーム全員でセットアップ + 基盤実装を完了させる
2. 基盤実装が完了したら:
   - 開発者 A: ユーザーストーリー 4 (削除)
   - 開発者 B: ユーザーストーリー 5 (エクスポート)
   - 開発者 C: ユーザーストーリー 6 (名前変更)
3. 各ストーリーは独立して完了し、統合される

---

## 備考

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベル = トレーサビリティのためにタスクを特定のユーザーストーリーに紐付け
- US1-3 は密結合（すべて P1） - 基盤実装でまとめて実装される
- US4-6 は独立（すべて P2） - 基盤実装後に任意の順序で実装可能
- 次に進む前に、各ストーリーを独立して検証すること
- 各タスクまたは論理的なグループごとにコミットすること
- 任意のチェックポイントで停止し、ストーリーを独立して検証すること
