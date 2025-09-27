
import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder: string;
  isInputDisabled: boolean;
}

const ChatInput = ({ onSendMessage, isLoading, placeholder, isInputDisabled }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !isLoading && !isInputDisabled) {
      onSendMessage(input);
      setInput('');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-slate-700 text-slate-200 placeholder-slate-400 p-4 pr-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200 resize-none"
          rows={1}
          disabled={isLoading || isInputDisabled}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim() || isInputDisabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors duration-200 enabled:hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed bg-violet-500 text-white"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
