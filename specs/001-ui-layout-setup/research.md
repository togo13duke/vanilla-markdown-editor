# Research: UIレイアウトとプロジェクトセットアップ

**Feature**: 001-ui-layout-setup
**Date**: 2025-12-27

## 1. Vite設定のベストプラクティス

### Decision
Vite Vanillaテンプレートを使用し、最小限の設定で開始する。

### Rationale
- Viteはゼロコンフィグで動作し、学習コストが低い
- ES Modulesネイティブサポートでバンドラー設定不要
- HMR（Hot Module Replacement）がデフォルトで有効

### Alternatives Considered
| 選択肢 | 評価 | 却下理由 |
|--------|------|----------|
| Webpack | △ | 設定が複雑、学習目的に不適合 |
| Parcel | ○ | Viteより新しい機能が少ない |
| 素のESM | △ | 開発体験（HMR）が劣る |

### Configuration
```javascript
// vite.config.js
export default {
  root: '.',
  build: {
    outDir: 'dist',
  },
};
```

## 2. CSS Grid/Flexboxによる3ペインレイアウト

### Decision
CSS Gridをメインレイアウトに使用し、FlexboxをPane内部に使用する。

### Rationale
- CSS Gridは2次元レイアウトに最適（行・列の同時制御）
- 3ペイン構成は`grid-template-columns`で簡潔に表現可能
- Flexboxは1次元（行または列）の配置に使用

### Layout Structure
```css
.app-container {
  display: grid;
  grid-template-rows: auto 1fr;  /* Header + Main */
  grid-template-columns: 200px 1fr 1fr;  /* Sidebar, Editor, Preview */
  height: 100vh;
}

.header {
  grid-column: 1 / -1;  /* 全列にまたがる */
}

.sidebar { grid-column: 1; }
.editor { grid-column: 2; }
.preview { grid-column: 3; }
```

### Alternatives Considered
| 選択肢 | 評価 | 却下理由 |
|--------|------|----------|
| Flexboxのみ | △ | ネストが深くなる |
| Float | × | 現代的でない、複雑 |
| Table | × | セマンティックに不適切 |

## 3. ResizeObserverによるレスポンシブ切替

### Decision
ResizeObserverを使用し、ブレークポイント（600px）でレイアウトモードを切り替える。

### Rationale
- `window.resize`イベントより効率的（要素サイズの変化を直接監視）
- モダンブラウザで広くサポート（IE以外）
- デバウンス不要（ブラウザが最適化）

### Implementation Pattern
```javascript
const observer = new ResizeObserver((entries) => {
  const width = entries[0].contentRect.width;
  const isMobile = width < 600;
  document.body.classList.toggle('mobile-layout', isMobile);
});

observer.observe(document.querySelector('.app-container'));
```

### Alternatives Considered
| 選択肢 | 評価 | 却下理由 |
|--------|------|----------|
| CSSメディアクエリのみ | △ | JSからの状態取得が困難 |
| window.resize | △ | パフォーマンスが劣る |
| matchMedia | ○ | 補助として併用可能 |

## 4. CSS Variablesによるテーマ切替

### Decision
CSS Custom Propertiesと`prefers-color-scheme`メディアクエリを組み合わせる。

### Rationale
- ランタイムでのテーマ切替がJSなしで可能
- 一箇所で色定義を管理できる
- `prefers-color-scheme`でOS設定を自動検出

### Implementation Pattern
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #1a1a1a;
  --border-color: #e0e0e0;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --text-primary: #f0f0f0;
    --border-color: #404040;
  }
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
```

### Alternatives Considered
| 選択肢 | 評価 | 却下理由 |
|--------|------|----------|
| classトグルのみ | △ | OS連動が別途必要 |
| Sass変数 | × | ランタイム切替不可 |
| JS強制切替 | △ | 初期フラッシュの懸念 |

## 5. ESLint/Prettier設定

### Decision
ESLint flat config（eslint.config.js）とPrettierを組み合わせ、eslint-config-prettierで競合を解消する。

### Rationale
- ESLint v9+ではflat configが推奨
- Prettierとの統合で二重の設定を避ける
- 最小限のルールセットで開始し、必要に応じて追加

### Configuration Files

**eslint.config.js**
```javascript
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
];
```

**.prettierrc**
```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Alternatives Considered
| 選択肢 | 評価 | 却下理由 |
|--------|------|----------|
| ESLint legacy config | △ | 非推奨、将来的に廃止 |
| Biome | ○ | 新しいツール、エコシステム未成熟 |
| 設定なし | × | コード品質維持に必要 |

## 6. モバイルレイアウト縮退戦略

### Decision
600px未満でサイドバーを非表示にし、Editor/Previewをタブ切替で表示する。

### Rationale
- 600pxは一般的なモバイル/タブレットの境界
- サイドバー非表示で編集領域を最大化
- タブ切替でシンプルなUXを実現

### Implementation
```css
@media (max-width: 599px) {
  .sidebar {
    display: none;
  }

  .main-content {
    grid-template-columns: 1fr;
  }

  .editor, .preview {
    display: none;
  }

  .editor.active, .preview.active {
    display: block;
  }
}
```

### Tab Switching
```javascript
function switchPane(paneName) {
  document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
  document.querySelector(`.${paneName}`).classList.add('active');
}
```

## Summary

| 領域 | 決定 |
|------|------|
| ビルドツール | Vite（Vanillaテンプレート） |
| レイアウト | CSS Grid + Flexbox |
| レスポンシブ | ResizeObserver（600px閾値） |
| テーマ | CSS Variables + prefers-color-scheme |
| リント/フォーマット | ESLint flat config + Prettier |
| モバイル対応 | タブ切替（Editor/Preview） |

全ての技術選択は憲法の原則に準拠している。
