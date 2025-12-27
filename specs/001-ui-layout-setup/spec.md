# Feature Specification: UIレイアウトとプロジェクトセットアップ

**Feature Branch**: `001-ui-layout-setup`
**Created**: 2025-12-27
**Status**: Draft
**Input**: Milestone 0（準備）+ Sprint 1（UIレイアウト）

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 開発サーバーの起動と静的UI表示 (Priority: P1)

開発者として、コマンド一つで開発サーバーを起動し、ブラウザでアプリケーションの基本画面を確認したい。これにより、開発を即座に開始できる環境が整う。

**Why this priority**: 開発環境がなければ何も始まらない。全ての後続作業の前提条件となる。

**Independent Test**: `npm run dev`を実行し、ブラウザでlocalhost URLにアクセスして画面が表示されることを確認する。

**Acceptance Scenarios**:

1. **Given** プロジェクトをクローンした状態, **When** `npm install`後に`npm run dev`を実行, **Then** 開発サーバーが起動しローカルURLが表示される
2. **Given** 開発サーバーが起動中, **When** ブラウザでURLにアクセス, **Then** アプリケーションの骨格（Header、Sidebar、Main）が表示される
3. **Given** 開発サーバーが起動中, **When** ソースファイルを編集, **Then** ブラウザが自動的に更新される

---

### User Story 2 - 3ペインレイアウトでの執筆作業 (Priority: P1)

ユーザーとして、画面左側でファイル一覧を見ながら、中央でMarkdownを編集し、右側でプレビューを確認したい。これにより、効率的な執筆ワークフローが実現する。

**Why this priority**: エディタの核心機能。3ペイン構成がなければMarkdownエディタとして機能しない。

**Independent Test**: ブラウザでアプリを開き、Files/Editor/Previewの3つの領域が適切なサイズで表示されることを確認する。

**Acceptance Scenarios**:

1. **Given** デスクトップブラウザ（幅600px以上）でアプリを開いた状態, **When** 画面を見る, **Then** 左にFiles領域、中央にEditor領域、右にPreview領域が横並びで表示される
2. **Given** 3ペインが表示された状態, **When** 各領域を確認, **Then** 各領域が適切な幅を持ち、内容がはみ出さず表示される
3. **Given** Editor領域, **When** テキストエリアをクリック, **Then** 入力可能な状態になる

---

### User Story 3 - モバイル端末での閲覧 (Priority: P2)

ユーザーとして、スマートフォンやタブレットでもアプリを使用したい。狭い画面ではEditor/Previewを切り替えて表示することで、限られたスペースでも作業できる。

**Why this priority**: レスポンシブ対応は重要だが、デスクトップでの基本機能が優先。

**Independent Test**: ブラウザの幅を600px未満に縮小し、レイアウトが縮退モードに切り替わることを確認する。

**Acceptance Scenarios**:

1. **Given** ブラウザ幅が600px未満, **When** 画面を見る, **Then** Sidebarが非表示またはオーバーレイ表示になる
2. **Given** モバイルレイアウト, **When** Editor/Previewの切替ボタンをタップ, **Then** 表示が切り替わる
3. **Given** モバイルレイアウトでEditorを表示中, **When** ブラウザ幅を600px以上に広げる, **Then** 自動的に3ペインレイアウトに戻る

---

### User Story 4 - ダークモードでの作業 (Priority: P3)

ユーザーとして、目に優しいダークモードで作業したい。システム設定に連動して自動的に切り替わることで、手動設定なしで快適に使える。

**Why this priority**: 視認性向上の付加価値。基本機能が動いた後の改善項目。

**Independent Test**: OSのダークモード設定を切り替え、アプリの配色が連動して変化することを確認する。

**Acceptance Scenarios**:

1. **Given** OSがライトモード設定, **When** アプリを開く, **Then** 明るい背景色で表示される
2. **Given** OSがダークモード設定, **When** アプリを開く, **Then** 暗い背景色で表示される
3. **Given** アプリを開いた状態, **When** OSのモード設定を切り替える, **Then** リロードなしでアプリの配色が変わる

