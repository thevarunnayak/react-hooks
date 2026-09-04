import { SearchDocument, SearchResultItem } from '../../types/search';

/**
 * Computes Levenshtein edit distance between two strings with O(min(n, m)) memory.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const lenA = a.length;
  const lenB = b.length;

  let prevRow = new Array(lenB + 1);
  let currRow = new Array(lenB + 1);

  for (let j = 0; j <= lenB; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    currRow[0] = i;
    const charA = a[i - 1];

    for (let j = 1; j <= lenB; j++) {
      const charB = b[j - 1];
      const cost = charA === charB ? 0 : 1;

      currRow[j] = Math.min(
        currRow[j - 1] + 1, // Insertion
        prevRow[j] + 1, // Deletion
        prevRow[j - 1] + cost // Substitution
      );
    }

    // Swap rows
    for (let j = 0; j <= lenB; j++) {
      prevRow[j] = currRow[j];
    }
  }

  return currRow[lenB];
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
  'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'how', 'what', 'why', 'when', 'where', 'who', 'which',
  'can', 'could', 'should', 'would', 'will', 'and', 'or', 'but', 'if', 'then',
]);

/**
 * Tokenizes and normalizes a query into meaningful keywords.
 */
export function tokenizeQuery(raw: string): string[] {
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9\s-_]/g, ' ');
  const tokens = cleaned.split(/\s+/).filter(Boolean);

  // If query consists only of stop words (e.g. "what is"), don't filter them all out
  const filtered = tokens.filter((t) => !STOP_WORDS.has(t));
  return filtered.length > 0 ? filtered : tokens;
}

/**
 * Extracts a contextual snippet around matched terms from content.
 */
