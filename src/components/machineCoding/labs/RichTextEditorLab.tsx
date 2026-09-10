import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Undo,
  Redo,
  Eraser,
  Copy,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Eye,
  FileCode,
  CheckCircle2,
  Edit3,
  HelpCircle,
  X,
} from 'lucide-react';

const STARTER_TEMPLATES: Record<string, { label: string; html: string }> = {
  article: {
    label: 'Engineering Blog Post',
    html: `<h1>Architecting Microfrontends with React 19</h1><p>Modern frontend engineering requires <b>decoupling domain logic</b> while maintaining <i>cohesive design systems</i> across high-velocity teams.</p><h3>Key Architectural Pillars:</h3><ul><li>Isolated compile and deployment pipelines</li><li>Asynchronous inter-module event bus</li><li>Federated dependency singletons (React, ReactDOM)</li></ul><blockquote>"Premature coupling is the root of all microfrontend migration failures." — Lead Architect</blockquote><p>Use modern native action transitions to keep state synchronous across module boundaries.</p>`,
  },
  changelog: {
    label: 'Product Release Notes',
    html: `<h1>Release Notes — Version 3.4.0</h1><p>This release delivers massive performance improvements for high-throughput data tables and virtualized tree structures.</p><h3>What's New:</h3><ul><li><b>Zero-Jank Virtualization:</b> Compositor thread scrolling with 60 FPS guarantee.</li><li><b>CSS Grid Accordions:</b> Replaced max-height hacks with dynamic 0fr to 1fr grid transitions.</li><li><b>WCAG 2.2 AAA Compliance:</b> Enhanced keyboard focus rings and ARIA live regions.</li></ul>`,
  },
  specs: {
    label: 'API Specification',
    html: `<h1>Identity & Auth Service API</h1><p>Public endpoints for JWT verification and WebAuthn credential handshakes.</p><p><code>POST /api/v1/auth/token</code></p><p>Headers required:</p><ol><li><code>Authorization: Bearer &lt;token&gt;</code></li><li><code>X-Client-Version: 2.1</code></li></ol><blockquote>All unauthenticated requests receive an automated HTTP 401 with challenge headers.</blockquote>`,
  },
};

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  h1: boolean;
  h2: boolean;
  h3: boolean;
  unorderedList: boolean;
  orderedList: boolean;
  blockquote: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
  code: boolean;
  link: boolean;
}

const INITIAL_ACTIVE_FORMATS: ActiveFormats = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  h1: false,
  h2: false,
  h3: false,
  unorderedList: false,
  orderedList: false,
  blockquote: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
  code: false,
  link: false,
};

