
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import type { ChatInput } from '@/ai/flows/grok-chat.schema';
import { Bot, Send, X, Loader2, Smile } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

// Common emojis for quick access
const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
  '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
  '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽'
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    // When the widget opens, clear previous messages.
    if (isOpen) {
      setMessages([]);
    }
  }, [isOpen]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  const addEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    const prompt = input;
    setInput('');
    setIsLoading(true);

    try {
        const chatInput: ChatInput = {
            history: newMessages.slice(0, -1).map(m => ({role: m.role, content: m.content})), // Send history without the current prompt
            prompt: prompt,
        };
        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chatInput),
        });
        const result = await res.json();
        setMessages(prev => [...prev, { role: 'model', content: result.response }]);
    } catch (error) {
        console.error("Chat error:", error);
        setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 z-50 w-full max-w-sm rounded-lg border bg-card shadow-2xl"
          >
            <div className="flex flex-col h-[60vh]">
              <header className="flex items-center justify-between border-b p-4">
                <h3 className="font-semibold text-card-foreground">digitalmen0 Assistant</h3>
                <Button variant="ghost" size="icon" onClick={toggleOpen}>
                  <X className="h-4 w-4" />
                </Button>
              </header>
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${
                        message.role === 'user' ? 'justify-end' : ''
                      }`}
                    >
                      {message.role === 'model' && (
                        <Avatar className="h-8 w-8">
                           <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 text-sm ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                       {message.role === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                     <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot size={20} /></AvatarFallback>
                         </Avatar>
                         <div className="max-w-xs rounded-lg p-3 text-sm bg-muted">
                            <Loader2 className="h-5 w-5 animate-spin" />
                         </div>
                     </div>
                  )}
                </div>
              </ScrollArea>
              <div className="border-t p-4">
                <div className="relative">
                  <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Tapez votre message..."
                    className="pr-20"
                    rows={1}
                  />
                  
                  {/* Emoji Button */}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>

                  {/* Send Button */}
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={handleSend}
                    disabled={isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>

                  {/* Emoji Picker */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        ref={emojiPickerRef}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full right-0 mb-2 p-3 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto"
                      >
                        <div className="grid grid-cols-8 gap-1">
                          {commonEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => addEmoji(emoji)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded text-lg transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-5 right-5 z-50"
      >
        <Button size="icon" className="rounded-full w-14 h-14 shadow-lg" onClick={toggleOpen}>
           {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </Button>
      </motion.div>
    </>
  );
}
