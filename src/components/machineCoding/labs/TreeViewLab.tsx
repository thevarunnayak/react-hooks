import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { SearchInput } from '../../ui/SearchInput';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  Eye,
  FilePlus,
  FolderPlus,
  CheckCircle2,
} from 'lucide-react';

export interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  size?: string;
  updatedAt?: string;
  content?: string;
}

const INITIAL_TREE_DATA: TreeNode[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: 'src-components',
        name: 'components',
        type: 'folder',
        children: [
          {
            id: 'src-components-Button.tsx',
            name: 'Button.tsx',
            type: 'file',
            size: '2.4 KB',
            updatedAt: '10 mins ago',
            content: `import React from 'react';\n\nexport interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  variant?: 'primary' | 'secondary' | 'glass';\n  size?: 'sm' | 'md' | 'lg';\n}\n\nexport const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {\n  return <button className={\`btn btn-\${variant}\`} {...props}>{children}</button>;\n};`,
          },
          {
            id: 'src-components-Modal.tsx',
            name: 'Modal.tsx',
            type: 'file',
            size: '4.1 KB',
            updatedAt: '2 hours ago',
            content: `import React, { useEffect } from 'react';\nimport { createPortal } from 'react-dom';\n\nexport const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({\n  isOpen,\n  onClose,\n  children,\n}) => {\n  if (!isOpen) return null;\n  return createPortal(\n    <div className="modal-backdrop" onClick={onClose}>\n      <div className="modal-content" onClick={(e) => e.stopPropagation()}>\n        {children}\n      </div>\n    </div>,\n    document.body\n  );\n};`,
          },
          {
            id: 'src-components-Card.tsx',
            name: 'Card.tsx',
            type: 'file',
            size: '1.8 KB',
            updatedAt: 'Yesterday',
            content: `import React from 'react';\n\nexport const Card: React.FC<{ children: React.ReactNode; variant?: 'glass' | 'solid' }> = ({\n  children,\n  variant = 'glass',\n}) => {\n  return <div className={\`card card-\${variant}\`}>{children}</div>;\n};`,
          },
        ],
      },
      {
        id: 'src-hooks',
        name: 'hooks',
        type: 'folder',
        children: [
          {
            id: 'src-hooks-useDebounce.ts',
            name: 'useDebounce.ts',
            type: 'file',
            size: '1.2 KB',
            updatedAt: '3 days ago',
            content: `import { useState, useEffect } from 'react';\n\nexport function useDebounce<T>(value: T, delay: number): T {\n  const [debounced, setDebounced] = useState<T>(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}`,
          },
          {
            id: 'src-hooks-useLocalStorage.ts',
            name: 'useLocalStorage.ts',
            type: 'file',
            size: '1.9 KB',
            updatedAt: '5 days ago',
            content: `import { useState, useEffect } from 'react';\n\nexport function useLocalStorage<T>(key: string, initialValue: T) {\n  const [val, setVal] = useState<T>(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch {\n      return initialValue;\n    }\n  });\n  return [val, setVal] as const;\n}`,
          },
        ],
      },
      {
        id: 'src-styles',
        name: 'styles',
        type: 'folder',
        children: [
          {
            id: 'src-styles-theme.css',
            name: 'theme.css',
            type: 'file',
            size: '3.6 KB',
            updatedAt: '1 week ago',
            content: `:root {\n  --primary: #3b82f6;\n  --primary-glow: rgba(59, 130, 246, 0.4);\n  --surface-glass: rgba(18, 24, 38, 0.7);\n  --border-subtle: rgba(255, 255, 255, 0.08);\n}`,
          },
        ],
      },
      {
        id: 'src-App.tsx',
        name: 'App.tsx',
        type: 'file',
        size: '3.2 KB',
        updatedAt: 'Today',
        content: `import React from 'react';\nimport { Button } from './components/Button';\n\nexport default function App() {\n  return (\n    <main className="app-container">\n      <h1>Interactive File Explorer</h1>\n      <Button>Explore Files</Button>\n    </main>\n  );\n}`,
      },
    ],
  },
  {
    id: 'public',
    name: 'public',
    type: 'folder',
    children: [
      {
        id: 'public-logo.svg',
        name: 'logo.svg',
        type: 'file',
        size: '5.4 KB',
        updatedAt: '2 weeks ago',
        content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" fill="#3b82f6" />\n</svg>`,
      },
    ],
  },
  {
    id: 'package.json',
    name: 'package.json',
    type: 'file',
    size: '1.1 KB',
    updatedAt: 'Just now',
    content: `{\n  "name": "react-file-explorer",\n  "version": "1.0.0",\n  "private": true,\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0",\n    "lucide-react": "^0.344.0"\n  }\n}`,
  },
  {
    id: 'README.md',
    name: 'README.md',
    type: 'file',
    size: '2.8 KB',
    updatedAt: 'Yesterday',
    content: `# Recursive Tree View / File Explorer\n\nHigh-performance recursive file system browser with full CRUD, search highlighting, keyboard navigation, and inline renaming.`,
  },
];

