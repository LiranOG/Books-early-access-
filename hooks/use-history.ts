import { useState, useEffect, useCallback } from 'react';

interface HistoryItem {
  bookId: string;
  chapterId: string;
  blockIdx?: number;
}

interface HistoryState {
  items: HistoryItem[];
  currentIndex: number;
}

export function useHistory(initialBookId: string, initialChapterId: string) {
  const [state, setState] = useState<HistoryState>({
    items: [{ bookId: initialBookId, chapterId: initialChapterId }],
    currentIndex: 0
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // טעינה ראשונית מ-sessionStorage רק לאחר Mount
  useEffect(() => {
    const savedHistory = sessionStorage.getItem('cosmic-history');
    const savedIndex = sessionStorage.getItem('cosmic-history-index');
    
    /* eslint-disable react-hooks/set-state-in-effect */
    if (savedHistory && savedIndex) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        const parsedIndex = parseInt(savedIndex, 10);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0 && parsedIndex >= 0 && parsedIndex < parsedHistory.length) {
          setState({
            items: parsedHistory,
            currentIndex: parsedIndex
          });
        }
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
    setIsLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem('cosmic-history', JSON.stringify(state.items));
      sessionStorage.setItem('cosmic-history-index', state.currentIndex.toString());
    }
  }, [state, isLoaded]);

  const pushToHistory = useCallback((bookId: string, chapterId: string, blockIdx?: number) => {
    setState(prev => {
      // חותך את ההיסטוריה העתידית אם אנחנו מנווטים מנקודה בעבר
      const newItems = prev.items.slice(0, prev.currentIndex + 1);
      const lastItem = newItems[newItems.length - 1];
      
      // מונע דחיפה של אותו דף ברצף
      if (lastItem?.bookId === bookId && lastItem?.chapterId === chapterId && lastItem?.blockIdx === blockIdx) {
        return prev;
      }
      
      newItems.push({ bookId, chapterId, blockIdx });
      return {
        items: newItems,
        currentIndex: newItems.length - 1
      };
    });
  }, []);

  const goBack = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex > 0) {
        return { ...prev, currentIndex: prev.currentIndex - 1 };
      }
      return prev;
    });
  }, []);

  const goForward = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex < prev.items.length - 1) {
        return { ...prev, currentIndex: prev.currentIndex + 1 };
      }
      return prev;
    });
  }, []);

  const currentItem = state.items[state.currentIndex] || { bookId: initialBookId, chapterId: initialChapterId };

  return {
    currentItem,
    pushToHistory,
    goBack,
    goForward,
    canGoBack: state.currentIndex > 0,
    canGoForward: state.currentIndex < state.items.length - 1
  };
}
