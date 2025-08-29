'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  Lightbulb, 
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'suggestion' | 'resource';
}

interface EducationalResource {
  title: string;
  description: string;
  type: 'course' | 'article' | 'video' | 'quiz';
  url?: string;
}

const EDUCATIONAL_PROMPTS = [
  "How can I improve my study habits?",
  "What are effective learning strategies?",
  "How do I prepare for exams?",
  "Can you explain a concept I'm struggling with?",
  "What courses would you recommend for me?",
  "How can I stay motivated while learning?"
];

const EDUCATIONAL_RESPONSES = {
  study_habits: {
    content: "Here are some proven study habits:\n\n• **Active Recall**: Test yourself instead of just re-reading\n• **Spaced Repetition**: Review material at increasing intervals\n• **Pomodoro Technique**: Study in 25-minute focused sessions\n• **Environment**: Create a dedicated, distraction-free study space\n• **Sleep**: Ensure 7-9 hours of quality sleep for memory consolidation",
    suggestions: ["Create a study schedule", "Use flashcards", "Join study groups"]
  },
  learning_strategies: {
    content: "Effective learning strategies include:\n\n• **Chunking**: Break complex topics into smaller parts\n• **Elaboration**: Explain concepts in your own words\n• **Dual Coding**: Combine words with visuals\n• **Interleaving**: Mix different topics during study sessions\n• **Retrieval Practice**: Regularly test your knowledge",
    suggestions: ["Try mind mapping", "Teach others", "Use multiple senses"]
  },
  exam_preparation: {
    content: "Exam preparation tips:\n\n• **Start Early**: Begin studying weeks before the exam\n• **Understand the Format**: Know what types of questions to expect\n• **Practice Tests**: Take mock exams under timed conditions\n• **Review Weak Areas**: Focus more time on challenging topics\n• **Healthy Routine**: Maintain good sleep, nutrition, and exercise",
    suggestions: ["Create a study calendar", "Form study groups", "Use past papers"]
  },
  motivation: {
    content: "To stay motivated while learning:\n\n• **Set Clear Goals**: Define what you want to achieve\n• **Break Down Tasks**: Make large goals into smaller, manageable steps\n• **Track Progress**: Celebrate small wins and milestones\n• **Find Your Why**: Connect learning to your personal values\n• **Reward Yourself**: Give yourself incentives for completing tasks",
    suggestions: ["Create a vision board", "Find a study buddy", "Set up rewards"]
  }
};

export function EducationalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm your educational assistant. I can help you with study tips, learning strategies, course recommendations, and more. What would you like to learn about today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple keyword-based responses
    if (lowerMessage.includes('study') || lowerMessage.includes('habit')) {
      return EDUCATIONAL_RESPONSES.study_habits.content;
    } else if (lowerMessage.includes('learn') || lowerMessage.includes('strategy')) {
      return EDUCATIONAL_RESPONSES.learning_strategies.content;
    } else if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('prepare')) {
      return EDUCATIONAL_RESPONSES.exam_preparation.content;
    } else if (lowerMessage.includes('motivat') || lowerMessage.includes('focus')) {
      return EDUCATIONAL_RESPONSES.motivation.content;
    } else if (lowerMessage.includes('course') || lowerMessage.includes('recommend')) {
      return "Based on your learning goals, I'd recommend:\n\n• **Programming**: Start with Python or JavaScript fundamentals\n• **Design**: Learn UI/UX principles and tools like Figma\n• **Business**: Focus on digital marketing and entrepreneurship\n• **Creative**: Explore graphic design and content creation\n\nWhat interests you most?";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('confused')) {
      return "I'm here to help! I can assist with:\n\n• Study techniques and learning strategies\n• Course recommendations and learning paths\n• Exam preparation and time management\n• Motivation and goal setting\n• Understanding complex concepts\n\nJust ask me anything related to your learning journey!";
    } else {
      return "That's an interesting question! While I'm designed to help with educational topics, I'd be happy to discuss learning strategies, study tips, or course recommendations. What specific area of learning would you like to explore?";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await generateResponse(inputValue);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 h-96">
      <Card className="h-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/20 rounded-full">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Learning Assistant</CardTitle>
                <div className="text-xs opacity-90">Educational Support</div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="p-0 flex flex-col h-full">
              <ScrollArea className="flex-1 p-4 max-h-64">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.sender === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.sender === 'bot' && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/bot-avatar.png" />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                            <Bot className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                          message.sender === 'user'
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        )}
                      >
                        <div className="whitespace-pre-line">{message.content}</div>
                        <div className={cn(
                          "text-xs mt-1",
                          message.sender === 'user' ? "text-blue-100" : "text-gray-500"
                        )}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {message.sender === 'user' && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/user-avatar.png" />
                          <AvatarFallback className="bg-gray-500 text-white text-xs">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-gray-50">
                <div className="mb-3">
                  <div className="text-xs text-gray-600 mb-2 font-medium">Quick Questions:</div>
                  <div className="flex flex-wrap gap-1">
                    {EDUCATIONAL_PROMPTS.slice(0, 3).map((prompt, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        onClick={() => handleQuickPrompt(prompt)}
                      >
                        {prompt}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about learning, studying, or courses..."
                    className="flex-1 text-sm"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
