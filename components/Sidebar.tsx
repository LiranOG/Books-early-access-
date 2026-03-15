import { Book as BookType } from '../lib/types';
import { Book, ChevronRight, Database, Bookmark, X, Search as SearchIcon, List } from 'lucide-react';
import { clsx } from 'clsx';
import { Search } from './Search';
import { BookmarkedChapter, BookmarkedBlock } from '../hooks/use-bookmarks';
import { Badge } from './ui/Badge';
import { SidebarTab } from '../app/page';

interface SidebarProps {
  books: BookType[];
  activeBookId: string;
  activeChapterId: string;
  onSelectChapter: (bookId: string, chapterId: string, blockIdx?: number, searchQuery?: string) => void;
  // Bookmark props
  bookmarkedChapters: BookmarkedChapter[];
  bookmarkedBlocks: BookmarkedBlock[];
  removeChapterBookmark: (bookId: string, chapterId: string) => void;
  removeBlockBookmark: (bookId: string, chapterId: string, blockIdx: number) => void;
  activeTab?: SidebarTab;
  onTabChange?: (tab: SidebarTab) => void;
}

export function Sidebar({ 
  books, 
  activeBookId, 
  activeChapterId, 
  onSelectChapter,
  bookmarkedChapters,
  bookmarkedBlocks,
  removeChapterBookmark,
  removeBlockBookmark,
  activeTab = 'contents',
  onTabChange
}: SidebarProps) {
  
  const hasBookmarks = bookmarkedChapters.length > 0 || bookmarkedBlocks.length > 0;

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div className="w-full h-full bg-[var(--color-cosmic-void)] border-e border-white/5 flex flex-col z-10 shrink-0 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 start-0 w-full h-64 bg-[var(--color-neon-emerald)]/5 blur-[100px] pointer-events-none" />

      <div className="p-6 border-b border-white/5 space-y-6 relative z-10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[var(--color-neon-emerald)]">
            <Database className="w-5 h-5 animate-pulse-glow" />
            <h1 className="font-display font-bold tracking-widest uppercase text-sm text-glitch">
              NEXUS // CHRONICLES
            </h1>
          </div>
          <Badge variant="neon">v3.1.0</Badge>
        </div>
        
        {/* Desktop Tabs (Mobile uses bottom nav) */}
        <div className="hidden md:flex bg-black/40 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => onTabChange?.('contents')}
            className={clsx(
              "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-2",
              activeTab === 'contents' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <List className="w-3.5 h-3.5" />
            Contents
          </button>
          <button
            onClick={() => onTabChange?.('search')}
            className={clsx(
              "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-2",
              activeTab === 'search' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <SearchIcon className="w-3.5 h-3.5" />
            Search
          </button>
          <button
            onClick={() => onTabChange?.('saved')}
            className={clsx(
              "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-2",
              activeTab === 'saved' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Saved
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 relative z-10">
        
        {activeTab === 'search' && (
          <div className="space-y-4">
            <Search books={books} onSelectResult={onSelectChapter} />
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-3 mb-6 pb-6">
            <div className="flex items-center gap-2 text-[var(--color-neon-cyan)] px-2 mb-4">
              <Bookmark className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-widest">Saved Data</h2>
            </div>
            
            {!hasBookmarks && (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No saved items yet.
              </div>
            )}

            {/* פרקים מועדפים */}
            {bookmarkedChapters.map((bm) => (
              <div key={`ch-${bm.bookId}-${bm.chapterId}`} className="group flex items-center justify-between px-3 py-2.5 rounded-xl glass-panel glass-panel-hover">
                <button 
                  onClick={() => onSelectChapter(bm.bookId, bm.chapterId)}
                  className="text-start text-sm text-zinc-300 group-hover:text-[var(--color-neon-cyan)] transition-colors truncate flex-1"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">{bm.bookTitle}</span>
                    {bm.savedAt && <span className="text-[9px] text-zinc-600 font-mono">{formatDate(bm.savedAt)}</span>}
                  </div>
                  {bm.chapterTitle}
                </button>
                <button 
                  onClick={() => removeChapterBookmark(bm.bookId, bm.chapterId)} 
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 transition-all rounded-md hover:bg-red-400/10"
                  aria-label="Remove chapter bookmark"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* בלוקים מועדפים */}
            {bookmarkedBlocks.map((bm) => (
              <div key={`blk-${bm.bookId}-${bm.chapterId}-${bm.blockIdx}`} className="group flex items-start justify-between px-3 py-3 rounded-xl glass-panel glass-panel-hover">
                 <button 
                  onClick={() => onSelectChapter(bm.bookId, bm.chapterId, bm.blockIdx)}
                  className="text-start text-sm text-zinc-300 group-hover:text-[var(--color-neon-cyan)] transition-colors flex-1 pe-2"
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="block text-[10px] text-[var(--color-neon-cyan)]/70 uppercase tracking-wider">{bm.chapterTitle}</span>
                    {bm.savedAt && <span className="text-[9px] text-zinc-600 font-mono shrink-0">{formatDate(bm.savedAt)}</span>}
                  </div>
                  <span className="text-xs text-zinc-400 line-clamp-2 italic leading-relaxed">&quot;{bm.excerpt}&quot;</span>
                </button>
                <button 
                  onClick={() => removeBlockBookmark(bm.bookId, bm.chapterId, bm.blockIdx)} 
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 transition-all rounded-md hover:bg-red-400/10 mt-1"
                  aria-label="Remove block bookmark"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* רשימת הספרים הרגילה */}
        {activeTab === 'contents' && books.map((book) => (
          <div key={book.id} className="space-y-3">
            <div className="flex items-center justify-between px-2 mb-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Book className="w-4 h-4" />
                <h2 className="text-xs font-bold uppercase tracking-widest">{book.title}</h2>
              </div>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 uppercase">{book.language}</Badge>
            </div>
            <div className="space-y-1.5">
              {book.chapters.map((chapter) => {
                const isActive = book.id === activeBookId && chapter.id === activeChapterId;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => onSelectChapter(book.id, chapter.id)}
                    className={clsx(
                      "w-full text-start px-3 py-2.5 rounded-xl text-sm transition-all duration-300 flex items-center gap-3 group relative overflow-hidden",
                      isActive
                        ? "bg-[var(--color-neon-emerald)]/10 text-[var(--color-neon-emerald)] font-medium border border-[var(--color-neon-emerald)]/20 shadow-[0_0_15px_rgba(0,255,157,0.05)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                    dir={book.language === 'he' ? 'rtl' : 'ltr'}
                  >
                    {isActive && (
                      <div className="absolute start-0 top-0 bottom-0 w-0.5 bg-[var(--color-neon-emerald)] shadow-[0_0_10px_var(--color-neon-emerald)]" />
                    )}
                    
                    {isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[var(--color-neon-emerald)] rtl:-scale-x-100" />
                    ) : (
                      <div className="w-3.5 h-3.5 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity transform md:group-hover:translate-x-1 md:rtl:group-hover:-translate-x-1 duration-300">
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 rtl:-scale-x-100" />
                      </div>
                    )}
                    <span className="truncate">{chapter.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