function extractSnippet(content: string, matchedTerms: string[], maxLen = 140): string {
  if (!content) return '';
  const lowerContent = content.toLowerCase();

  let bestIndex = -1;
  for (const term of matchedTerms) {
    const idx = lowerContent.indexOf(term.toLowerCase());
    if (idx !== -1 && (bestIndex === -1 || idx < bestIndex)) {
      bestIndex = idx;
    }
  }

  if (bestIndex === -1) {
    return content.length > maxLen ? content.slice(0, maxLen) + '...' : content;
  }

  const start = Math.max(0, bestIndex - 40);
  const end = Math.min(content.length, bestIndex + maxLen - 40);

  let snippet = content.slice(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Searches and ranks indexed documents based on exact, natural language, and fuzzy/Levenshtein matching.
 */
export function searchCorpus(
  corpus: SearchDocument[],
  rawQuery: string,
  categoryFilter: string = 'all',
  limit = 20
): SearchResultItem[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    const pool = categoryFilter === 'all'
      ? corpus
      : corpus.filter((d) => d.category === categoryFilter);

    // Return default recommended items
    return pool.slice(0, limit).map((doc) => ({
      doc,
      score: 1,
      matchedField: 'title',
      matchedSnippet: doc.subtitle || doc.content.slice(0, 100),
      matchedTerms: [],
    }));
  }

  const queryLower = trimmed.toLowerCase();
  const queryTokens = tokenizeQuery(trimmed);
  const results: SearchResultItem[] = [];

  for (const doc of corpus) {
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) {
      continue;
    }

    const titleLower = doc.title.toLowerCase();
    const subtitleLower = (doc.subtitle || '').toLowerCase();
    const contentLower = doc.content.toLowerCase();

    let score = 0;
    let matchedField: SearchResultItem['matchedField'] = 'content';
    const matchedTermsSet = new Set<string>();
    let tokensMatched = 0;

    // 1. Direct Full Query Matches (Top Priority)
    if (titleLower === queryLower) {
      score += 200;
      matchedField = 'title';
      matchedTermsSet.add(queryLower);
    } else if (titleLower.startsWith(queryLower)) {
      score += 120;
      matchedField = 'title';
      matchedTermsSet.add(queryLower);
    } else if (titleLower.includes(queryLower)) {
      score += 90;
      matchedField = 'title';
      matchedTermsSet.add(queryLower);
    }

    // 2. Token-by-Token Match & Fuzzy Levenshtein Comparison
    for (const token of queryTokens) {
      let tokenMatched = false;

      // Exact token in title
      if (titleLower.includes(token)) {
        score += 50;
        tokenMatched = true;
        matchedField = 'title';
        matchedTermsSet.add(token);
      }

      // Exact token in tags
      const tagMatch = doc.tags.some((t) => t.toLowerCase().includes(token));
      if (tagMatch) {
        score += 35;
        tokenMatched = true;
        if (matchedField !== 'title') matchedField = 'tag';
        matchedTermsSet.add(token);
      }

      // Exact token in keywords
      const kwMatch = doc.keywords.some((k) => k.toLowerCase().includes(token));
      if (kwMatch) {
        score += 25;
        tokenMatched = true;
        if (matchedField !== 'title' && matchedField !== 'tag') matchedField = 'keyword';
        matchedTermsSet.add(token);
      }

      // Exact token in subtitle / tagline
      if (subtitleLower.includes(token)) {
        score += 20;
        tokenMatched = true;
        matchedTermsSet.add(token);
      }

      // Exact token in full content
      if (contentLower.includes(token)) {
        score += 15;
        tokenMatched = true;
        matchedTermsSet.add(token);
      }

      // 3. Typo-Tolerant Fuzzy Logic (Levenshtein Distance)
      if (!tokenMatched && token.length >= 3) {
        // Extract title words, including variants without "use" prefix (e.g. "useReducer" -> "reducer")
        const titleTokens = titleLower.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
        const titleVariants: string[] = [];
        for (const w of titleTokens) {
          titleVariants.push(w);
          if (w.startsWith('use') && w.length > 4) {
            titleVariants.push(w.slice(3));
          }
        }

        const tagTokens = doc.tags.flatMap((t) => {
          const lower = t.toLowerCase();
          const list = [lower];
          if (lower.startsWith('use') && lower.length > 4) {
            list.push(lower.slice(3));
          }
          return list;
        });

        // 3a. Check title and tags first with higher priority
        let bestTitleDist = 99;
        let matchedTitleWord = '';

        for (const word of [...titleVariants, ...tagTokens]) {
          if (Math.abs(word.length - token.length) > 2) continue;
          const dist = levenshteinDistance(token, word);
          if (dist < bestTitleDist) {
            bestTitleDist = dist;
            matchedTitleWord = word;
          }
        }

        const maxAllowedDist = token.length >= 6 ? 2 : token.length >= 4 ? 1 : 0;

        if (bestTitleDist <= maxAllowedDist && bestTitleDist > 0) {
          const isHookDoc = doc.category === 'hook' || doc.category === 'custom_hook';
          const boost = bestTitleDist === 1 ? (isHookDoc ? 65 : 45) : (isHookDoc ? 45 : 30);
          score += boost;
          tokenMatched = true;
          matchedTermsSet.add(matchedTitleWord);
          matchedField = 'title';
        } else {
          // 3b. Check keywords & content candidate words
          const otherWords = [
            ...doc.keywords.map((k) => k.toLowerCase()),
          ];

          let bestOtherDist = 99;
          let matchedOtherWord = '';

          for (const word of otherWords) {
            if (Math.abs(word.length - token.length) > 2) continue;
            const dist = levenshteinDistance(token, word);
            if (dist < bestOtherDist) {
              bestOtherDist = dist;
              matchedOtherWord = word;
            }
          }

          if (bestOtherDist <= maxAllowedDist && bestOtherDist > 0) {
            const penalty = bestOtherDist === 1 ? 25 : 15;
            score += penalty;
            tokenMatched = true;
            matchedTermsSet.add(matchedOtherWord);
            if (matchedField === 'content') matchedField = 'keyword';
          }
        }
      }

      if (tokenMatched) {
        tokensMatched++;
      }
    }

    // Density bonus: boost results that match multiple words from a multi-word query
    if (queryTokens.length > 1 && tokensMatched > 1) {
      const coverageRatio = tokensMatched / queryTokens.length;
      score *= 1 + coverageRatio * 1.2;
    }

    if (score > 0) {
      const matchedTerms = Array.from(matchedTermsSet);
      const matchedSnippet =
        doc.subtitle && matchedTerms.some((t) => subtitleLower.includes(t))
          ? doc.subtitle
          : extractSnippet(doc.content, matchedTerms);

      results.push({
        doc,
        score: Math.round(score),
        matchedField,
        matchedSnippet: matchedSnippet || doc.subtitle || doc.content.slice(0, 100),
        matchedTerms,
      });
    }
  }

  // Sort descending by relevance score
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
