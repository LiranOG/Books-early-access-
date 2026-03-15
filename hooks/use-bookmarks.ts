import { useState, useEffect } from 'react';

export interface BookmarkedChapter {
  bookId: string;
  chapterId: string;
  bookTitle: string;
  chapterTitle: string;
  savedAt?: number;
}

export interface BookmarkedBlock {
  bookId: string;
  chapterId: string;
  blockIdx: number;
  bookTitle: string;
  chapterTitle: string;
  excerpt: string;
  savedAt?: number;
}

export function useBookmarks() {
  const [bookmarkedChapters, setBookmarkedChapters] = useState<BookmarkedChapter[]>([]);
  const [bookmarkedBlocks, setBookmarkedBlocks] = useState<BookmarkedBlock[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // טעינה ראשונית מ-localStorage רק לאחר Mount
  useEffect(() => {
    const savedChapters = localStorage.getItem('cosmic-bookmarks-chapters');
    const savedBlocks = localStorage.getItem('cosmic-bookmarks-blocks');
    /* eslint-disable react-hooks/set-state-in-effect */
    if (savedChapters) setBookmarkedChapters(JSON.parse(savedChapters));
    if (savedBlocks) setBookmarkedBlocks(JSON.parse(savedBlocks));
    setIsLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // שמירה ל-localStorage בכל שינוי, רק אם הטעינה הסתיימה
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cosmic-bookmarks-chapters', JSON.stringify(bookmarkedChapters));
      localStorage.setItem('cosmic-bookmarks-blocks', JSON.stringify(bookmarkedBlocks));
    }
  }, [bookmarkedChapters, bookmarkedBlocks, isLoaded]);

  const toggleChapterBookmark = (chapter: BookmarkedChapter) => {
    setBookmarkedChapters(prev => {
      const exists = prev.some(c => c.bookId === chapter.bookId && c.chapterId === chapter.chapterId);
      if (exists) {
        return prev.filter(c => !(c.bookId === chapter.bookId && c.chapterId === chapter.chapterId));
      }
      return [...prev, { ...chapter, savedAt: Date.now() }];
    });
  };

  const toggleBlockBookmark = (block: BookmarkedBlock) => {
    setBookmarkedBlocks(prev => {
      const exists = prev.some(b => b.bookId === block.bookId && b.chapterId === block.chapterId && b.blockIdx === block.blockIdx);
      if (exists) {
        return prev.filter(b => !(b.bookId === block.bookId && b.chapterId === block.chapterId && b.blockIdx === block.blockIdx));
      }
      return [...prev, { ...block, savedAt: Date.now() }];
    });
  };

  const isChapterBookmarked = (bookId: string, chapterId: string) => 
    bookmarkedChapters.some(c => c.bookId === bookId && c.chapterId === chapterId);

  const isBlockBookmarked = (bookId: string, chapterId: string, blockIdx: number) => 
    bookmarkedBlocks.some(b => b.bookId === bookId && b.chapterId === chapterId && b.blockIdx === blockIdx);

  return {
    bookmarkedChapters,
    bookmarkedBlocks,
    toggleChapterBookmark,
    toggleBlockBookmark,
    isChapterBookmarked,
    isBlockBookmarked
  };
}
