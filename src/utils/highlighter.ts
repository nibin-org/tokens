export type HighlightLanguage = 'css' | 'scss' | 'tailwind' | 'js';

/**
 * A lightweight, dependency-free regex-based syntax highlighter.
 * Supports CSS, SCSS, JavaScript, and Tailwind (JSX).
 */
export const highlightCode = (code: string, lang: HighlightLanguage): string => {
    if (!code) return '';

    // First escape HTML entities
    let escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    if (lang === 'css' || lang === 'scss') {
        // Robust regex for CSS/SCSS - support :root, variables, and better property detection
        return escaped.replace(
            /(\/\*[\s\S]*?\*\/)|(^[ \t]*(?::root|&amp;|\.|@)[a-zA-Z0-9:_-]*)|((?:--|\$|[a-zA-Z-])[a-zA-Z0-9-]*|"[^"]*"|'[^']*')(?=[ \t]*:)|(var\(--[a-zA-Z0-9-]+\)|\$[a-zA-Z0-9-]+|#[a-fA-F0-9]+|[0-9]+(?:\.[0-9]+)?(?:px|rem|em|%)?|'[^']*'|"[^"]*")|([\{\};:])/gm,
            (match, comment, selector, prop, value, punct) => {
                if (comment) return `<span class="ftd-sh-comment">${comment}</span>`;
                if (selector) return `<span class="ftd-sh-selector">${selector}</span>`;
                if (prop) return `<span class="ftd-sh-property">${prop}</span>`;
                if (value) return `<span class="ftd-sh-value">${match}</span>`;
                if (punct) return `<span class="ftd-sh-punctuation">${punct}</span>`;
                return match;
            }
        );
    } else if (lang === 'js') {
        // Enhanced JS highlighter for objects and config files
        return escaped.replace(
            /(\/\*[\s\S]*?\*\/|\/\/.+)|(\b(?:export|const|let|var|function|return|if|else|for|while|import|from|type|interface|module|exports|require)\b)|(".*?"|'.*?'|`[\s\S]*?`)(?=[ \t]*:)|(".*?"|'.*?'|`[\s\S]*?`)|(\b\d+(\.\d+)?\b)|([\{\}\(\)\[\],;:])|(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)(?=[ \t]*:)/g,
            (match, comment, keyword, keyStr, string, number, punct, keyIdent) => {
                if (comment) return `<span class="ftd-sh-comment">${match}</span>`;
                if (keyword) return `<span class="ftd-sh-keyword">${match}</span>`;
                if (keyStr || keyIdent) return `<span class="ftd-sh-property">${match}</span>`;
                if (string) return `<span class="ftd-sh-value">${match}</span>`; // Use value color for values
                if (number) return `<span class="ftd-sh-value">${match}</span>`;
                if (punct) return `<span class="ftd-sh-punctuation">${match}</span>`;
                return match;
            }
        );
    } else {
        // Refined pass for Tailwind/JSX - support tags, attributes, braces, and strings
        return escaped.replace(
            /(&lt;\/?[a-zA-Z0-9]+|&gt;)|([a-zA-Z-]+)(?==)|(")([^"]*)(")|([\{\}\(\)\[\],;])|(=)/g,
            (match, tag, attr, q1, stringContent, q2, punct, eq) => {
                if (tag) return `<span class="ftd-sh-tag">${tag}</span>`;
                if (attr) return `<span class="ftd-sh-attr">${attr}</span>`;
                if (q1 && q2) {
                    const highlightedClasses = stringContent.replace(
                        /([a-zA-Z0-9:\[\]\/-]+)/g,
                        (c: string) => `<span class="ftd-sh-value">${c}</span>`
                    );
                    return `<span class="ftd-sh-punctuation">${q1}</span>${highlightedClasses}<span class="ftd-sh-punctuation">${q2}</span>`;
                }
                if (punct || eq) return `<span class="ftd-sh-punctuation">${match}</span>`;
                return match;
            }
        );
    }
};
