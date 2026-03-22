// Lightweight markdown-ish parser for chatbot messages
// Supports: headings (# to ######), bold (**text**), italics (*text*), bold+italic (***text***),
// inline code (`code`), code blocks (```), unordered lists (- or *), ordered lists (1.),
// and preserves line breaks.

function escapeHtml(input: string) {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function parseMarkdown(raw: string): string {
    if (!raw) return '';

    // Normalize line endings
    let text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Handle fenced code blocks first
    const codeBlocks: string[] = [];
    text = text.replace(/```([\s\S]*?)```/g, (_m, code) => {
        const idx = codeBlocks.push(escapeHtml(code)) - 1;
        return `{{{CODEBLOCK_${idx}}}}`;
    });

    const lines = text.split('\n');
    const out: string[] = [];

    let inUl = false;
    let inOl = false;

    const closeLists = () => {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (inOl) { out.push('</ol>'); inOl = false; }
    };

    for (let rawLine of lines) {
        const line = rawLine.trimRight();
        if (/^\s*$/i.test(line)) {
            closeLists();
            out.push('');
            continue;
        }

        // Headings
        const hMatch = line.match(/^#{1,6}\s+(.*)$/);
        if (hMatch) {
            closeLists();
            const level = Math.min(6, (line.match(/^#+/) || [''])[0].length);
            out.push(`<h${level}>${formatInline(hMatch[1])}</h${level}>`);
            continue;
        }

        // Ordered list
        const olMatch = line.match(/^\d+\.\s+(.*)$/);
        if (olMatch) {
            if (inUl) { out.push('</ul>'); inUl = false; }
            if (!inOl) { out.push('<ol>'); inOl = true; }
            out.push(`<li>${formatInline(olMatch[1])}</li>`);
            continue;
        }

        // Unordered list (- or *)
        const ulMatch = line.match(/^[\-*]\s+(.*)$/);
        if (ulMatch) {
            if (inOl) { out.push('</ol>'); inOl = false; }
            if (!inUl) { out.push('<ul>'); inUl = true; }
            out.push(`<li>${formatInline(ulMatch[1])}</li>`);
            continue;
        }

        // Paragraph
        closeLists();
        out.push(`<p>${formatInline(line)}</p>`);
    }

    closeLists();

    let result = out.join('\n');

    // Restore code blocks
    result = result.replace(/\{\{\{CODEBLOCK_(\d+)\}\}\}/g, (_m, idx) => {
        const code = codeBlocks[Number(idx)] || '';
        return `<pre><code>${code}</code></pre>`;
    });

    return result;
}

function formatInline(input: string): string {
    let s = escapeHtml(input);

    // code spans: `code`
    s = s.replace(/`([^`]+)`/g, (_m, code) => `<code>${escapeHtml(code)}</code>`);

    // bold+italic ***text***
    s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // bold **text**
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // italic *text*
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Simple inline links [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    return s;
}

export default parseMarkdown;
