'use client';

import { Search as SearchIcon, X } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Book, Chapter } from '../lib/types';
import { clsx } from 'clsx';

interface SearchResult {
  bookId: string;
  bookTitle: string;
  chapterId: string;
  chapterTitle: string;
  excerpt: string;
}

interface SearchProps {
  books: Book[];
  onSelectResult: (bookId: string, chapterId: string, blockIdx?: number, searchQuery?: string) => void;
  inline?: boolean;
}

export function Search({ books, onSelectResult, inline = true }: SearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when Search component mounts
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    books.forEach(book => {
      book.chapters.forEach(chapter => {
        const chapterText = chapter.blocks
          .map(b => {
            if ('text' in b) return b.text;
            if ('items' in b) return b.items.join(' ');
            if ('rows' in b) return b.rows.map(r => r.join(' ')).join(' ');
            return '';
          })
          .join(' ')
          .toLowerCase();

        if (chapterText.includes(lowerQuery) || chapter.title.toLowerCase().includes(lowerQuery)) {
          // Find an excerpt
          const index = chapterText.indexOf(lowerQuery);
          const start = Math.max(0, index - 40);
          const end = Math.min(chapterText.length, index + 60);
          let excerpt = chapterText.substring(start, end);
          if (start > 0) excerpt = '...' + excerpt;
          if (end < chapterText.length) excerpt = excerpt + '...';

          searchResults.push({
            bookId: book.id,
            bookTitle: book.title,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            excerpt: excerpt
          });
        }
      });
    });

    return searchResults.slice(0, 10);
  }, [query, books]);

  return (
    <div className="relative w-full flex flex-col h-full">
      <div className="relative group shrink-0">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[var(--color-neon-emerald)] transition-colors duration-300" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search knowledge base..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-[var(--color-neon-emerald)]/50 focus:ring-1 focus:ring-[var(--color-neon-emerald)]/30 transition-all duration-300 placeholder:text-zinc-600 shadow-inner"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[var(--color-neon-emerald)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className={clsx(
          "mt-3 glass-panel rounded-xl z-50 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200",
          inline ? "relative flex-1" : "absolute top-full left-0 right-0 max-h-[400px]"
        )}>
          <div className="p-2 space-y-1">
            {results.map((result, i) => (
              <button
                key={`${result.bookId}-${result.chapterId}-${i}`}
                onClick={() => {
                  onSelectResult(result.bookId, result.chapterId, undefined, query);
                  setQuery('');
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-all duration-300 group border border-transparent hover:border-white/10"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-[var(--color-neon-emerald)]/60 uppercase tracking-widest">{result.bookTitle}</span>
                  <span className="text-[10px] text-zinc-700">{"//"}</span>
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-[var(--color-neon-emerald)] transition-colors">{result.chapterTitle}</span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 italic leading-relaxed">
                  {result.excerpt}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {query.length >= 2 && results.length === 0 && (
        <div className={clsx(
          "mt-3 glass-panel rounded-xl p-6 text-center text-zinc-500 text-sm z-50 animate-in fade-in slide-in-from-top-2 duration-200",
          inline ? "relative" : "absolute top-full left-0 right-0"
        )}>
          No results found for <span className="text-[var(--color-neon-emerald)]">&quot;{query}&quot;</span>
        </div>
      )}
    </div>
  );
}
