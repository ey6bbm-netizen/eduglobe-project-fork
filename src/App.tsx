import './index.css';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, Message, Role, Conversation } from './types';
import { FREE_MESSAGE_LIMIT, UI_TEXT, GUEST_CHAT_LIMIT } from './constants';
import useLocalStorage from './hooks/useLocalStorage';

import TypingTitle from './components/TypingTitle';
import LanguageSelector from './components/LanguageSelector';
import Logo from './components/Logo';
import FloatingSymbols from './components/FloatingSymbols';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import ConversationList from './components/ConversationList';
import { sendMessageStream } from './lib/sendMessageStream';

const App = () => {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('conversations', []);
  const [activeConversationId, setActiveConversationId] = useLocalStorage<string | null>('activeConversationId', null);
  const [language, setLanguage] = useLocalStorage<Language>('language', Language.ENGLISH);
  const [isLoading, setIsLoading] = useState(false);
  const [totalMessageCount, setTotalMessageCount] = useLocalStorage<number>('totalMessageCount', 0);
  const [isPermanentlyBlocked, setIsPermanentlyBlocked] = useLocalStorage<boolean>('permanentBlock', false);
  const [authenticatedUser, setAuthenticatedUser] = useLocalStorage<boolean>('authenticatedUser', false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const uiStrings = UI_TEXT[language];

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
    if (conversations.length === 0) {
      setActiveConversationId(null);
    }
  }, [conversations, activeConversationId, setActiveConversationId]);

  useEffect(() => {
    if (isPermanentlyBlocked && activeConversation) {
      const hasLimitMessage = activeConversation.messages.some(m => m.id === 'limit-message');
      if (!hasLimitMessage) {
        const limitMessage: Message = {
          id: 'limit-message', role: Role.AI, text: uiStrings.limitReachedMessage, language,
        };
        setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages: [...c.messages, limitMessage] } : c));
      }
    }
  }, [isPermanentlyBlocked, activeConversation, language, setConversations, activeConversationId, uiStrings]);

  const handleSendMessage = useCallback((text: string) => {
    async function doSend() {
      if (!activeConversationId) return;
      const userMessage: Message = { id: Date.now().toString(), role: Role.USER, text, language };
      setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages: [...c.messages, userMessage] } : c));
      setIsLoading(true);

      try {
        const currentConvo = conversations.find(c => c.id === activeConversationId)!;
        const shouldGenerateName = currentConvo.messages.filter(m => m.role === Role.USER).length === 1;

        const aiMessage: Message = { id: (Date.now() + 1).toString(), role: Role.AI, text: '', language };
        setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages: [...c.messages, aiMessage] } : c));

        const payload = {
          text: userMessage.text,
          history: currentConvo.messages.slice(0, -1),
          language,
          generateName: shouldGenerateName,
        };

        const chatName = await sendMessageStream(
          payload,
          token => {
            setConversations(prev => prev.map(c => {
              if (c.id !== activeConversationId) return c;
              const msgs = [...c.messages];
              const last = msgs[msgs.length - 1];
              msgs[msgs.length - 1] = { ...last, text: last.text + token };
              return { ...c, messages: msgs };
            }));
          }
        );

        setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, name: chatName || c.name } : c));
        if (!authenticatedUser) setTotalMessageCount(cnt => cnt + 2);
      } catch (err) {
        console.error('Streaming error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    doSend();
  }, [activeConversationId, conversations, language, authenticatedUser, totalMessageCount, isPermanentlyBlocked, uiStrings, setConversations, setTotalMessageCount]);

  const handleNewChat = () => { /*...*/ };
  const handleDeleteChat = (id: string) => { /*...*/ };
  const handleDeleteCurrentChat = () => { /*...*/ };
  const handleLoginToggle = () => { /*...*/ };

  const isGuestAndBlocked = !authenticatedUser && isPermanentlyBlocked;
  const isInputDisabled = isGuestAndBlocked || !activeConversation;
  const placeholder = isGuestAndBlocked ? uiStrings.limitReachedPlaceholder : uiStrings.chatPlaceholder;

  return (
    <div className="flex h-screen ...">
      {/* UI JSX here */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} placeholder={placeholder} isInputDisabled={isInputDisabled} />
    </div>
  );
};

export default App;
