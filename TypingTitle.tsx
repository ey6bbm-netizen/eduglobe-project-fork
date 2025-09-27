import React, { useState, useEffect } from 'react';

interface TypingTitleProps {
  text: string;
}

const TypingTitle = ({ text }: TypingTitleProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  // Effect for the typing animation
  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');

    const typingInterval = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length < text.length) {
          return text.substring(0, prev.length + 1);
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          return text;
        }
      });
    }, 150);

    return () => clearInterval(typingInterval);
  }, [text]);

  // Effect for the blinking cursor
  useEffect(() => {
    // Reset cursor to be visible when typing starts
    setShowCursor(true);
    if (!isTyping) {
      // Start blinking when typing is finished
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 500);
      return () => clearInterval(cursorInterval);
    }
  }, [isTyping]);

  return (
    <h1 className="text-4xl font-bold text-white tracking-wider flex items-center h-12">
      {displayedText}
      <span 
        style={{ opacity: showCursor ? 1 : 0 }} 
        className="w-1 h-9 bg-white ml-2 transition-opacity duration-100 ease-in-out"
      ></span>
    </h1>
  );
};

export default TypingTitle;