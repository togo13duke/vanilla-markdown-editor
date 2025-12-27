# Implementation Plan: ファイル管理機能

**Branch**: `003-file-management` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-file-management/spec.md`

## Summary

複数のMarkdownファイルを作成・管理・永続化できる機能を実装する。IndexedDBを使用してブラウザ再起動後もファイルを復元し、ファイルの作成・切替・削除・エクスポート（.mdダウンロード）・ファイル名変更機能を提供する。Repository層でIndexedDB操作をカプセル化し、UI層とサービス層から分離することで、関心の分離を維持する。

## Technical Context

**Language/Version**: JavaScript (ES2020+)
**Primary Dependencies**: なし（Vanilla JS、開発ツールはVite/ESLint/Prettierのみ）
**Storage**: IndexedDB（ブラウザ内永続化）
**Testing**: 手動テスト（ユーザーシナリオベース）
**Target Platform**: モダンブラウザ（Chrome, Firefox, Safari, Edge最新版）
**Project Type**: Web（SPA、フロントエンドのみ）
**Performance Goals**: ファイル切替1秒以内、100ファイル程度を想定
**Constraints**: オフライン対応必須、フレームワーク使用禁止、外部ライブラリ禁止
**Scale/Scope**: 100ファイル程度、1ファイルあたり最大1MB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 準拠状況 | 詳細 |
|------|----------|------|
| I. Vanilla JS Only | ✅ 準拠 | IndexedDB APIを直接使用、外部ライブラリなし |
| II. XSS Prevention | ✅ 該当なし | ファイル管理機能はHTMLレンダリングを行わない |
| III. Performance First | ✅ 準拠 | IndexedDB操作は非同期、ファイル切替1秒以内を目標 |
| IV. Separation of Concerns | ✅ 準拠 | Repository層でIndexedDBを隔離、UI/サービス/永続化を分離 |
| V. Simplicity | ✅ 準拠 | CRUD操作のみ、高度な検索やフィルタは実装しない |

**品質ゲート確認**:
- [x] データ消失防止: IndexedDBによる永続化で対応
- [x] XSSブロッカー: 該当なし（ファイル管理はデータ操作のみ）
- [x] 入力の滑らかさ: ファイル操作はUIブロッキングを最小化

## Project Structure

### Documentation (this feature)

```text
specs/003-file-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── file-repository.js  # Repository契約
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── main.js                    # アプリ初期化
├── style.css                  # スタイル
├── ui/
│   ├── layout.js              # DOM参照・レンダリング
│   ├── theme.js               # ダークモード
│   ├── bindings.js            # イベントハンドリング
│   └── fileList.js            # [NEW] ファイルリストUI
├── services/
│   ├── markdownService.js     # Markdownパース
│   ├── previewService.js      # プレビュー更新
│   └── fileService.js         # [NEW] ファイル操作ロジック
├── repositories/
│   └── fileRepository.js      # [NEW] IndexedDB CRUD
└── utils/
    └── uuid.js                # [NEW] UUID生成
```

**Structure Decision**: 既存のui/services/構造を維持し、新たにrepositories/を追加。Repository層でIndexedDBを隔離し、fileServiceがRepositoryを呼び出し、UIがfileServiceを呼び出す構造とする。

## Complexity Tracking

該当なし - Constitution Checkに違反はなく、すべての原則に準拠している。

## Constitution Check (Post-Design)

*Phase 1 設計完了後の再確認*

| 原則 | 準拠状況 | Phase 1 設計での確認 |
|------|----------|---------------------|
| I. Vanilla JS Only | ✅ 準拠 | Promise ラッパーを自作、外部ライブラリなし |
| II. XSS Prevention | ✅ 該当なし | ファイル管理は innerHTML を使用しない |
| III. Performance First | ✅ 準拠 | 全操作が async/await、UI ブロッキングなし |
| IV. Separation of Concerns | ✅ 準拠 | Repository/Service/UI の 3 層分離を設計 |
| V. Simplicity | ✅ 準拠 | 単一 ObjectStore、シンプルな CRUD のみ |

**設計成果物**:
- [research.md](./research.md) - 技術決定と根拠
- [data-model.md](./data-model.md) - エンティティ定義
- [contracts/file-repository.md](./contracts/file-repository.md) - Repository 契約
- [contracts/file-service.md](./contracts/file-service.md) - Service 契約
- [quickstart.md](./quickstart.md) - 実装ガイド

**次のステップ**: `/speckit.tasks` でタスクを生成
