# Implementation Plan: Web Worker + パフォーマンス最適化

**Branch**: `005-web-worker-optimization` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-web-worker-optimization/spec.md`

## Summary

MarkdownパースをWeb Workerへ移管し、メインスレッドをブロックせずにプレビュー更新を行う。requestIdパターンにより古い結果を破棄し、長文（5,000文字以上）でも入力遅延を体感しない滑らかな編集体験を実現する。

## Technical Context

**Language/Version**: JavaScript (ES2020+), HTML, CSS
**Primary Dependencies**: Vite（開発サーバー/ビルド）, ESLint, Prettier
**Storage**: IndexedDB（既存fileRepository.js）
**Testing**: 手動テスト（ブラウザ開発者ツール）
**Target Platform**: モダンブラウザ（Chrome, Firefox, Safari, Edge）
**Project Type**: Single（ブラウザ完結型Webアプリケーション）
**Performance Goals**: 入力→プレビュー反映 p95 < 150ms、5,000〜20,000文字で破綻しない
**Constraints**: フレームワーク禁止（Vanilla JS Only）、XSS対策必須
**Scale/Scope**: 単一ユーザー、ローカルブラウザ完結

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 準拠状況 | 備考 |
|------|----------|------|
| I. Vanilla JS Only | ✅ 準拠 | Web Worker APIはブラウザ標準、外部ライブラリ不使用 |
| II. XSS Prevention | ✅ 準拠 | 既存markdownService.jsのエスケープ処理をWorkerでも使用 |
| III. Performance First | ✅ 準拠 | 本スプリントの中核目標、Worker導入でメインスレッド負荷軽減 |
| IV. Separation of Concerns | ✅ 準拠 | workers/ディレクトリに計算処理を分離 |
| V. Simplicity | ✅ 準拠 | requestIdパターンは最小限の複雑さで目標達成 |

**ゲート結果**: 全原則に準拠、Phase 0進行可

## Project Structure

### Documentation (this feature)

```text
specs/005-web-worker-optimization/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── worker-protocol.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── main.js                    # エントリーポイント（既存）
├── ui/
│   ├── layout.js              # DOM参照（既存）
│   ├── bindings.js            # イベントハンドリング（既存・修正）
│   ├── theme.js               # テーマ（既存）
│   ├── fileList.js            # ファイル一覧（既存）
│   └── toast.js               # トースト通知（既存）
├── services/
│   ├── markdownService.js     # パース仕様（既存・Worker移植元）
│   ├── previewService.js      # プレビュー更新（既存・大幅修正）
│   ├── workerService.js       # Worker管理（新規）
│   ├── autosaveService.js     # 自動保存（既存）
│   ├── fileService.js         # ファイル操作（既存）
│   ├── shortcutService.js     # ショートカット（既存）
│   └── toastService.js        # トースト管理（既存）
├── repositories/
│   └── fileRepository.js      # IndexedDB（既存）
└── workers/
    └── markdown-worker.js     # パース処理Worker（新規）
```

**Structure Decision**: 既存の単一プロジェクト構造を維持。`src/workers/`ディレクトリを新規追加し、`src/services/workerService.js`でWorker管理を行う。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| なし | - | - |

本スプリントは憲法で定義済みのWorker導入であり、複雑さの追加ではなく既定路線の実装である。
