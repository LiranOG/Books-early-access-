import { motion, AnimatePresence, Variants, PanInfo, useScroll, useSpring } from 'motion/react';
import { Book, Chapter, ContentBlock } from '../lib/types';
import { clsx } from 'clsx';
import { Bookmark, BookmarkCheck, ArrowLeft, ArrowRight, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/Button';
import { useEffect, useState, UIEvent, useRef } from 'react';
import { useGemini } from '../hooks/use-gemini';

interface ContentViewProps {
  book: Book;
  chapter: Chapter;
  activeBlockIdx?: number;
  onNavigateChapter: (bookId: string, chapterId: string) => void;
  onAskAI: (query: string) => void;
  searchQuery?: string;
  // Bookmark props
  toggleChapterBookmark: () => void;
  toggleBlockBookmark: (blockIdx: number, excerpt: string) => void;
  isChapterBookmarked: boolean;
  isBlockBookmarked: (blockIdx: number) => boolean;
  // History props
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onScrollDirectionChange?: (direction: 'up' | 'down') => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export function ContentView({ 
  book, 
  chapter, 
  activeBlockIdx,
  onNavigateChapter,
  toggleChapterBookmark, 
  toggleBlockBookmark, 
  isChapterBookmarked, 
  isBlockBookmarked,
  goBack,
  goForward,
  canGoBack,
  canGoForward,
  onAskAI,
  searchQuery,
  onScrollDirectionChange
}: ContentViewProps) {
  const isHe = book.language === 'he';
  const lastScrollY = useRef(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const { generateText } = useGemini();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentScrollY = target.scrollTop;

    if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
      if (isNavVisible) {
        setIsNavVisible(false);
        onScrollDirectionChange?.('down');
      }
    } else if (currentScrollY < lastScrollY.current - 10) {
      if (!isNavVisible) {
        setIsNavVisible(true);
        onScrollDirectionChange?.('up');
      }
    }
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    // Reset summary when chapter changes
    setSummary(null);
    setIsSummaryOpen(true);
  }, [chapter.id]);

  const handleGenerateSummary = async () => {
    if (summary || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const chapterContext = chapter.blocks.map(b => {
        if ('text' in b) return b.text;
        if ('items' in b) return b.items.join('\n');
        return '';
      }).join('\n\n');
      
      const prompt = `Provide a concise, insightful summary of the following chapter in 2-3 sentences. Focus on the core themes and knowledge presented. \n\nChapter Title: ${chapter.title}\n\nContent:\n${chapterContext}`;
      const result = await generateText(prompt, `You are a helpful assistant for the book "${book.title}". Provide the summary in the same language as the book (${book.language}).`);
      setSummary(result);
    } catch (error) {
      console.error("Failed to generate summary:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    if (activeBlockIdx !== undefined) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`block-${activeBlockIdx}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Highlight effect
          element.classList.add('bg-[var(--color-neon-emerald)]/10', 'shadow-[0_0_20px_rgba(0,255,157,0.1)]');
          setTimeout(() => {
            element.classList.remove('bg-[var(--color-neon-emerald)]/10', 'shadow-[0_0_20px_rgba(0,255,157,0.1)]');
          }, 2000);
        }
      }, 400); // wait for exit/enter animations
      return () => clearTimeout(timer);
    } else {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [chapter.id, activeBlockIdx]);

  const getExcerpt = (block: ContentBlock) => {
    if ('text' in block) return block.text.substring(0, 60) + '...';
    if ('items' in block) return block.items[0].substring(0, 60) + '...';
    return 'Table / Data block...';
  };

  const highlightText = (text: string, query?: string) => {
    if (!query) return text;
    
    // Escape special regex characters in query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="bg-[var(--color-neon-emerald)]/30 text-white font-bold rounded px-1 shadow-[0_0_10px_rgba(0,255,157,0.2)]">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const renderBlockWithBookmark = (block: ContentBlock, idx: number) => {
    const isSaved = isBlockBookmarked(idx);
    
    let blockContent;
    switch (block.type) {
      case 'h1': blockContent = <h1 className={clsx("text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight text-glow px-2 md:px-0", isHe ? "font-sans" : "font-display")}>{highlightText(block.text, searchQuery)}</h1>; break;
      case 'h2': blockContent = <h2 className={clsx("text-2xl md:text-3xl font-semibold text-zinc-100 mt-12 mb-6 px-2 md:px-0", isHe ? "font-sans" : "font-display")}>{highlightText(block.text, searchQuery)}</h2>; break;
      case 'h3': blockContent = <h3 className={clsx("text-xl font-medium text-[var(--color-neon-emerald)] mt-8 mb-4 px-2 md:px-0", isHe ? "font-sans" : "font-display")}>{highlightText(block.text, searchQuery)}</h3>; break;
      case 'h4': blockContent = <h4 className="text-lg font-bold text-zinc-300 mt-6 mb-3 px-2 md:px-0">{highlightText(block.text, searchQuery)}</h4>; break;
      case 'p': blockContent = <p className="text-lg md:text-xl text-zinc-300 leading-loose mb-8 px-2 md:px-0" dir="auto">{highlightText(block.text, searchQuery)}</p>; break;
      case 'quote': blockContent = <blockquote className="border-s-4 border-[var(--color-neon-emerald)]/50 ps-6 py-4 my-8 mx-2 md:mx-0 italic text-xl md:text-2xl text-zinc-200 bg-[var(--color-neon-emerald)]/5 rounded-e-xl backdrop-blur-sm leading-relaxed" dir="auto">{highlightText(block.text, searchQuery)}</blockquote>; break;
      case 'list': blockContent = <ul className="list-disc list-inside space-y-4 mb-8 text-zinc-300 text-lg md:text-xl ms-4 px-2 md:px-0 leading-relaxed" dir="auto">{block.items.map((item, i) => <li key={i}>{highlightText(item, searchQuery)}</li>)}</ul>; break;
      case 'table': blockContent = (
          <div className="overflow-x-auto mb-8 mx-2 md:mx-0 rounded-xl glass-panel">
            <table className="w-full text-start border-collapse">
              <thead><tr className="border-b border-white/10 bg-white/5">{block.headers.map((h, i) => <th key={i} className="p-4 text-sm font-mono text-[var(--color-neon-emerald)] uppercase tracking-wider">{highlightText(h, searchQuery)}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/5">{block.rows.map((row, i) => <tr key={i} className="hover:bg-white/5 transition-colors">{row.map((cell, j) => <td key={j} className="p-4 text-zinc-300 text-lg">{highlightText(cell, searchQuery)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        ); break;
      case 'code': blockContent = <pre className="glass-panel p-6 mx-2 md:mx-0 rounded-xl overflow-x-auto mb-8 font-mono text-sm md:text-base text-[var(--color-neon-cyan)] shadow-inner" dir="ltr"><code>{highlightText(block.text, searchQuery)}</code></pre>; break;
      default: blockContent = null;
    }

    return (
      <motion.div variants={itemVariants} key={idx} id={`block-${idx}`} className="relative group p-4 -mx-4 rounded-2xl transition-all duration-700">
        {blockContent}
        
        {/* Action Buttons Container */}
        <div className={clsx(
          "transition-all duration-300 flex gap-2 z-10",
          "opacity-100 md:opacity-0 md:group-hover:opacity-100", // Always visible on mobile, hover on desktop
          "mt-2 md:mt-0 justify-end md:absolute md:-end-12 md:top-0 md:flex-col px-2 md:px-0" // Relative row on mobile, absolute col on desktop
        )}>
          {/* Bookmark Button */}
          <button
            onClick={() => toggleBlockBookmark(idx, getExcerpt(block))}
            className={clsx(
              "p-3 md:p-2 rounded-lg backdrop-blur-md border transition-all flex items-center justify-center",
              isSaved 
                ? "text-[var(--color-neon-emerald)] bg-[var(--color-neon-emerald)]/10 border-[var(--color-neon-emerald)]/30 shadow-[0_0_10px_rgba(0,255,157,0.2)]" 
                : "text-zinc-500 hover:text-[var(--color-neon-emerald)] bg-[#030305]/80 border-white/10 hover:border-[var(--color-neon-emerald)]/30"
            )}
            title={isSaved ? "Remove Bookmark" : "Bookmark this section"}
            aria-label={isSaved ? "Remove Bookmark" : "Bookmark this section"}
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5 md:w-4 md:h-4" /> : <Bookmark className="w-5 h-5 md:w-4 md:h-4" />}
          </button>

          {/* Ask AI Button */}
          <button
            onClick={() => onAskAI(`Can you explain this part from chapter "${chapter.title}":\n\n"${getExcerpt(block)}"`)}
            className="p-3 md:p-2 rounded-lg backdrop-blur-md border text-zinc-500 hover:text-[var(--color-neon-cyan)] bg-[#030305]/80 border-white/10 hover:border-[var(--color-neon-cyan)]/30 transition-all flex items-center justify-center"
            title="Ask AI about this block"
            aria-label="Ask AI about this block"
          >
            <Sparkles className="w-5 h-5 md:w-4 md:h-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  const currentChapterIndex = book.chapters.findIndex(c => c.id === chapter.id);
  const prevChapter = currentChapterIndex > 0 ? book.chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < book.chapters.length - 1 ? book.chapters[currentChapterIndex + 1] : null;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      // Swiped right
      if (isHe) {
        if (nextChapter) onNavigateChapter(book.id, nextChapter.id);
      } else {
        if (prevChapter) onNavigateChapter(book.id, prevChapter.id);
      }
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped left
      if (isHe) {
        if (prevChapter) onNavigateChapter(book.id, prevChapter.id);
      } else {
        if (nextChapter) onNavigateChapter(book.id, nextChapter.id);
      }
    }
  };

  return (
    <div id="content-scroll-container" ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scroll-smooth relative bg-[var(--color-cosmic-void)] overflow-x-hidden">
      {/* Top Navigation Bar */}
      <motion.div 
        initial={{ y: 0 }}
        animate={{ y: isNavVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-20 px-4 md:px-8 py-4 glass-panel border-b border-white/5 flex items-center justify-between rounded-none"
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {/* Reading Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
          <motion.div 
            className="h-full bg-[var(--color-neon-emerald)] origin-left"
            style={{ scaleX }}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="icon" onClick={goBack} disabled={!canGoBack} className="w-11 h-11 md:w-10 md:h-10" aria-label="Go back">
             <ArrowLeft className="w-5 h-5 md:w-4 md:h-4 rtl:-scale-x-100" />
          </Button>
          <Button variant="secondary" size="icon" onClick={goForward} disabled={!canGoForward} className="w-11 h-11 md:w-10 md:h-10" aria-label="Go forward">
            <ArrowRight className="w-5 h-5 md:w-4 md:h-4 rtl:-scale-x-100" />
          </Button>
        </div>

        <Button
          variant={isChapterBookmarked ? 'glow' : 'secondary'}
          onClick={toggleChapterBookmark}
          className="gap-2 rounded-full h-11 px-5 md:h-10 md:px-4"
        >
          {isChapterBookmarked ? <BookmarkCheck className="w-5 h-5 md:w-4 md:h-4" /> : <Bookmark className="w-5 h-5 md:w-4 md:h-4" />}
          <span className="hidden md:inline">{isChapterBookmarked ? "Saved" : "Save Chapter"}</span>
        </Button>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 md:px-12 py-8 md:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={chapter.id}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            dir={isHe ? 'rtl' : 'ltr'}
            className="pb-32 font-sans text-start touch-pan-y"
          >
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-10 px-2 md:px-0">
              <div className="flex items-center gap-3 text-sm font-mono text-[var(--color-neon-emerald)]/70 uppercase tracking-widest">
                <span>{book.title}</span>
                <span className="text-zinc-600">{"//"}</span>
                <span className="text-[var(--color-neon-cyan)]">{chapter.title}</span>
              </div>
              
              {/* Bookmark button next to chapter title */}
              <button
                onClick={toggleChapterBookmark}
                className={clsx(
                  "p-3 md:p-2 rounded-full transition-all duration-300 border backdrop-blur-md flex items-center justify-center",
                  isChapterBookmarked
                    ? "text-[var(--color-neon-emerald)] bg-[var(--color-neon-emerald)]/10 border-[var(--color-neon-emerald)]/30 shadow-[0_0_10px_rgba(0,255,157,0.2)]"
                    : "text-zinc-500 hover:text-[var(--color-neon-emerald)] bg-white/5 border-white/10 hover:border-[var(--color-neon-emerald)]/30"
                )}
                title={isChapterBookmarked ? "Remove from Favorites" : "Save to Favorites"}
                aria-label={isChapterBookmarked ? "Remove from Favorites" : "Save to Favorites"}
              >
                {isChapterBookmarked ? <BookmarkCheck className="w-6 h-6 md:w-5 md:h-5" /> : <Bookmark className="w-6 h-6 md:w-5 md:h-5" />}
              </button>
            </motion.div>

            {/* AI Chapter Summary Section */}
            <motion.div variants={itemVariants} className="mb-12 px-2 md:px-0">
              {!summary && !isSummarizing ? (
                <Button 
                  variant="secondary" 
                  onClick={handleGenerateSummary}
                  className="w-full py-8 md:py-6 border-white/10 hover:border-[var(--color-neon-cyan)]/30 hover:bg-[var(--color-neon-cyan)]/5 group flex flex-col items-center justify-center gap-2 rounded-2xl border-dashed"
                >
                  <Sparkles className="w-6 h-6 md:w-5 md:h-5 text-zinc-500 group-hover:text-[var(--color-neon-cyan)] transition-colors" />
                  <span className="text-base md:text-sm text-zinc-400 group-hover:text-zinc-300">Generate AI Summary</span>
                </Button>
              ) : (
                <div className="glass-panel rounded-2xl overflow-hidden border border-[var(--color-neon-cyan)]/20 shadow-[0_0_30px_rgba(0,255,255,0.05)]">
                  <button 
                    className="w-full p-5 md:p-4 bg-white/5 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors text-left"
                    onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                    aria-expanded={isSummaryOpen}
                  >
                    <div className="flex items-center gap-2 text-[var(--color-neon-cyan)]">
                      <Sparkles className="w-5 h-5 md:w-4 md:h-4" />
                      <h3 className="text-base md:text-sm font-bold uppercase tracking-widest">AI Chapter Summary</h3>
                    </div>
                    {isSummaryOpen ? <ChevronUp className="w-5 h-5 md:w-4 md:h-4 text-zinc-500" /> : <ChevronDown className="w-5 h-5 md:w-4 md:h-4 text-zinc-500" />}
                  </button>
                  
                  <AnimatePresence>
                    {isSummaryOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 text-zinc-200 leading-relaxed text-lg md:text-base italic border-s-2 border-[var(--color-neon-cyan)]/50 ms-6 my-4 bg-[var(--color-neon-cyan)]/5 rounded-e-xl">
                          {isSummarizing ? (
                            <div className="flex items-center gap-3 text-zinc-400">
                              <Loader2 className="w-5 h-5 md:w-4 md:h-4 animate-spin text-[var(--color-neon-cyan)]" />
                              <span>Analyzing cosmic data...</span>
                            </div>
                          ) : (
                            summary
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
            
            {chapter.blocks.map((block, idx) => renderBlockWithBookmark(block, idx))}

            {/* Chapter Navigation Buttons */}
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 px-2 md:px-0">
              {prevChapter ? (
                <Button 
                  variant="secondary" 
                  className="w-full sm:w-auto flex items-center gap-3 py-8 px-6 md:py-6"
                  onClick={() => onNavigateChapter(book.id, prevChapter.id)}
                >
                  <ArrowLeft className="w-6 h-6 md:w-5 md:h-5 rtl:-scale-x-100 text-[var(--color-neon-emerald)]" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm md:text-xs text-zinc-500 uppercase tracking-wider font-mono">Previous Chapter</span>
                    <span className="text-base md:text-sm text-zinc-200 truncate max-w-[200px]">{prevChapter.title}</span>
                  </div>
                </Button>
              ) : <div />}

              {nextChapter ? (
                <Button 
                  variant="secondary" 
                  className="w-full sm:w-auto flex items-center gap-3 py-8 px-6 md:py-6 text-right"
                  onClick={() => onNavigateChapter(book.id, nextChapter.id)}
                >
                  <div className="flex flex-col items-end">
                    <span className="text-sm md:text-xs text-zinc-500 uppercase tracking-wider font-mono">Next Chapter</span>
                    <span className="text-base md:text-sm text-zinc-200 truncate max-w-[200px]">{nextChapter.title}</span>
                  </div>
                  <ArrowRight className="w-6 h-6 md:w-5 md:h-5 rtl:-scale-x-100 text-[var(--color-neon-emerald)]" />
                </Button>
              ) : <div />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
