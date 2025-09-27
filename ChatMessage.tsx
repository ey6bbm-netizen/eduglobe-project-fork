import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { Message, Role } from '../types';

declare global {
  interface Window {
    MathJax: {
      typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
    };
  }
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === Role.USER;
  const contentRef = useRef<HTMLDivElement>(null);

  const createMarkup = (text: string) => {
    const rawMarkup = marked(text);
    return { __html: rawMarkup };
  };

  useEffect(() => {
  if (contentRef.current && window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
    window.MathJax.typesetPromise([contentRef.current]).catch((err) =>
      console.error("MathJax rendering error:", err)
    );
   }
 }, [message.text]);


  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div 
        ref={contentRef}
        className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl shadow-md ${isUser ? 'bg-violet-600 text-white rounded-br-none' : 'bg-teal-900 text-slate-200 rounded-bl-none'}`}
      >
        <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={createMarkup(message.text)} />
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatMessage;
