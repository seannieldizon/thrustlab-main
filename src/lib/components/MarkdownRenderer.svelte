<script lang="ts">
    import { marked } from 'marked';
    import DOMPurify from 'isomorphic-dompurify';
    import hljs from 'highlight.js';

    // Import a theme (VS Code Dark style)
    import 'highlight.js/styles/vs2015.css'; 

    export let content: string | Promise<string> = '';

    // Configure marked to use highlight.js for code blocks
    const renderer = new marked.Renderer();

    // Custom code renderer
    renderer.code = ({ text, lang }) => {
        const validLang = !!(lang && hljs.getLanguage(lang));
        const highlighted = validLang 
        ? hljs.highlight(text, { language: lang }).value 
        : hljs.highlightAuto(text).value;
    
        return `<pre><code class="hljs ${lang || ''}">${highlighted}</code></pre>`;
    };

    marked.setOptions({ renderer });

    let htmlContent = '';

    $: (async () => {
        try {
            const resolved: string = typeof content === 'string' ? content : await content;
            const parsed = await Promise.resolve(marked.parse(resolved || ''));
            htmlContent = DOMPurify.sanitize(parsed as string);
        } catch (e) {
            htmlContent = DOMPurify.sanitize('');
            console.error('MarkdownRenderer parse error', e);
        }
    })();
</script>

<div class="markdown-body prose dark:prose-invert max-w-none">
    {@html htmlContent}
</div>

<style>
    /* Basic styling for markdown content */
    :global(.markdown-body) {
        font-family: inherit;
        line-height: 1.6;
    }

    :global(.markdown-body p) {
        margin-bottom: 1em;
    }

    :global(.markdown-body p:last-child) {
        margin-bottom: 0;
    }

    :global(.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6) {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
        line-height: 1.25;
    }

    :global(.markdown-body h1) { font-size: 1.5em; }
    :global(.markdown-body h2) { font-size: 1.3em; }
    :global(.markdown-body h3) { font-size: 1.1em; }

    :global(.markdown-body ul, .markdown-body ol) {
        margin-bottom: 1em;
        padding-left: 1.5em;
    }

    :global(.markdown-body li) {
        margin-bottom: 0.25em;
    }

    :global(.markdown-body code) {
        background: rgba(0, 0, 0, 0.2);
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: monospace;
        font-size: 0.9em;
    }

    :global(.markdown-body pre) {
        background: #1e1e1e;
        padding: 1em;
        border-radius: 8px;
        overflow-x: auto;
        margin-bottom: 1em;
    }

    :global(.markdown-body pre code) {
        background: transparent;
        padding: 0;
        border-radius: 0;
        color: inherit;
    }

    :global(.markdown-body blockquote) {
        border-left: 4px solid rgba(255, 255, 255, 0.2);
        padding-left: 1em;
        margin-left: 0;
        margin-bottom: 1em;
        color: rgba(255, 255, 255, 0.7);
    }

    :global(.markdown-body a) {
        color: var(--font-accent-cyan, #00CED1);
        text-decoration: underline;
    }

    :global(.markdown-body strong) {
        font-weight: 700;
        color: inherit;
    }

    :global(.markdown-body em) {
        font-style: italic;
    }

    :global(.markdown-body table) {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 1em;
    }

    :global(.markdown-body th, .markdown-body td) {
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 0.5em;
        text-align: left;
    }

    :global(.markdown-body th) {
        background: rgba(255, 255, 255, 0.1);
        font-weight: 600;
    }
</style>
