<!--
=== Sync Impact Report ===
Version change: N/A → 1.0.0 (初回作成)
Modified principles: N/A (新規)
Added sections: Core Principles (5項目), Technology Constraints, Development Workflow
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ Constitution Check セクションと整合
  - .specify/templates/spec-template.md ✅ セキュリティ要件と整合
  - .specify/templates/tasks-template.md ✅ フェーズ構造と整合
Follow-up TODOs: None
-->

# Vanilla Markdown Editor Constitution

## Core Principles

### I. Vanilla JS Only（フレームワーク禁止）

本プロジェクトは学習目的として、外部フレームワーク（React, Vue, Angular等）を使用しない。

- ES2020+ と ES Modules のみを使用する
- 依存ライブラリは開発ツール（Vite, ESLint, Prettier）に限定する
- Markdownパーサは自作する（外部ライブラリ marked 等は使用しない）
- ブラウザAPIを直接活用する（IndexedDB, Web Workers, File API, Clipboard API, ResizeObserver）

**根拠**: フレームワーク無しでアーキテクチャ設計・状態管理・非同期処理を習得するため。

### II. XSS Prevention（セキュリティ最優先）

ユーザー入力からのXSS攻撃を設計レベルで防止する。これは交渉不可の要件である。

- 生HTML（`<script>`等）の実行を許可しない
- 出力は必ずエスケープ済みテキストから安全なタグのみを構築する
- `innerHTML`使用は最終的な安全なHTML反映に限定する
- URLリンクは`javascript:`スキームを拒否する
- 仕様外入力でも「崩れても落ちない」を優先する

**根拠**: Markdownエディタはユーザー入力を直接HTMLとして表示するため、XSSリスクが本質的に高い。

### III. Performance First（入力の滑らかさ）

「キー入力遅延を感じない」体験を実現する。目標: 入力→プレビュー反映 p95 < 150ms。

- 入力イベントでは重い処理を実行しない
- デバウンスで頻度を制御する
  - プレビュー更新: 100〜250ms
  - 自動保存: 700〜1200ms
- MarkdownパースはWeb Workerで実行する
- requestIdパターンで古い結果を破棄し、最新のみ反映する

**根拠**: エディタの価値は「途切れない執筆体験」にある。

### IV. Separation of Concerns（関心の分離）

UIと永続化/パースを明確に分離する。

- **ui/**: DOM描画・イベントハンドリング（直接DOM操作はここのみ）
- **services/**: ビジネスロジック（editor, preview, autosave, outline）
- **repositories/**: データ永続化（IndexedDB CRUD）
- **workers/**: 計算処理のオフロード（Markdownパース）

**根拠**: メインスレッドを軽く保ち、テスト可能性と保守性を確保するため。

### V. Simplicity（YAGNI原則）

必要最小限の実装に留め、過度な抽象化を避ける。

- 仕様外の機能は実装しない（共同編集、完全CommonMark準拠、サーバ同期等）
- 複雑なパターンは必要になるまで導入しない
- 削れる機能は削る（MutationObserver、設定画面等は後回し）
- 削れない機能を優先する（IndexedDB複数ファイル、自動保存、XSS対策）

**根拠**: 学習目的として「動くもの優先」で進め、複雑さは段階的に追加する。

## Technology Constraints

### 技術スタック

| カテゴリ | 技術 |
|---------|------|
| 言語 | JavaScript (ES2020+), HTML, CSS |
| 開発ツール | Vite, ESLint, Prettier |
| 永続化 | IndexedDB（主）, LocalStorage（補助フォールバック） |
| 並列処理 | Web Workers |
| レスポンシブ | CSS Grid/Flex, ResizeObserver |

### Markdownサブセット（MVP対応範囲）

対応する記法:
- 見出し: `#`〜`######`（行頭）
- 強調: `**太字**`, `*斜体*`
- リンク: `[text](url)`
- コードブロック: ` ```lang...``` `
- 改行: `\n` → `<br>`

非対応（MVP外）:
- 表、脚注、タスクリスト、数式、HTML直書き、ネストの厳密解釈

## Development Workflow

### スプリント構成

| フェーズ | 目的 |
|---------|------|
| M0 | 準備（Vite, ESLint/Prettier, 画面骨格） |
| S1 | UIレイアウト（3ペイン、レスポンシブ、ダークモード） |
| S2 | Markdownパーサ（正規表現、XSS対策） |
| S3 | ファイル管理（IndexedDB、エクスポート） |
| S4 | 自動保存、デバウンス、ショートカット |
| S5 | Web Worker最適化 |
| S6 | Clipboard、Outline、仕上げ |

### 品質ゲート

- XSSとデータ消失はMVPからブロッカー扱い
- 5,000〜20,000文字規模で破綻しないこと
- 主要ユースケースの手動テスト手順で再現可能であること

## Governance

- 本憲法はプロジェクトの全ての設計・実装判断に優先する
- 原則の変更は、理由の文書化と影響範囲の評価を必要とする
- 各PRは憲法への準拠を確認すること
- 複雑さの追加には正当化（Complexity Tracking）を必要とする

**Version**: 1.0.0 | **Ratified**: 2025-12-27 | **Last Amended**: 2025-12-27
