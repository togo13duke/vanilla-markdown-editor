const CODE_BLOCK_PATTERN = /```(\w*)\n([\s\S]*?)```/g;
const CODE_BLOCK_PLACEHOLDER = '__CODEBLOCK_';
const INLINE_CODE_PLACEHOLDER = '__INLINECODE_';

/**
 * HTMLで危険な文字をエスケープする。
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * URLを検証し、安全なスキームのみ許可する。
 * @param {string} url
 * @returns {string}
 */
export function sanitizeUrl(url) {
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:')
  ) {
    return trimmed;
  }
  return '';
}

const runSanitizeUrlChecks = () => {
  const samples = [
    'https://example.com',
    'HTTP://SAFE.COM',
    'mailto:test@example.com',
    'javascript:alert(1)',
    '  JaVaScRiPt:alert(1)  ',
  ];

  samples.forEach((sample) => {
    const result = sanitizeUrl(sample);
    console.log('[URL検証]', sample, '=>', result || '(拒否)');
  });
};

if (import.meta && import.meta.env && import.meta.env.DEV) {
  runSanitizeUrlChecks();
}

const extractCodeBlocks = (text) => {
  const blocks = [];
  const processed = text.replace(CODE_BLOCK_PATTERN, (...args) => {
    const lang = args[1] ?? '';
    const code = args[2] ?? '';
    const index = blocks.length;
    const placeholder = `${CODE_BLOCK_PLACEHOLDER}${index}__`;
    blocks.push({ lang, code, placeholder });
    return placeholder;
  });

  return { text: processed, blocks };
};

const restoreCodeBlocks = (html, blocks) => {
  let restored = html;
  blocks.forEach((block, index) => {
    const placeholder =
      block.placeholder || `${CODE_BLOCK_PLACEHOLDER}${index}__`;
    const codeHtml = `<pre><code>${block.code}</code></pre>`;
    restored = restored.replaceAll(placeholder, codeHtml);
  });
  return restored;
};

const parseBlocks = (text) => {
  const lines = text.split('\n');
  const blocks = [];
  const headings = [];
  let paragraphLines = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) {
      return;
    }
    const paragraphHtml = paragraphLines.join('<br>');
    blocks.push(`<p>${paragraphHtml}</p>`);
    paragraphLines = [];
  };

  const isCodePlaceholder = (line) =>
    new RegExp(`^${CODE_BLOCK_PLACEHOLDER}\\d+__$`).test(line);

  lines.forEach((line) => {
    if (line.trim() === '') {
      flushParagraph();
      return;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      headings.push({ level, text });
      blocks.push(`<h${level}>${text}</h${level}>`);
      return;
    }

    if (isCodePlaceholder(line.trim())) {
      flushParagraph();
      blocks.push(line.trim());
      return;
    }

    paragraphLines.push(line);
  });

  flushParagraph();

  return { html: blocks.join('\n'), headings };
};

const parseInlines = (html) => {
  const inlineCodes = [];
  let processed = html.replace(/`([^`]+?)`/g, (...args) => {
    const code = args[1] ?? '';
    const index = inlineCodes.length;
    inlineCodes.push(code);
    return `${INLINE_CODE_PLACEHOLDER}${index}__`;
  });

  processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/\*(?!\*)([^*]+?)\*(?!\*)/g, '<em>$1</em>');
  processed = processed.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, (...args) => {
    const text = args[1] ?? '';
    const url = args[2] ?? '';
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) {
      return text;
    }
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });

  processed = processed.replace(
    new RegExp(`${INLINE_CODE_PLACEHOLDER}(\\d+)__`, 'g'),
    (...args) => {
      const index = Number(args[1]);
      return `<code>${inlineCodes[index] ?? ''}</code>`;
    }
  );

  return processed;
};

/**
 * Markdownをパースして安全なHTMLを返す。
 * @param {string} markdown
 * @returns {{ html: string, headings: Array<{ level: number, text: string }> }}
 */
export function parse(markdown) {
  const source = typeof markdown === 'string' ? markdown : '';
  const escaped = escapeHtml(source);

  try {
    const { text, blocks } = extractCodeBlocks(escaped);
    const { html, headings } = parseBlocks(text);
    const withInlines = parseInlines(html);
    const restored = restoreCodeBlocks(withInlines, blocks);
    return { html: restored, headings };
  } catch (error) {
    console.error('Markdownパースに失敗しました:', error);
    if (!escaped) {
      return { html: '', headings: [] };
    }
    return { html: `<p>${escaped}</p>`, headings: [] };
  }
}
