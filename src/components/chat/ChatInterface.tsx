"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiClient, ChatMessage, ChatResponse } from '@/lib/api';

interface ChatInterfaceProps {
  onActivitySelect?: (activities: any[]) => void;
}

export function ChatInterface({ onActivitySelect }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initialHistoryLoaded, setInitialHistoryLoaded] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only scroll on messages change if the user has started interacting
    // This prevents auto-scroll on initial page load
    if (userHasInteracted && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, userHasInteracted]);

  useEffect(() => {
    // Load chat history when component mounts
    if (session?.user?.id) {
      // Restore conversation ID from session storage
      const savedConversationId = sessionStorage.getItem('chatConversationId');
      if (savedConversationId) {
        setConversationId(savedConversationId);
      }
      loadChatHistory();
    }
  }, [session?.user?.id]);

  // Save conversation ID to session storage whenever it changes
  useEffect(() => {
    if (conversationId) {
      sessionStorage.setItem('chatConversationId', conversationId);
    } else {
      sessionStorage.removeItem('chatConversationId');
    }
  }, [conversationId]);

  const loadChatHistory = async () => {
    if (!session?.user?.id) return;

    try {
      const userId = session.user.id || session.user.stravaId?.toString();
      if (!userId) return;

      const { history } = await apiClient.getChatHistory(userId, conversationId || undefined);
      setMessages(history);
      // Mark initial history as loaded AFTER setting messages
      setInitialHistoryLoaded(true);
    } catch (err) {
      console.error('Failed to load chat history:', err);
      // Still mark as loaded even if there's an error
      setInitialHistoryLoaded(true);
    }
  };

  const sendMessage = async () => {
    if (!session?.user || !currentMessage.trim()) return;

    const userId = session.user.id || session.user.stravaId?.toString();
    if (!userId) {
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Mark user as having interacted
    setUserHasInteracted(true);

    // Ensure initialHistoryLoaded is true when sending a message
    if (!initialHistoryLoaded) {
      setInitialHistoryLoaded(true);
    }

    // Add user message to chat immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');

    try {
      const response = await apiClient.chatWithAI({
        user_id: userId,
        query: currentMessage,
        ...(conversationId && { conversation_id: conversationId }),
      });

      // Store conversation ID if this is the first message
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setFollowUpQuestions(response.follow_up_questions);

      // Notify parent of relevant activities
      if (onActivitySelect && response.relevant_activities.length > 0) {
        onActivitySelect(response.relevant_activities);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Remove the user message if the request failed
      setMessages(prev => prev.slice(0, -1));
      setCurrentMessage(userMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpQuestion = async (question: string) => {
    if (!session?.user) return;

    const userId = session.user.id || session.user.stravaId?.toString();
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    // Mark user as having interacted
    setUserHasInteracted(true);

    // Ensure initialHistoryLoaded is true when asking follow-up questions
    if (!initialHistoryLoaded) {
      setInitialHistoryLoaded(true);
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Use main chat endpoint with conversation_id for proper context
      const response = await apiClient.chatWithAI({
        user_id: userId,
        query: question,
        ...(conversationId && { conversation_id: conversationId }),
      });

      // Store conversation ID if this is the first message
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setFollowUpQuestions(response.follow_up_questions);

      if (onActivitySelect && response.relevant_activities.length > 0) {
        onActivitySelect(response.relevant_activities);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process follow-up');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!session?.user?.id) return;

    try {
      const userId = session.user.id || session.user.stravaId?.toString();
      if (!userId) return;

      await apiClient.clearChatHistory(userId, conversationId || undefined);
      setMessages([]);
      setFollowUpQuestions([]);
      setError(null);
      setConversationId(null); // Reset conversation ID when clearing
      // Mark user as having interacted when clearing history
      setUserHasInteracted(true);
      // We've manually cleared history, so make sure auto-scroll works for new messages
      setInitialHistoryLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear history');
    }
  };

  const startNewChat = () => {
    // Clear current conversation context without clearing history
    setConversationId(null);
    setFollowUpQuestions([]);
    setError(null);
    // Mark user as having interacted
    setUserHasInteracted(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageContent = (content: string) => {
    // Convert markdown-style formatting to JSX
    return content
      .split('\n')
      .map((line, index) => {
        const trimmed = line.trim();
        
        // Headers (### Header)
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="font-semibold text-lg mt-4 mb-2 text-primary-600">
              {trimmed.substring(4)}
            </h3>
          );
        }
        
        // Bold text (**text**)
        const boldRegex = /\*\*(.*?)\*\*/g;
        if (boldRegex.test(trimmed)) {
          const parts = trimmed.split(boldRegex);
          return (
            <p key={index} className="mb-2">
              {parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="font-semibold text-accent-600">{part}</strong> : part
              )}
            </p>
          );
        }
        
        // Bullet points (• text)
        if (trimmed.startsWith('• ')) {
          return (
            <div key={index} className="flex items-start mb-1">
              <span className="text-secondary-500 mr-2">•</span>
              <span>{trimmed.substring(2)}</span>
            </div>
          );
        }
        
        // Special callouts
        if (trimmed.includes('🎯 **Goal:**') || trimmed.includes('🔥 **Hot Take:**') || 
            trimmed.includes('💡 **Pro Tip:**') || trimmed.includes('📈 **Progress:**')) {
          return (
            <div key={index} className="bg-gradient-to-r from-primary-50 to-secondary-50 p-3 rounded-lg my-3 border-l-4 border-primary-400">
              <p className="font-medium">{trimmed}</p>
            </div>
          );
        }
        
        // Regular paragraph
        if (trimmed) {
          return <p key={index} className="mb-2">{trimmed}</p>;
        }
        
        // Empty line
        return <br key={index} />;
      });
  };

  return (
    <Card className="flex flex-col h-[800px] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Chat with AI</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={startNewChat}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-md px-3 py-1.5"
          >
            ➕ New Chat
          </Button>
          <Button
            onClick={clearHistory}
            variant="ghost"
            size="sm"
            disabled={messages.length === 0}
            className="text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-md px-3 py-1.5"
          >
            🗑️ Clear Chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            <p className="text-xl mb-4">💬 Let's talk about your fitness</p>
            <p className="text-base mb-6">
              Ask me anything about your activities, training, or performance!
            </p>
            <div className="text-sm space-y-2 text-gray-500">
              <p>• "How was my running performance last month?"</p>
              <p>• "What's my longest ride this year?"</p>
              <p>• "Show me my most challenging activities"</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-lg shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                    : 'bg-gradient-to-r from-gray-50 to-white text-gray-800 border border-gray-200'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">
                  {formatMessageContent(message.content)}
                </div>
                {message.timestamp && (
                  <p className="text-xs opacity-70 mt-1">
                    {formatTimestamp(message.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-500"></div>
                <span className="text-sm text-gray-800">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Follow-up Questions */}
      {followUpQuestions.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Quick questions to explore:
          </p>
          <div className="flex flex-wrap gap-2">
            {followUpQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleFollowUpQuestion(question)}
                disabled={isLoading}
                className="px-3 py-2 text-xs bg-white hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 border border-primary-200 rounded-full transition-all duration-200 hover:border-primary-400 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border-t border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me about your fitness activities..."
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !currentMessage.trim()}
            loading={isLoading}
            variant="primary"
          >
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
}