---

### User Story 5 - コード品質の維持 (Priority: P2)

開発者として、コーディング規約に従ったコードを書きたい。自動フォーマットとリント機能により、一貫したコードスタイルを維持できる。

**Why this priority**: 長期的な保守性のため重要。初期セットアップ時に設定すべき。

**Independent Test**: `npm run lint`と`npm run format`を実行し、エラーなく完了することを確認する。

**Acceptance Scenarios**:

1. **Given** プロジェクトがセットアップされた状態, **When** `npm run lint`を実行, **Then** コードスタイルの問題があれば報告される
2. **Given** フォーマットが崩れたコード, **When** `npm run format`を実行, **Then** 自動的に整形される
3. **Given** 規約に沿わないコード, **When** ファイルを保存, **Then** 自動フォーマットが適用される（エディタ設定依存）

---

### Edge Cases

- ブラウザ幅がちょうど600pxの境界値の場合、どちらのレイアウトが適用されるか（600px未満でモバイル、600px以上でデスクトップ）
- JavaScriptが無効化されている場合の表示（最低限のHTML構造は表示される）
- 極端に狭い画面幅（320px未満）での表示（最小幅を設定し、横スクロールを許容）
- prefers-color-schemeをサポートしない古いブラウザ（ライトモードをデフォルトとする）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: アプリケーションは開発コマンド（`npm run dev`）で起動できなければならない
- **FR-002**: 起動後、ブラウザでアクセス可能なローカルURLが提供されなければならない
- **FR-003**: 画面はHeader、Left Sidebar（Files）、Main（Editor + Preview）の構成で表示されなければならない
- **FR-004**: デスクトップ幅（600px以上）では3ペイン（Files / Editor / Preview）が横並びで表示されなければならない
- **FR-005**: モバイル幅（600px未満）ではSidebarが縮退し、Editor/Previewが切替表示されなければならない
- **FR-006**: Editor領域にはテキスト入力が可能なエリアを配置しなければならない
- **FR-007**: Preview領域はEditorの内容を表示する領域として確保されなければならない（この段階では静的でよい）
- **FR-008**: CSSカスタムプロパティを使用し、テーマ変更に対応できる構造にしなければならない
- **FR-009**: `prefers-color-scheme`メディアクエリでOSのダークモード設定を検出し、配色を切り替えなければならない
- **FR-010**: ESLintによるコード検査（`npm run lint`）が実行できなければならない
- **FR-011**: Prettierによる自動整形（`npm run format`）が実行できなければならない
- **FR-012**: ファイル変更時に自動でブラウザがリロード（HMR）されなければならない

### Key Entities

- **LayoutState**: 現在のレイアウトモード（desktop / mobile）、サイドバーの開閉状態
- **ThemeState**: 現在のテーマ（system / light / dark）、システム設定から検出された値

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `npm run dev`実行から3秒以内にブラウザでアプリが表示される
- **SC-002**: デスクトップ表示（600px以上）で3ペインが正しく横並びになり、各ペインがクリック可能である
- **SC-003**: ブラウザ幅を600px未満に縮小した際、1秒以内にレイアウトが縮退モードに切り替わる
- **SC-004**: OSのダークモード設定切替後、リロードなしで1秒以内にアプリの配色が変更される
- **SC-005**: `npm run lint`がエラーなく完了する
- **SC-006**: `npm run format`がエラーなく完了し、コードが一貫したスタイルになる
- **SC-007**: ソースファイル保存後、2秒以内にブラウザが更新される（HMR）

## Assumptions

- 開発者はNode.js（v18以上推奨）がインストールされた環境を持っている
- モダンブラウザ（Chrome、Firefox、Safari、Edge の最新版）をターゲットとする
- Internet Explorer はサポート対象外
- ResizeObserverはモダンブラウザで広くサポートされているため、ポリフィル不要
- 600pxの閾値は一般的なモバイル/デスクトップの境界として妥当