export const TreeViewLab: React.FC = () => {
  const [tree, setTree] = useState<TreeNode[]>(INITIAL_TREE_DATA);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'src-components']));
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(
    INITIAL_TREE_DATA[0].children?.[0].children?.[0] || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [addingToFolderId, setAddingToFolderId] = useState<string | null>(null);
  const [isAddingRoot, setIsAddingRoot] = useState<boolean>(false);
  const [newNodeType, setNewNodeType] = useState<'file' | 'folder'>('file');
  const [newNodeName, setNewNodeName] = useState('');

  // Responsive state
  const [isCompact, setIsCompact] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 800 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 800);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Collect all folder IDs
  const allFolderIds = useMemo(() => {
    const ids: string[] = [];
    const traverse = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.type === 'folder') {
          ids.push(node.id);
          if (node.children) traverse(node.children);
        }
      }
    };
    traverse(tree);
    return ids;
  }, [tree]);

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedFolders(new Set(allFolderIds));
  const collapseAll = () => setExpandedFolders(new Set());

  // Search filter and auto-expansion
  const matchingNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const matches = new Set<string>();
    const query = searchQuery.toLowerCase();

    const traverse = (nodes: TreeNode[], parentPath: string[] = []) => {
      for (const node of nodes) {
        const isMatch = node.name.toLowerCase().includes(query);
        if (isMatch) {
          matches.add(node.id);
          // auto-expand all parents
          parentPath.forEach((id) => matches.add(id));
        }
        if (node.children) {
          traverse(node.children, [...parentPath, node.id]);
        }
      }
    };
    traverse(tree);
    return matches;
  }, [tree, searchQuery]);

  // Handle Search Input Change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Auto expand matching parents
      const autoExpanded = new Set(expandedFolders);
      const q = query.toLowerCase();
      const findAndExpand = (nodes: TreeNode[], parents: string[]) => {
        for (const node of nodes) {
          if (node.name.toLowerCase().includes(q)) {
            parents.forEach((pid) => autoExpanded.add(pid));
          }
          if (node.children) {
            findAndExpand(node.children, [...parents, node.id]);
          }
        }
      };
      findAndExpand(tree, []);
      setExpandedFolders(autoExpanded);
    }
  };

  // Node Renaming
  const startRename = (node: TreeNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(node.id);
    setEditName(node.name);
  };

  const submitRename = () => {
    if (!editingId || !editName.trim()) {
      setEditingId(null);
      return;
    }

    const renameNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === editingId) {
          const updated = { ...node, name: editName.trim() };
          if (selectedNode?.id === editingId) {
            setSelectedNode(updated);
          }
          return updated;
        }
        if (node.children) {
          return { ...node, children: renameNode(node.children) };
        }
        return node;
      });
    };

    setTree(renameNode(tree));
    setEditingId(null);
  };

  // Node Deletion
  const deleteNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remove = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .filter((node) => node.id !== nodeId)
        .map((node) => ({
          ...node,
          children: node.children ? remove(node.children) : undefined,
        }));
    };

    setTree(remove(tree));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  // Add new File or Folder
  const handleCreateNode = (targetFolderId: string | null) => {
    if (!newNodeName.trim()) {
      setAddingToFolderId(null);
      return;
    }

    const newNode: TreeNode = {
      id: `${targetFolderId ? targetFolderId + '-' : ''}${newNodeName.trim()}-${Date.now()}`,
      name: newNodeName.trim(),
      type: newNodeType,
      size: newNodeType === 'file' ? '0.8 KB' : undefined,
      updatedAt: 'Just now',
      content: newNodeType === 'file' ? `// ${newNodeName.trim()}\n// Created dynamically` : undefined,
      children: newNodeType === 'folder' ? [] : undefined,
    };

    if (targetFolderId === null) {
      // Add to root
      setTree((prev) => [...prev, newNode]);
    } else {
      const addDeep = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.id === targetFolderId && node.type === 'folder') {
            return {
              ...node,
              children: [...(node.children || []), newNode],
            };
          }
          if (node.children) {
            return { ...node, children: addDeep(node.children) };
          }
          return node;
        });
      };
      setTree(addDeep(tree));
      // Ensure target folder is open
      setExpandedFolders((prev) => new Set([...prev, targetFolderId]));
    }

    setAddingToFolderId(null);
    setNewNodeName('');
    if (newNode.type === 'file') {
      setSelectedNode(newNode);
    }
  };

  // Icon Helper
  const getNodeIcon = (node: TreeNode) => {
    if (node.type === 'folder') {
      const isOpen = expandedFolders.has(node.id);
      return isOpen ? (
        <FolderOpen size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
      ) : (
        <Folder size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
      );
    }

    const ext = node.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
        return <FileCode size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />;
      case 'css':
      case 'scss':
        return <FileText size={16} style={{ color: '#f472b6', flexShrink: 0 }} />;
      case 'json':
        return <FileJson size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />;
      case 'md':
        return <FileText size={16} style={{ color: '#34d399', flexShrink: 0 }} />;
      case 'svg':
      case 'png':
      case 'ico':
        return <ImageIcon size={16} style={{ color: '#a78bfa', flexShrink: 0 }} />;
      default:
        return <FileText size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />;
    }
  };

  // Render recursive tree item
  const renderNode = (node: TreeNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const isEditing = editingId === node.id;
    const isMatched = searchQuery && matchingNodeIds.has(node.id);

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.id);
            } else {
              setSelectedNode(node);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 10px',
            paddingLeft: `${depth * 18 + 10}px`,
            borderRadius: '6px',
            cursor: 'pointer',
            gap: '8px',
            transition: 'background 0.15s ease',
            backgroundColor: isSelected
              ? 'rgba(59, 130, 246, 0.18)'
              : isMatched && searchQuery
              ? 'rgba(234, 179, 8, 0.12)'
              : 'transparent',
            border: isSelected ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid transparent',
            userSelect: 'none',
          }}
          className="tree-node-row"
        >
          {/* Chevron for folder */}
          {node.type === 'folder' ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.id);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                color: 'var(--text-muted)',
                transition: 'transform 0.15s ease',
              }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          ) : (
            <span style={{ width: 16 }} />
          )}

          {/* Node Icon */}
          {getNodeIcon(node)}

          {/* Label or Inline Edit */}
          {isEditing ? (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitRename();
                  if (e.key === 'Escape') setEditingId(null);
                }}
                style={{
                  background: 'var(--bg-surface-elevated, #ffffff)',
                  border: '1px solid var(--accent-primary, #3b82f6)',
                  color: 'var(--text-primary, #0f172a)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '13px',
                  outline: 'none',
                  flex: 1,
                }}
              />
              <button
                onClick={submitRename}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-success, #10b981)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                }}
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setEditingId(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <span
              style={{
                fontSize: '13px',
                fontWeight: node.type === 'folder' ? 600 : 400,
                color: isSelected
                  ? 'var(--accent-primary, #2563eb)'
                  : isMatched && searchQuery
                  ? '#eab308'
                  : 'var(--text-primary, #0f172a)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {node.name}
            </span>
          )}

          {/* Hover Actions */}
          {!isEditing && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                opacity: 0.8,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {node.type === 'folder' && (
                <>
                  <button
                    title="Add File"
                    onClick={() => {
                      setAddingToFolderId(node.id);
                      setNewNodeType('file');
                      setNewNodeName('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                    }}
                  >
                    <FilePlus size={13} />
                  </button>
                  <button
                    title="Add Folder"
                    onClick={() => {
                      setAddingToFolderId(node.id);
                      setNewNodeType('folder');
                      setNewNodeName('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                    }}
                  >
                    <FolderPlus size={13} />
                  </button>
                </>
              )}
              <button
                title="Rename"
                onClick={(e) => startRename(node, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                }}
              >
                <Edit2 size={13} />
              </button>
              <button
                title="Delete"
                onClick={(e) => deleteNode(node.id, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Inline Add Input in Folder */}
        {addingToFolderId === node.id && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 8px',
              paddingLeft: `${(depth + 1) * 18 + 10}px`,
              background: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            {newNodeType === 'folder' ? (
              <Folder size={14} style={{ color: '#f59e0b' }} />
            ) : (
              <FileCode size={14} style={{ color: '#38bdf8' }} />
            )}
            <input
              type="text"
              autoFocus
              placeholder={`New ${newNodeType} name...`}
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNode(node.id);
                if (e.key === 'Escape') setAddingToFolderId(null);
              }}
              style={{
                background: 'var(--bg-surface-elevated, #ffffff)',
                border: '1px solid var(--accent-primary, #3b82f6)',
                color: 'var(--text-primary, #0f172a)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '12px',
                outline: 'none',
                flex: 1,
              }}
            />
            <button
              onClick={() => handleCreateNode(node.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-success, #10b981)',
                cursor: 'pointer',
                display: 'flex',
                padding: 2,
              }}
            >
              <Check size={13} />
            </button>
            <button
              onClick={() => setAddingToFolderId(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted, #94a3b8)',
                cursor: 'pointer',
                display: 'flex',
                padding: 2,
              }}
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Render Children when expanded */}
        {node.type === 'folder' && isExpanded && node.children && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Overview Card */}
      <Card variant="glass" padding="md">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              Recursive Tree View & File Explorer
            </h3>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: 'var(--text-muted)',
              }}
            >
              Recursive folder hierarchy with instant CRUD, search highlighting, keyboard shortcuts, and code inspection.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button size="sm" variant="ghost" onClick={expandAll}>
              Expand All
            </Button>
            <Button size="sm" variant="ghost" onClick={collapseAll}>
              Collapse All
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<RefreshCw size={14} />}
              onClick={() => {
                setTree(INITIAL_TREE_DATA);
                setExpandedFolders(new Set(['src', 'src-components']));
                setSelectedNode(INITIAL_TREE_DATA[0].children?.[0].children?.[0] || null);
              }}
            >
              Reset Demo
            </Button>
          </div>
        </div>
      </Card>

      {/* Explorer Main Layout (2 Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isCompact ? '1fr' : 'minmax(280px, 340px) 1fr',
          gap: 18,
          alignItems: 'start',
        }}
      >
        {/* Left Column: File Tree Sidebar */}
        <Card
          variant="glass"
          padding="sm"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            minHeight: 520,
            overflow: 'hidden',
          }}
        >
          {/* Top Search & Add to Root */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 6px' }}>
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Filter files & folders..."
            />
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <Button
                size="sm"
                variant="ghost"
                icon={<FilePlus size={14} />}
                onClick={() => {
                  setAddingToFolderId(null);
                  setIsAddingRoot(true);
                  setNewNodeType('file');
                  setNewNodeName('');
                }}
              >
                + File
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={<FolderPlus size={14} />}
                onClick={() => {
                  setAddingToFolderId(null);
                  setIsAddingRoot(true);
                  setNewNodeType('folder');
                  setNewNodeName('');
                }}
              >
                + Folder
              </Button>
            </div>
          </div>

          {/* Root Add Row if open */}
          {isAddingRoot && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                background: 'var(--accent-primary-subtle, rgba(59, 130, 246, 0.08))',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                marginBottom: 8,
              }}
            >
              {newNodeType === 'folder' ? (
                <Folder size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
              ) : (
                <FileCode size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />
              )}
              <input
                type="text"
                autoFocus
                placeholder={`New root ${newNodeType} name...`}
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateNode(null);
                    setIsAddingRoot(false);
                  }
                  if (e.key === 'Escape') {
                    setIsAddingRoot(false);
                    setNewNodeName('');
                  }
                }}
                style={{
                  background: 'var(--bg-surface-elevated, #ffffff)',
                  border: '1px solid var(--accent-primary, #3b82f6)',
                  color: 'var(--text-primary, #0f172a)',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '12px',
                  outline: 'none',
                  flex: 1,
                }}
              />
              <button
                onClick={() => {
                  handleCreateNode(null);
                  setIsAddingRoot(false);
                }}
                title="Confirm"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-success, #10b981)',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: 2,
                }}
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => {
                  setIsAddingRoot(false);
                  setNewNodeName('');
                }}
                title="Cancel"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: 2,
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Tree Structure */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              overflowY: 'auto',
              maxHeight: 460,
              paddingRight: 4,
            }}
          >
            {tree.map((node) => renderNode(node, 0))}
          </div>
        </Card>

        {/* Right Column: Code & File Metadata Viewer */}
        <Card
          variant="glass"
          padding="md"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minHeight: 520,
          }}
        >
          {selectedNode ? (
            <>
              {/* File Info Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 12,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {getNodeIcon(selectedNode)}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
                      {selectedNode.name}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {selectedNode.type === 'folder'
                        ? `Folder (${selectedNode.children?.length || 0} items)`
                        : `File • ${selectedNode.size || '1 KB'} • Modified ${selectedNode.updatedAt || 'Recently'}`}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge variant="cyan">
                    {selectedNode.type.toUpperCase()}
                  </Badge>
                  {selectedNode.type === 'file' && (
                    <Badge variant="success">READY</Badge>
                  )}
                </div>
              </div>

              {/* File Content / Code Preview */}
              {selectedNode.type === 'file' ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-code, #f8fafc)',
                    border: '1px solid var(--border-default)',
                    overflow: 'hidden',
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-surface-hover, #f1f5f9)',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    <span>Editor Preview</span>
                    <span>UTF-8 • LF</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      padding: '12px 0',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      overflowX: 'auto',
                      maxHeight: 380,
                    }}
                  >
                    {/* Line numbers */}
                    <div
                      style={{
                        padding: '0 12px',
                        color: 'var(--text-faint, #94a3b8)',
                        textAlign: 'right',
                        userSelect: 'none',
                        borderRight: '1px solid var(--border-subtle)',
                      }}
                    >
                      {(selectedNode.content || '// Empty file')
                        .split('\n')
                        .map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                    </div>

                    {/* Actual code content */}
                    <pre
                      style={{
                        margin: 0,
                        padding: '0 16px',
                        color: 'var(--text-primary, #0f172a)',
                        overflowX: 'auto',
                        whiteSpace: 'pre',
                        fontFamily: 'inherit',
                      }}
                    >
                      {selectedNode.content || '// Empty file'}
                    </pre>
                  </div>
                </div>
              ) : (
                /* Folder Content Summary */
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: 16,
                    backgroundColor: 'var(--bg-surface-elevated, #f8fafc)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    Folder contents ({selectedNode.children?.length || 0} direct items):
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                    {selectedNode.children && selectedNode.children.length > 0 ? (
                      selectedNode.children.map((child) => (
                        <div
                          key={child.id}
                          onClick={() => setSelectedNode(child)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 12px',
                            backgroundColor: 'var(--bg-surface, #ffffff)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {getNodeIcon(child)}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {child.name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Folder is empty</span>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                color: 'var(--text-muted)',
                gap: 8,
              }}
            >
              <Eye size={32} style={{ opacity: 0.5 }} />
              <span>Select any file from the explorer to preview its contents</span>
            </div>
          )}
        </Card>
      </div>

      {/* Concept Architecture Footer */}
      <Card variant="glass" padding="md">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--primary-color, #3b82f6)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Recursive Tree Rendering</h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Components call themselves recursively with depth-based indentation, maintaining infinite folder nesting capability without hardcoded bounds.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--primary-color, #3b82f6)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Set-Based Expansion State</h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Folder open/closed states are stored in a reactive Set&lt;string&gt; for O(1) membership lookups and fast bulk expand/collapse actions.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--primary-color, #3b82f6)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Deep Ancestor Auto-Expansion</h5>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                When filtering files, search traversal recursively traces ancestor paths and automatically expands closed parent folders so matches are visible.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
