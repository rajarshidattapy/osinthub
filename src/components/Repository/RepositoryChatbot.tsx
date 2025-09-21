import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { Repository, Commit, RepositoryFile } from '../../types';
import { useApiService } from '../../services/api';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RepositoryChatbotProps {
  repository: Repository;
  commits: Commit[];
  files: RepositoryFile[];
  isOpen: boolean;
  onToggle: () => void;
}

export const RepositoryChatbot: React.FC<RepositoryChatbotProps> = ({
  repository,
  commits,
  files,
  isOpen,
  onToggle
}) => {
  const { queryRepositoryChatbot, getToken } = useApiService();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hi! I'm your repository assistant for **${repository.name}**. I can help you understand the repository structure, commit history, files, and more. 

**You can ask me anything about this repository.**


What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      type: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputValue('');
    setIsLoading(true);
    setStreamingMessageId(assistantMessageId);

    try {
      await queryRepositoryChatbot(
        userMessage.content,
        {
          id: repository.id,
          name: repository.name,
          description: repository.description,
          owner: repository.owner.username,
          createdAt: repository.createdAt,
          updatedAt: repository.updatedAt
        },
        commits.slice(0, 50), // Limit to recent commits
        files.map(file => ({
          id: file.id,
          name: file.name,
          path: file.path,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          content: file.content // Send full content for better analysis
        })),
        getToken,
        (chunk: string) => {
          // Handle streaming chunks
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: msg.content + chunk }
              : msg
          ));
        }
      );
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: "I'm sorry, I'm having trouble processing your request right now. Please try again." }
          : msg
      ));
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown formatting for code blocks and inline code
    return content
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 p-3 rounded-lg overflow-x-auto my-2"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-gray-800 border border-gray-700 rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">Repository Assistant</h3>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'assistant' && (
                      <Bot className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User className="w-4 h-4 text-blue-200 mt-0.5 flex-shrink-0" />
                    )}
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(message.content)
                      }}
                    />
                    {streamingMessageId === message.id && (
                      <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse"></span>
                    )}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && !streamingMessageId && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <div className="text-xs text-gray-400 mb-2">Quick questions:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Show me the last 5 commits",
                  "What files are in this repo?",
                  "What's the repository structure?",
                  "Who are the contributors?"
                ].map((question) => (
                  <button
                    key={question}
                    onClick={() => setInputValue(question)}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this repository..."
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