export const RichTextEditorLab: React.FC = () => {
  const [templateKey, setTemplateKey] = useState<string>('article');
  const [activeTab, setActiveTab] = useState<'editor' | 'rawHtml' | 'preview'>('editor');
  const [htmlContent, setHtmlContent] = useState<string>(STARTER_TEMPLATES.article.html);
  const [copied, setCopied] = useState(false);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(INITIAL_ACTIVE_FORMATS);
  const [hoveredTool, setHoveredTool] = useState<{ id: string; label: string; desc: string; shortcut?: string } | null>(null);

  // Custom Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>('https://');
  const [linkText, setLinkText] = useState<string>('');
  const [linkNewTab, setLinkNewTab] = useState<boolean>(true);

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Sync editor content with initial or template change
  useEffect(() => {
    if (editorRef.current && activeTab === 'editor') {
      editorRef.current.innerHTML = htmlContent;
    }
  }, [activeTab]);

  const handleTemplateChange = (key: string) => {
    setTemplateKey(key);
    const newHtml = STARTER_TEMPLATES[key]?.html || '';
    setHtmlContent(newHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = newHtml;
    }
    setTimeout(updateActiveFormats, 50);
  };

  // Inspect selection to highlight active options
  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    let node: Node | null = sel.anchorNode;
    let isInside = false;
    while (node) {
      if (node === editorRef.current) {
        isInside = true;
        break;
      }
      node = node.parentNode;
    }
    if (!isInside) return;

    let bold = false;
    let italic = false;
    let underline = false;
    let strikeThrough = false;
    let unorderedList = false;
    let orderedList = false;
    let alignLeft = false;
    let alignCenter = false;
    let alignRight = false;

    try {
      bold = document.queryCommandState('bold');
      italic = document.queryCommandState('italic');
      underline = document.queryCommandState('underline');
      strikeThrough = document.queryCommandState('strikeThrough');
      unorderedList = document.queryCommandState('insertUnorderedList');
      orderedList = document.queryCommandState('insertOrderedList');
      alignLeft = document.queryCommandState('justifyLeft');
      alignCenter = document.queryCommandState('justifyCenter');
      alignRight = document.queryCommandState('justifyRight');
    } catch {
      // Ignored for non-standard environments
    }

    // Inspect parent nodes for block elements
    let inH1 = false;
    let inH2 = false;
    let inH3 = false;
    let inQuote = false;
    let inCode = false;
    let inLink = false;

    let curr: HTMLElement | null =
      sel.anchorNode instanceof HTMLElement ? sel.anchorNode : sel.anchorNode?.parentElement || null;

    while (curr && curr !== editorRef.current) {
      const tag = curr.tagName?.toLowerCase();
      if (tag === 'h1') inH1 = true;
      if (tag === 'h2') inH2 = true;
      if (tag === 'h3') inH3 = true;
      if (tag === 'blockquote') inQuote = true;
      if (tag === 'code' || tag === 'pre') inCode = true;
      if (tag === 'a') inLink = true;
      curr = curr.parentElement;
    }

    setActiveFormats({
      bold,
      italic,
      underline,
      strikeThrough,
      h1: inH1,
      h2: inH2,
      h3: inH3,
      unorderedList,
      orderedList,
      blockquote: inQuote,
      alignLeft,
      alignCenter,
      alignRight,
      code: inCode,
      link: inLink,
    });
  }, []);

  // Listen to selection changes to dynamically highlight options
  useEffect(() => {
    const handleSelectionChange = () => {
      updateActiveFormats();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateActiveFormats]);

  // Execute formatting command without stealing focus from contentEditable
  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    setTimeout(updateActiveFormats, 20);
  };

  // Toggle block formats (H1, H2, H3, blockquote)
  const toggleBlock = (tag: 'h1' | 'h2' | 'h3' | 'blockquote') => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const isCurrentlyActive = activeFormats[tag];
    // Modern browsers require standard <tag> format
    if (isCurrentlyActive) {
      document.execCommand('formatBlock', false, '<p>');
    } else {
      document.execCommand('formatBlock', false, `<${tag}>`);
    }
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    setTimeout(updateActiveFormats, 20);
  };

  // Inline code toggle
  const toggleCode = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    if (activeFormats.code) {
      document.execCommand('removeFormat');
    } else {
      const selectedText = sel.toString();
      if (selectedText) {
        document.execCommand('insertHTML', false, `<code>${selectedText}</code>`);
      } else {
        document.execCommand('insertHTML', false, '<code>code</code>');
      }
    }
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    setTimeout(updateActiveFormats, 20);
  };

  // Clear format removes inline + block formatting
  const handleClearFormat = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand('removeFormat');
    document.execCommand('formatBlock', false, '<p>');
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    setTimeout(updateActiveFormats, 20);
  };

  const handleInput = () => {
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  // Custom Modal Link Handler - Saves range and opens modal without browser prompt
  const handleOpenLinkModal = (e: React.MouseEvent) => {
    e.preventDefault();
    const sel = window.getSelection();
    let selectedText = '';
    let existingUrl = 'https://';

    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      selectedText = sel.toString();

      // Check if cursor is on an existing link
      let curr: HTMLElement | null =
        sel.anchorNode instanceof HTMLElement ? sel.anchorNode : sel.anchorNode?.parentElement || null;
      while (curr && curr !== editorRef.current) {
        if (curr.tagName?.toLowerCase() === 'a') {
          existingUrl = curr.getAttribute('href') || 'https://';
          if (!selectedText) selectedText = curr.textContent || '';
          break;
        }
        curr = curr.parentElement;
      }
    } else {
      savedRangeRef.current = null;
    }

    setLinkText(selectedText);
    setLinkUrl(existingUrl);
    setIsLinkModalOpen(true);
    setTimeout(() => {
      linkInputRef.current?.focus();
      linkInputRef.current?.select();
    }, 50);
  };

  // Apply link from Custom Modal
  const applyLink = () => {
    if (!linkUrl.trim() || linkUrl.trim() === 'https://') {
      setIsLinkModalOpen(false);
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Restore saved DOM selection range
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }

    const cleanUrl = linkUrl.trim();
    const displayText = linkText.trim() || cleanUrl;
    const targetAttr = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';

    if (!sel || sel.isCollapsed || !sel.toString()) {
      document.execCommand(
        'insertHTML',
        false,
        `<a href="${cleanUrl}"${targetAttr}>${displayText}</a>`
      );
    } else {
      if (linkText.trim() && linkText.trim() !== sel.toString()) {
        document.execCommand(
          'insertHTML',
          false,
          `<a href="${cleanUrl}"${targetAttr}>${displayText}</a>`
        );
      } else {
        document.execCommand('createLink', false, cleanUrl);
      }
    }

    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    setIsLinkModalOpen(false);
    setTimeout(updateActiveFormats, 30);
  };

  // Unlink active link
  const removeLink = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
    document.execCommand('unlink');
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    setIsLinkModalOpen(false);
    setTimeout(updateActiveFormats, 30);
  };

  // Word and character count calculation
  const textOnly = htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textOnly ? textOnly.split(' ').filter(Boolean).length : 0;
  const charCount = textOnly.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const copyHtml = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prevent mousedown from stealing focus from contentEditable
  const createToolbarHandler = (cmd: string, val?: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    execCmd(cmd, val);
  };

  const createBlockHandler = (tag: 'h1' | 'h2' | 'h3' | 'blockquote') => (e: React.MouseEvent) => {
    e.preventDefault();
    toggleBlock(tag);
  };

  // Dynamic button style highlighting selected options
  const getBtnStyle = (isActive: boolean): React.CSSProperties => ({
    position: 'relative',
    background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
    border: '1px solid',
    borderColor: isActive ? 'var(--accent-primary)' : 'transparent',
    color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
    borderRadius: '6px',
    padding: '6px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.12s ease',
    boxShadow: isActive ? '0 0 8px rgba(59, 130, 246, 0.25)' : 'none',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Card - elevated zIndex so template dropdown floats above editor */}
      <Card variant="glass" padding="md" style={{ position: 'relative', zIndex: 50 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                }}
              >
                <Edit3 size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                WYSIWYG Rich Text & Document Editor
              </h3>
              <Badge variant="cyan">
                {wordCount} Words • {readTimeMin} min read
              </Badge>
            </div>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: 'var(--text-muted)',
              }}
            >
              Real-time active style highlighting, interactive hover tooltips, HTML5 block tags, custom hyperlink modal, and light/dark theme typography.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ width: 230 }}>
              <CustomSelect
                fullWidth
                value={templateKey}
                onChange={handleTemplateChange}
                options={Object.entries(STARTER_TEMPLATES).map(([key, item]) => ({
                  value: key,
                  label: item.label,
                }))}
              />
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              <Button
                size="sm"
                variant={activeTab === 'editor' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('editor')}
              >
                Visual Editor
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'rawHtml' ? 'primary' : 'ghost'}
                icon={<FileCode size={14} />}
                onClick={() => setActiveTab('rawHtml')}
              >
                Raw HTML
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'preview' ? 'primary' : 'ghost'}
                icon={<Eye size={14} />}
                onClick={() => setActiveTab('preview')}
              >
                Read-Only
              </Button>
            </div>

            <Button
              size="sm"
              variant="secondary"
              icon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={copyHtml}
            >
              {copied ? 'Copied HTML!' : 'Copy HTML'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Editor Box */}
      <Card
        variant="glass"
        padding="none"
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 480,
          backgroundColor: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Formatting Toolbar */}
        {activeTab === 'editor' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              padding: '8px 12px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
              {/* Inline Styles */}
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'bold', label: 'Bold', desc: 'Makes selected text bold and prominent', shortcut: 'Ctrl+B' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createToolbarHandler('bold')}
                style={getBtnStyle(activeFormats.bold)}
                aria-pressed={activeFormats.bold}
                title="Bold (Ctrl+B) — Makes text bold"
              >
                <Bold size={15} />
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'italic', label: 'Italic', desc: 'Italicizes selected text for emphasis', shortcut: 'Ctrl+I' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createToolbarHandler('italic')}
                style={getBtnStyle(activeFormats.italic)}
                aria-pressed={activeFormats.italic}
                title="Italic (Ctrl+I) — Italicizes text"
              >
                <Italic size={15} />
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'underline', label: 'Underline', desc: 'Underlines selected text', shortcut: 'Ctrl+U' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createToolbarHandler('underline')}
                style={getBtnStyle(activeFormats.underline)}
                aria-pressed={activeFormats.underline}
                title="Underline (Ctrl+U) — Underlines text"
              >
                <Underline size={15} />
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'strikethrough', label: 'Strikethrough', desc: 'Draws a horizontal line through text' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createToolbarHandler('strikeThrough')}
                style={getBtnStyle(activeFormats.strikeThrough)}
                aria-pressed={activeFormats.strikeThrough}
                title="Strikethrough — Crosses out text"
              >
                <Strikethrough size={15} />
              </button>

              <div style={separatorStyle} />

              {/* Block formats (H1, H2, H3) */}
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'h1', label: 'Heading 1', desc: 'Formats block as primary section title (<h1>)' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createBlockHandler('h1')}
                style={getBtnStyle(activeFormats.h1)}
                aria-pressed={activeFormats.h1}
                title="Heading 1 — Major section title"
              >
                <Heading1 size={15} />
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'h2', label: 'Heading 2', desc: 'Formats block as secondary sub-section (<h2>)' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createBlockHandler('h2')}
                style={getBtnStyle(activeFormats.h2)}
                aria-pressed={activeFormats.h2}
                title="Heading 2 — Sub-section title"
              >
                <Heading2 size={15} />
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'h3', label: 'Heading 3', desc: 'Formats block as small topic header (<h3>)' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createBlockHandler('h3')}
                style={getBtnStyle(activeFormats.h3)}
                aria-pressed={activeFormats.h3}
                title="Heading 3 — Topic header"
              >
                <Heading3 size={15} />
              </button>

              <div style={separatorStyle} />

              {/* Lists & Quotes */}
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'list', label: 'Bulleted List', desc: 'Inserts or toggles an unordered list (<ul>)' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createToolbarHandler('insertUnorderedList')}
                style={getBtnStyle(activeFormats.unorderedList)}
                aria-pressed={activeFormats.unorderedList}
                title="Bullet List — Unordered list"
              >
                <List size={15} />
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'listOrdered', label: 'Numbered List', desc: 'Inserts or toggles an ordered list (<ol>)' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createToolbarHandler('insertOrderedList')}
                style={getBtnStyle(activeFormats.orderedList)}
                aria-pressed={activeFormats.orderedList}
                title="Numbered List — Ordered sequence"
              >
                <ListOrdered size={15} />
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'quote', label: 'Blockquote', desc: 'Formats text as an indented block quotation (<blockquote>)' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createBlockHandler('blockquote')}
                style={getBtnStyle(activeFormats.blockquote)}
                aria-pressed={activeFormats.blockquote}
                title="Blockquote — Indented citation block"
              >
                <Quote size={15} />
              </button>

              <div style={separatorStyle} />

              {/* Alignment */}
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'alignLeft', label: 'Align Left', desc: 'Aligns text to the left margin' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createToolbarHandler('justifyLeft')}
                style={getBtnStyle(activeFormats.alignLeft)}
                aria-pressed={activeFormats.alignLeft}
                title="Align Left — Left margin alignment"
              >
                <AlignLeft size={15} />
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'alignCenter', label: 'Align Center', desc: 'Centers text between margins' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createToolbarHandler('justifyCenter')}
                style={getBtnStyle(activeFormats.alignCenter)}
                aria-pressed={activeFormats.alignCenter}
                title="Align Center — Centered alignment"
              >
                <AlignCenter size={15} />
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'alignRight', label: 'Align Right', desc: 'Aligns text to the right margin' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createToolbarHandler('justifyRight')}
                style={getBtnStyle(activeFormats.alignRight)}
                aria-pressed={activeFormats.alignRight}
                title="Align Right — Right margin alignment"
              >
                <AlignRight size={15} />
              </button>

              <div style={separatorStyle} />

              {/* Code, Link, Divider & Clear */}
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'code', label: 'Inline Code', desc: 'Wraps selection in a monospace code tag (<code>)' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  toggleCode();
                }}
                style={getBtnStyle(activeFormats.code)}
                aria-pressed={activeFormats.code}
                title="Inline Code — Monospace text"
              >
                <Code size={15} />
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'link', label: 'Insert Link', desc: 'Opens custom dialog to insert or edit hyperlink without browser alert' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={handleOpenLinkModal}
                style={getBtnStyle(activeFormats.link)}
                aria-pressed={activeFormats.link}
                title="Insert Link — Custom hyperlink dialog"
              >
                <Link2 size={15} />
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'rule', label: 'Horizontal Divider', desc: 'Inserts a clean thematic divider line (<hr>)' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createToolbarHandler('insertHorizontalRule')}
                style={getBtnStyle(false)}
                title="Horizontal Rule — Dividing line"
              >
                <Minus size={15} />
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'clear', label: 'Clear Formatting', desc: 'Strips all inline styles and resets block to paragraph' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleClearFormat();
                }}
                style={getBtnStyle(false)}
                title="Clear Formatting — Reset styles"
              >
                <Eraser size={15} />
              </button>

              <div style={separatorStyle} />

              {/* Undo / Redo */}
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'undo', label: 'Undo', desc: 'Reverts previous typing or formatting change', shortcut: 'Ctrl+Z' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createToolbarHandler('undo')}
                style={getBtnStyle(false)}
                title="Undo (Ctrl+Z) — Revert previous action"
              >
                <Undo size={15} />
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredTool({ id: 'redo', label: 'Redo', desc: 'Restores previously undone action', shortcut: 'Ctrl+Y' })
                }
                onMouseLeave={() => setHoveredTool(null)}
                onMouseDown={createToolbarHandler('redo')}
                style={getBtnStyle(false)}
                title="Redo (Ctrl+Y) — Restore reverted action"
              >
                <Redo size={15} />
              </button>
            </div>

            {/* Live Hover Explainer Ribbon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
                color: hoveredTool ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              <HelpCircle size={13} style={{ color: hoveredTool ? 'var(--accent-primary)' : 'var(--text-muted)', flexShrink: 0 }} />
              {hoveredTool ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <strong style={{ color: 'var(--accent-primary)' }}>{hoveredTool.label}:</strong>
                  <span>{hoveredTool.desc}</span>
                  {hoveredTool.shortcut && (
                    <kbd
                      style={{
                        fontSize: '10px',
                        padding: '1px 5px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '3px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {hoveredTool.shortcut}
                    </kbd>
                  )}
                </div>
              ) : (
                <span>Hover any tool to inspect its function • Highlights indicate active styles</span>
              )}
            </div>
          </div>
        )}

        {/* View Mode Canvas */}
        <div style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
          {/* Custom style block ensuring proper rendering for rich elements */}
          <style>{`
            .rich-editor-content h1 {
              font-size: 26px;
              font-weight: 700;
              margin: 16px 0 10px;
              color: var(--text-primary);
              line-height: 1.3;
            }
            .rich-editor-content h2 {
              font-size: 21px;
              font-weight: 600;
              margin: 14px 0 8px;
              color: var(--text-primary);
              line-height: 1.35;
            }
            .rich-editor-content h3 {
              font-size: 17px;
              font-weight: 600;
              margin: 12px 0 6px;
              color: var(--text-primary);
              line-height: 1.4;
            }
            .rich-editor-content p {
              margin: 8px 0;
              color: var(--text-primary);
              line-height: 1.7;
            }
            .rich-editor-content blockquote {
              border-left: 3px solid var(--accent-primary);
              padding: 8px 16px;
              margin: 14px 0;
              color: var(--text-secondary);
              background-color: rgba(59, 130, 246, 0.06);
              border-radius: 0 6px 6px 0;
              font-style: italic;
            }
            .rich-editor-content code {
              font-family: monospace;
              background-color: var(--bg-surface-elevated);
              padding: 2px 6px;
              border-radius: 4px;
              border: 1px solid var(--border-subtle);
              color: var(--accent-primary);
              font-size: 13px;
            }
            .rich-editor-content ul, .rich-editor-content ol {
              padding-left: 26px;
              margin: 10px 0;
              color: var(--text-primary);
            }
            .rich-editor-content li {
              margin-bottom: 4px;
              line-height: 1.6;
            }
            .rich-editor-content a {
              color: var(--accent-primary);
              text-decoration: underline;
              text-underline-offset: 3px;
            }
            .rich-editor-content hr {
              border: none;
              border-top: 1px solid var(--border-default);
              margin: 20px 0;
            }
          `}</style>

          {activeTab === 'editor' && (
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onKeyUp={updateActiveFormats}
              onMouseUp={updateActiveFormats}
              style={{
                outline: 'none',
                padding: 'clamp(14px, 3vw, 28px) clamp(12px, 3.5vw, 36px)',
                minHeight: 380,
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-surface)',
                fontSize: '15px',
                lineHeight: '1.75',
              }}
              className="rich-editor-content"
            />
          )}

          {activeTab === 'rawHtml' && (
            <pre
              style={{
                margin: 0,
                padding: 'clamp(12px, 3vw, 24px) clamp(12px, 3vw, 32px)',
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-code)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {htmlContent}
            </pre>
          )}

          {activeTab === 'preview' && (
            <div
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              style={{
                padding: 'clamp(14px, 3vw, 28px) clamp(12px, 3.5vw, 36px)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-surface)',
                fontSize: '15px',
                lineHeight: '1.75',
              }}
              className="rich-editor-content"
            />
          )}
        </div>

        {/* Bottom Status Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            padding: '10px 18px',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', gap: '4px 12px', flexWrap: 'wrap' }}>
            <span><strong>{wordCount}</strong> words</span>
            <span><strong>{charCount}</strong> characters</span>
            <span>Estimated reading time: <strong>~{readTimeMin} min</strong></span>
          </div>
          <div>
            <span>W3C Standard • UTF-8 Rich Text</span>
          </div>
        </div>
      </Card>

      {/* Custom Hyperlink Modal Dialog - Replaces browser alert/prompt */}
      {isLinkModalOpen && (
        <div
          onClick={() => setIsLinkModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: '12px',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <Link2 size={16} />
                </div>
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {activeFormats.link ? 'Edit Hyperlink' : 'Insert Hyperlink'}
                </span>
              </div>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                  display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Destination URL
                </label>
                <input
                  ref={linkInputRef}
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyLink();
                    if (e.key === 'Escape') setIsLinkModalOpen(false);
                  }}
                  placeholder="https://example.com"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Display Text (Optional)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyLink();
                    if (e.key === 'Escape') setIsLinkModalOpen(false);
                  }}
                  placeholder="e.g. Read Documentation"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                  style={{ accentColor: 'var(--accent-primary)', width: 14, height: 14 }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Open link in a new tab (target="_blank")
                </span>
              </label>
            </div>

            {/* Modal Actions Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                backgroundColor: 'var(--bg-surface)',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                {activeFormats.link && (
                  <Button size="sm" variant="danger" onClick={removeLink}>
                    Unlink
                  </Button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" variant="ghost" onClick={() => setIsLinkModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={applyLink}>
                  {activeFormats.link ? 'Update Link' : 'Insert Link'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concept Architecture Footer */}
      <Card variant="glass" padding="md">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Active Option Highlighting
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Queries <code>document.queryCommandState</code> and ancestor nodes on selection changes to highlight active styling buttons with blue tint and accent border.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Interactive Hover Explainer Ribbon
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Hovering any formatting button immediately describes what the tool does, explains its markup tag, and displays standard keyboard shortcuts.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Custom Hyperlink Dialog
              </h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Replaces native browser prompt popups with an accessible, in-theme modal supporting custom display text, target attributes, and unlink actions.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const separatorStyle: React.CSSProperties = {
  width: '1px',
  height: '18px',
  backgroundColor: 'var(--border-default)',
  margin: '0 4px',
};
