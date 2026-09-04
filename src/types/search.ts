import React from 'react';

export type SearchDocCategory =
  | 'all'
  | 'hook'
  | 'custom_hook'
  | 'architecture'
  | 'challenge'
  | 'interview'
  | 'page';

export interface SearchDocument {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchDocCategory;
  categoryLabel: string;
  route: string;
  param?: string;
  tags: string[];
  keywords: string[];
  content: string; // Full searchable textual body (mental models, problem/solution, pitfalls, etc.)
  difficulty?: string;
  badge?: string;
  iconType: 'hook' | 'custom_hook' | 'architecture' | 'challenge' | 'interview' | 'page';
}

export interface SearchResultItem {
  doc: SearchDocument;
  score: number;
  matchedField: 'title' | 'tag' | 'keyword' | 'content';
  matchedSnippet: string;
  matchedTerms: string[];
}
