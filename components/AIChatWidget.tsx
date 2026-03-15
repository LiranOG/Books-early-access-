'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useGemini } from '../hooks/use-gemini';
import { clsx } from 'clsx';
import { Chapter, Book } from '../lib/types';

interface AIChatWidgetProps {
  book: Book;
  chapter: Chapter;
  initialQuery?: string;
  onCloseInitialQuery?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export function AIChatWidget({ book, chapter, initialQuery, onCloseInitialQuery }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { generateStream } = useGemini();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle initial query from "Ask AI" buttons
  useEffect(() => {
    if (initialQuery) {
      setIsOpen(true);
      handleSend(initialQuery);
      if (onCloseInitialQuery) onCloseInitialQuery();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Add a placeholder for AI response
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '' }]);

    try {
      // Build context from the current chapter
      const chapterContext = chapter.blocks.map(b => {
        if ('text' in b) return b.text;
        if ('items' in b) return b.items.join('\n');
        return '';
      }).join('\n\n');

      const systemInstruction = `You are the AI assistant for the book "${book.title}". 
You are currently helping the user understand the chapter "${chapter.title}".
Use the following chapter content as your primary context:
---
${chapterContext}
---
Answer the user's questions clearly, concisely, and in the tone of the book (mystical, philosophical, yet clear). If the user asks something outside the context, try to relate it back to the book's themes if possible.`;

      const stream = await generateStream(text, systemInstruction);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, content: fullResponse } : msg
          ));
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId ? { ...msg, content: "Sorry, I encountered an error connecting to the cosmic interface. Please try again." } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 end-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
            className="mb-4 w-[calc(100vw-48px)] sm:w-[400px] h-[500px] max-h-[70vh] glass-panel rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--color-neon-emerald)]">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-display font-bold tracking-widest uppercase text-sm">Cosmic AI</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close AI Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-3">
                  <Sparkles className="w-8 h-8 opacity-50" />
                  <p className="text-sm">Ask me anything about<br/><span className="text-[var(--color-neon-cyan)]">{chapter.title}</span></p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={clsx(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-[var(--color-neon-emerald)]/20 text-emerald-50 self-end ms-auto border border-[var(--color-neon-emerald)]/30" 
                      : "bg-white/5 text-zinc-300 self-start border border-white/10"
                  )}
                  dir="auto"
                >
                  {msg.content || (msg.role === 'ai' && isLoading && <span className="animate-pulse">Thinking...</span>)}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-black/20">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[var(--color-neon-emerald)]/50 transition-colors"
                  dir="auto"
                />
                <Button 
                  type="submit" 
                  variant="glow" 
                  size="icon" 
                  disabled={!input.trim() || isLoading}
                  className="shrink-0 rounded-xl"
                  aria-label="Send message"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,157,0.3)] transition-colors duration-300",
          isOpen 
            ? "bg-white/10 text-white border border-white/20" 
            : "bg-[var(--color-neon-emerald)] text-[#050505] hover:bg-[#00ff9d]"
        )}
        aria-label={isOpen ? "Close AI Chat" : "Open AI Chat"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
