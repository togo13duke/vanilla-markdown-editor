# Data Model: UIレイアウトとプロジェクトセットアップ

**Feature**: 001-ui-layout-setup
**Date**: 2025-12-27

## Overview

このフェーズでは永続化は行わないが、UIの状態管理に必要なデータモデルを定義する。

## Entities

### LayoutState

アプリケーションのレイアウト状態を管理する。

| フィールド | 型 | 説明 | デフォルト |
|-----------|-----|------|-----------|
| mode | `'desktop' \| 'mobile'` | 現在のレイアウトモード | `'desktop'` |
| sidebarOpen | `boolean` | サイドバーの表示状態 | `true` |
| activePane | `'editor' \| 'preview'` | モバイル時のアクティブペイン | `'editor'` |
| containerWidth | `number` | コンテナの幅（px） | `window.innerWidth` |

#### 状態遷移

```
Desktop Mode (width >= 600px)
├── sidebarOpen: true/false（ユーザー操作）
└── activePane: N/A（両方表示）

Mobile Mode (width < 600px)
├── sidebarOpen: false（強制非表示）
└── activePane: 'editor' | 'preview'（タブ切替）
```

#### バリデーションルール

- `mode` は `containerWidth` から派生する（600px境界）
- `mobile` モードでは `sidebarOpen` は常に `false`
- `activePane` は `mobile` モードでのみ有効

### ThemeState

テーマ（配色）の状態を管理する。

| フィールド | 型 | 説明 | デフォルト |
|-----------|-----|------|-----------|
| preference | `'system' \| 'light' \| 'dark'` | ユーザー設定 | `'system'` |
| resolved | `'light' \| 'dark'` | 実際に適用されるテーマ | OS設定から派生 |
| systemPreference | `'light' \| 'dark'` | OS設定から検出された値 | `matchMedia` から取得 |

#### 状態遷移

```
preference: 'system'
└── resolved = systemPreference（OS連動）

preference: 'light' | 'dark'
└── resolved = preference（ユーザー指定）
```

#### バリデーションルール

- `preference` が `'system'` の場合、`resolved` は `systemPreference` と一致
- `preference` が `'light'` または `'dark'` の場合、`resolved` は `preference` と一致

## State Management

### 初期化フロー

```javascript
// 1. LayoutState初期化
const layoutState = {
  mode: window.innerWidth >= 600 ? 'desktop' : 'mobile',
  sidebarOpen: window.innerWidth >= 600,
  activePane: 'editor',
  containerWidth: window.innerWidth,
};

// 2. ThemeState初期化
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const themeState = {
  preference: 'system',
  systemPreference: darkModeQuery.matches ? 'dark' : 'light',
  resolved: darkModeQuery.matches ? 'dark' : 'light',
};
```

### 更新トリガー

| トリガー | 更新対象 | 処理 |
|---------|---------|------|
| ResizeObserver | LayoutState | `containerWidth` → `mode` → `sidebarOpen` |
| Tab click | LayoutState | `activePane` |
| `prefers-color-scheme` change | ThemeState | `systemPreference` → `resolved` |

## DOM Mapping

状態とDOM要素の対応関係:

| 状態 | DOM要素 | 反映方法 |
|------|---------|---------|
| `layoutState.mode` | `body` | `data-layout="desktop|mobile"` |
| `layoutState.sidebarOpen` | `.sidebar` | `hidden` 属性 |
| `layoutState.activePane` | `.editor`, `.preview` | `.active` クラス |
| `themeState.resolved` | `:root` | CSS Variables（メディアクエリ経由） |

## Future Considerations

後続スプリントで追加予定:

- **FileEntity**: ファイルデータ（Sprint 3）
- **EditorState**: カーソル位置、未保存フラグ（Sprint 4）
- **AppState**: アクティブファイルID、全体の状態（Sprint 3）

これらは `data-model.md` の更新として追加される。
