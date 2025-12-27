# Implementation Plan: Markdownパーサ

**Branch**: `002-markdown-parser` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-markdown-parser/spec.md`

## Summary

ユーザーがエディタに入力したMarkdownテキストを安全なHTMLに変換し、リアルタイムでプレビューペインに表示する機能を実装する。正規表現ベースのサブセットパーサを自作し、XSS対策を設計レベルで組み込む。サポートする記法は見出し、太字、斜体、リンク、インラインコード、コードブロックに限定する。

## Technical Context

**Language/Version**: JavaScript (ES2020+)
**Primary Dependencies**: なし（Vanilla JS、開発ツールはVite/ESLint/Prettierのみ）
**Storage**: N/A（このスプリントでは永続化なし）
**Testing**: ブラウザ手動テスト + コンソールログ（フォーマルなテストフレームワークは未導入）
**Target Platform**: モダンブラウザ（Chrome, Firefox, Safari, Edge最新版）
**Project Type**: Single（フロントエンドのみのSPA）
**Performance Goals**: 入力→プレビュー反映 p95 < 150ms、5,000文字以上でも応答性維持
**Constraints**: メインスレッドでのパース処理を許容（Sprint 5でWorker化）、XSS攻撃を100%ブロック
**Scale/Scope**: 単一ユーザー、ローカル実行、5,000〜20,000文字規模

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 準拠状況 | 詳細 |
|------|----------|------|
| I. Vanilla JS Only | ✅ PASS | 外部ライブラリなし、ES Modules使用、Markdownパーサ自作 |
| II. XSS Prevention | ✅ PASS | エスケープ処理を先に実装、javascript:スキーム拒否、innerHTML使用は最終反映のみ |
| III. Performance First | ⚠️ PARTIAL | デバウンス導入予定、メインスレッドパースは許容（Sprint 5でWorker化） |
| IV. Separation of Concerns | ✅ PASS | services/markdownService.js, services/previewService.js, ui/bindings.jsに分離 |
| V. Simplicity (YAGNI) | ✅ PASS | 最小サブセット（見出し/太字/斜体/リンク/コード）のみ実装 |

**Gate Result**: PASS（Performance Firstは計画的な段階実装として許容）

## Project Structure

### Documentation (this feature)

```text
specs/002-markdown-parser/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output（内部APIのみ）
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── main.js                    # アプリ初期化（既存）
├── style.css                  # スタイル（既存）
├── ui/
│   ├── layout.js              # レイアウト管理（既存）
│   ├── theme.js               # テーマ管理（既存）
│   └── bindings.js            # イベントバインディング（新規）
└── services/
    ├── markdownService.js     # Markdownパース（新規）
    └── previewService.js      # プレビュー更新制御（新規）
```

**Structure Decision**: 既存のフロントエンド構造を維持し、services/ディレクトリにパース・プレビューロジックを追加。UIイベント処理はui/bindings.jsに集約。

## Complexity Tracking

> 憲法違反はなし。追加の複雑さの正当化は不要。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| なし | - | - |
