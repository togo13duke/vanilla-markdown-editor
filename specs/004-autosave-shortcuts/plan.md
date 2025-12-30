# Implementation Plan: 自動保存・デバウンス・ショートカット

**Branch**: `004-autosave-shortcuts` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-autosave-shortcuts/spec.md`

## Summary

Sprint 4は執筆体験の品質向上を目的とし、以下の機能を実装する：

1. **自動保存**: 入力停止後700〜1200msでIndexedDBに自動保存
2. **デバウンス**: プレビュー更新（100〜250ms）と自動保存を別タイマーで管理
3. **ショートカット**: Cmd/Ctrl+S（保存）、Cmd/Ctrl+B（太字）
4. **トースト通知**: 保存成功/失敗をユーザーにフィードバック

既存のfileRepository.js（Sprint 3実装済み）とpreviewService.js（Sprint 2実装済み）を活用し、新規にautosaveService.js、shortcutService.js、toastService.jsを追加する。

## Technical Context

**Language/Version**: JavaScript (ES2020+)
**Primary Dependencies**: なし（Vanilla JS、開発ツールはVite/ESLint/Prettierのみ）
**Storage**: IndexedDB（fileRepository.js経由）
**Testing**: 手動テスト（quickstart.mdの手順に従う）
**Target Platform**: デスクトップブラウザ（Chrome, Firefox, Safari, Edge）
**Project Type**: single（フロントエンドのみのSPA）
**Performance Goals**: 入力→プレビュー反映 p95 < 150ms、入力遅延を体感しない
**Constraints**: 5,000〜20,000文字でも破綻しない、デバウンス必須
**Scale/Scope**: 単一ユーザー、ローカルブラウザ内で完結

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| 原則                       | 状態    | 確認内容                                                         |
| -------------------------- | ------- | ---------------------------------------------------------------- |
| I. Vanilla JS Only         | ✅ 合格 | 外部ライブラリ不使用、ES Modulesのみ                             |
| II. XSS Prevention         | ✅ 合格 | 本スプリントは入力/保存/ショートカットのみ、HTMLレンダリングなし |
| III. Performance First     | ✅ 合格 | デバウンス（プレビュー100〜250ms、自動保存700〜1200ms）を実装    |
| IV. Separation of Concerns | ✅ 合格 | services/にautosaveService, shortcutService, toastServiceを追加  |
| V. Simplicity              | ✅ 合格 | 必要最小限の機能のみ実装、複雑なパターンは導入しない             |

**結果**: 全ゲート合格。Phase 0に進む。

## Project Structure

### Documentation (this feature)

```text
specs/004-autosave-shortcuts/
├── spec.md              # 仕様書
├── plan.md              # このファイル
├── research.md          # Phase 0 出力
├── data-model.md        # Phase 1 出力
├── quickstart.md        # Phase 1 出力
├── contracts/           # Phase 1 出力
└── tasks.md             # Phase 2 出力（/speckit.tasksで生成）
```

### Source Code (repository root)

```text
src/
├── main.js                    # エントリポイント（初期化処理を拡張）
├── style.css                  # トースト通知用スタイルを追加
├── ui/
│   ├── layout.js              # DOM参照
│   ├── bindings.js            # イベントバインディング（ショートカット統合）
│   ├── fileList.js            # ファイル一覧
│   ├── theme.js               # ダークモード
│   └── toast.js               # [NEW] トースト通知UI
├── services/
│   ├── fileService.js         # ファイル操作（自動保存と連携）
│   ├── markdownService.js     # Markdownパーサ
│   ├── previewService.js      # プレビュー更新（デバウンス追加）
│   ├── autosaveService.js     # [NEW] 自動保存スケジューリング
│   ├── shortcutService.js     # [NEW] キーボードショートカット
│   └── toastService.js        # [NEW] トースト通知管理
└── repositories/
    └── fileRepository.js      # IndexedDB CRUD
```

**Structure Decision**: 既存のui/services/repositories構造を維持し、新規ファイルを追加。憲法の「Separation of Concerns」原則に準拠。

## Complexity Tracking

> 違反なし。追加の複雑さの正当化は不要。
