'use client';

import { useState, useEffect } from 'react';
import { knowledgeBase } from '../data/knowledgeBase';
import { Sidebar } from '../components/Sidebar';
import { ContentView } from '../components/ContentView';
import { AIChatWidget } from '../components/AIChatWidget';
import { Menu, X, BookOpen, Search as SearchIcon, Bookmark } from 'lucide-react';
import { clsx } from 'clsx';
import { useBookmarks } from '../hooks/use-bookmarks';
import { useHistory } from '../hooks/use-history';
import { useIsMobile } from '../hooks/use-mobile';
import { AnimatePresence, motion } from 'motion/react';

export type SidebarTab = 'contents' | 'search' | 'saved';

export default function CosmicInterface() {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('contents');
  const [aiQuery, setAiQuery] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [isNavVisible, setIsNavVisible] = useState(true);

  const { 
    currentItem, 
    pushToHistory, 
    goBack, 
    goForward, 
    canGoBack, 
    canGoForward 
  } = useHistory(knowledgeBase[0].id, knowledgeBase[0].chapters[0].id);

  const activeBookId = currentItem.bookId;
  const activeChapterId = currentItem.chapterId;

  const {
    bookmarkedChapters,
    bookmarkedBlocks,
    toggleChapterBookmark,
    toggleBlockBookmark,
    isChapterBookmarked,
    isBlockBookmarked
  } = useBookmarks();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isMobile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSidebarOpen(false);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const activeBook = knowledgeBase.find(b => b.id === activeBookId) || knowledgeBase[0];
  const activeChapter = activeBook.chapters.find(c => c.id === activeChapterId) || activeBook.chapters[0];

  const handleSelectChapter = (bookId: string, chapterId: string, blockIdx?: number, query?: string) => {
    pushToHistory(bookId, chapterId, blockIdx);
    setSearchQuery(query);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const openSidebarTab = (tab: SidebarTab) => {
    setSidebarTab(tab);
    setIsSidebarOpen(true);
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#050505]">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div 
          className={clsx(
            "transition-all duration-300 ease-in-out shrink-0 h-full z-40 overflow-hidden relative bg-[#0a0a0a]",
            isSidebarOpen ? "w-72 border-r border-white/5" : "w-0 border-r-0"
          )}
        >
          <div className="w-72 h-full">
            <Sidebar
              books={knowledgeBase}
              activeBookId={activeBookId}
              activeChapterId={activeChapterId}
              onSelectChapter={handleSelectChapter}
              bookmarkedChapters={bookmarkedChapters}
              bookmarkedBlocks={bookmarkedBlocks}
              removeChapterBookmark={(bId, cId) => toggleChapterBookmark({ bookId: bId, chapterId: cId, bookTitle: '', chapterTitle: '' })}
              removeBlockBookmark={(bId, cId, idx) => toggleBlockBookmark({ bookId: bId, chapterId: cId, blockIdx: idx, bookTitle: '', chapterTitle: '', excerpt: '' })}
              activeTab={sidebarTab}
              onTabChange={setSidebarTab}
            />
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet Sidebar */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 z-40 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: '10%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 z-50 h-[90%] bg-[#0a0a0a] rounded-t-3xl border-t border-white/10 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col"
            >
              <div className="w-full flex justify-center pt-3 pb-1 shrink-0" onClick={() => setIsSidebarOpen(false)}>
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>
              <div className="flex-1 overflow-hidden relative">
                <Sidebar
                  books={knowledgeBase}
                  activeBookId={activeBookId}
                  activeChapterId={activeChapterId}
                  onSelectChapter={handleSelectChapter}
                  bookmarkedChapters={bookmarkedChapters}
                  bookmarkedBlocks={bookmarkedBlocks}
                  removeChapterBookmark={(bId, cId) => toggleChapterBookmark({ bookId: bId, chapterId: cId, bookTitle: '', chapterTitle: '' })}
                  removeBlockBookmark={(bId, cId, idx) => toggleBlockBookmark({ bookId: bId, chapterId: cId, blockIdx: idx, bookTitle: '', chapterTitle: '', excerpt: '' })}
                  activeTab={sidebarTab}
                  onTabChange={setSidebarTab}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05)_0%,transparent_50%)] pointer-events-none" />
        
        {!isMobile && (
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-4 left-6 z-30 p-2.5 bg-[#0a0a0a] border border-white/10 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-emerald-400 transition-colors backdrop-blur-md shadow-lg"
            title="Toggle Sidebar"
            aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <ContentView 
          book={activeBook} 
          chapter={activeChapter} 
          activeBlockIdx={currentItem.blockIdx}
          onNavigateChapter={handleSelectChapter}
          searchQuery={searchQuery}
          toggleChapterBookmark={() => toggleChapterBookmark({ bookId: activeBook.id, chapterId: activeChapter.id, bookTitle: activeBook.title, chapterTitle: activeChapter.title })}
          toggleBlockBookmark={(idx, excerpt) => toggleBlockBookmark({ bookId: activeBook.id, chapterId: activeChapter.id, blockIdx: idx, bookTitle: activeBook.title, chapterTitle: activeChapter.title, excerpt })}
          isChapterBookmarked={isChapterBookmarked(activeBook.id, activeChapter.id)}
          isBlockBookmarked={(idx) => isBlockBookmarked(activeBook.id, activeChapter.id, idx)}
          goBack={goBack}
          goForward={goForward}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onAskAI={(query) => setAiQuery(query)}
          onScrollDirectionChange={(dir) => setIsNavVisible(dir === 'up')}
        />
        
        <AIChatWidget 
          book={activeBook} 
          chapter={activeChapter} 
          initialQuery={aiQuery} 
          onCloseInitialQuery={() => setAiQuery(undefined)} 
        />

        {/* Mobile Bottom Navigation */}
        <AnimatePresence>
          {isMobile && isNavVisible && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-6 inset-x-6 z-30"
            >
              <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between shadow-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
                <button 
                  onClick={() => openSidebarTab('contents')}
                  className={clsx(
                    "flex flex-col items-center justify-center w-12 h-12 transition-colors",
                    sidebarTab === 'contents' && isSidebarOpen ? "text-[var(--color-neon-emerald)]" : "text-zinc-400 hover:text-[var(--color-neon-emerald)]"
                  )}
                  aria-label="Contents"
                >
                  <BookOpen className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-medium">Contents</span>
                </button>
                <button 
                  onClick={() => openSidebarTab('search')}
                  className={clsx(
                    "flex flex-col items-center justify-center w-12 h-12 transition-colors",
                    sidebarTab === 'search' && isSidebarOpen ? "text-[var(--color-neon-cyan)]" : "text-zinc-400 hover:text-[var(--color-neon-cyan)]"
                  )}
                  aria-label="Search"
                >
                  <SearchIcon className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-medium">Search</span>
                </button>
                <button 
                  onClick={() => openSidebarTab('saved')}
                  className={clsx(
                    "flex flex-col items-center justify-center w-12 h-12 transition-colors",
                    sidebarTab === 'saved' && isSidebarOpen ? "text-[var(--color-neon-purple)]" : "text-zinc-400 hover:text-[var(--color-neon-purple)]"
                  )}
                  aria-label="Saved"
                >
                  <Bookmark className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-medium">Saved</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

