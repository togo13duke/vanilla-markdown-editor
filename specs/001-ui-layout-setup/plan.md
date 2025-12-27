# Implementation Plan: UIレイアウトとプロジェクトセットアップ

**Branch**: `001-ui-layout-setup` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ui-layout-setup/spec.md`

## Summary

Milestone 0（準備）とSprint 1（UIレイアウト）を実装する。Viteによる開発環境構築、ESLint/Prettierによるコード品質管理、3ペインレイアウト（Files/Editor/Preview）の実装、レスポンシブ対応（モバイル縮退）、ダークモード対応を行う。

## Technical Context

**Language/Version**: JavaScript (ES2020+), HTML5, CSS3
**Primary Dependencies**: Vite（開発サーバー/ビルド）, ESLint, Prettier
**Storage**: N/A（このフェーズでは永続化なし）
**Testing**: 手動テスト（E2Eは後続スプリントで検討）
**Target Platform**: モダンブラウザ（Chrome, Firefox, Safari, Edge 最新版）
**Project Type**: Single（フロントエンドのみのSPA）
**Performance Goals**: 開発サーバー起動3秒以内、HMR反映2秒以内
**Constraints**: レイアウト切替1秒以内、テーマ切替1秒以内
**Scale/Scope**: 単一ユーザー、ローカル実行

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 状態 | 確認内容 |
|------|------|----------|
| I. Vanilla JS Only | ✅ PASS | Vite/ESLint/Prettierは開発ツールのみ。フレームワーク不使用 |
| II. XSS Prevention | ✅ PASS | このフェーズではユーザー入力をHTMLに変換しない |
| III. Performance First | ✅ PASS | ResizeObserverでレイアウト切替、重い処理なし |
| IV. Separation of Concerns | ✅ PASS | ui/のみ実装。services/repositories/workersは後続 |
| V. Simplicity | ✅ PASS | 最小限のUIスケルトンのみ実装 |

**ゲート結果**: 全原則に準拠。Phase 0へ進行可。

## Project Structure

### Documentation (this feature)

```text
specs/001-ui-layout-setup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── main.js              # アプリエントリポイント
├── style.css            # グローバルスタイル、CSS Variables
└── ui/
    ├── layout.js        # DOM参照、レイアウト制御
    └── theme.js         # テーマ検出、切替

index.html               # HTMLエントリポイント
vite.config.js           # Vite設定
.eslintrc.cjs            # ESLint設定
.prettierrc              # Prettier設定
package.json             # 依存関係、スクリプト
```

**Structure Decision**: 憲法で定義されたui/services/repositories/workers構造に従う。このフェーズではui/のみ実装し、後続スプリントで他のディレクトリを追加する。

## Complexity Tracking

> 違反なし - 追加の複雑さは不要
