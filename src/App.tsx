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

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Ensure there is always an active conversation if one exists
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
    if (conversations.length === 0) {
        setActiveConversationId(null);
    }
  }, [conversations, activeConversationId, setActiveConversationId]);


  // Add usage limit message for guests
  useEffect(() => {
    if (isPermanentlyBlocked && activeConversation) {
        const hasLimitMessage = activeConversation.messages.some(m => m.id === 'limit-message');
        if (!hasLimitMessage) {
            const limitMessage: Message = {
                id: 'limit-message',
                role: Role.AI,
                text: uiStrings.limitReachedMessage,
                language,
            };
            setConversations(prevConvos => 
                prevConvos.map(c => 
                    c.id === activeConversationId ? {...c, messages: [...c.messages, limitMessage]} : c
                )
            );
        }
    }
  }, [isPermanentlyBlocked, activeConversation, language, setConversations, activeConversationId, uiStrings.limitReachedMessage]);
  
  const handleSendMessage = useCallback(async (text: string) => {
    if (!activeConversationId) return;

    const isGuestAndBlocked = !authenticatedUser && isPermanentlyBlocked;
    if (isGuestAndBlocked) return;
    
    if (!authenticatedUser && totalMessageCount >= FREE_MESSAGE_LIMIT) {
        setIsPermanentlyBlocked(true);
        return;
    }
    
    const userMessage: Message = { id: Date.now().toString(), role: Role.USER, text, language };
    
    // Optimistically update the UI with the user's message
    const updatedConversations = conversations.map(c => 
      c.id === activeConversationId ? { ...c, messages: [...c.messages, userMessage] } : c
    );
    setConversations(updatedConversations);
    setIsLoading(true);

    try {
        const currentConvo = updatedConversations.find(c => c.id === activeConversationId);
        if (!currentConvo) throw new Error("Active conversation not found.");

        const shouldGenerateName = currentConvo.messages.filter(m => m.role === Role.USER).length === 1;

        const response = await fetch('/api/sendMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authenticatedUser && { 'Authorization': 'Bearer FAKE_TOKEN' })
            },
            body: JSON.stringify({
                text: userMessage.text,
                language: userMessage.language,
                history: currentConvo.messages.slice(0, -1), // History *before* the new message
                generateName: shouldGenerateName,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }

        const { chatResponse, chatName } = await response.json();
        const aiMessage: Message = { id: (Date.now() + 1).toString(), role: Role.AI, text: chatResponse, language };
        
        // Final update with AI response and possibly a new name
        setConversations(prevConvos => prevConvos.map(c => {
            if (c.id === activeConversationId) {
                // Find the optimistic user message and replace the whole message array
                const optimisticMessages = c.messages.filter(m => m.id !== userMessage.id);
                return { 
                    ...c, 
                    name: chatName || c.name, 
                    messages: [...optimisticMessages, userMessage, aiMessage]
                };
            }
            return c;
        }));
        
        if (!authenticatedUser) {
            setTotalMessageCount(prevCount => prevCount + 2);
        }

    } catch (error) {
      console.error("Failed to get response:", error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: Role.AI, text: uiStrings.errorMessage, language };
      setConversations(prevConvos => prevConvos.map(c => {
          if (c.id === activeConversationId) {
            return { ...c, messages: [...c.messages, errorMessage] };
          }
          return c;
      }));
       if (!authenticatedUser) {
            setTotalMessageCount(prevCount => prevCount + 2);
        }
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, authenticatedUser, isPermanentlyBlocked, totalMessageCount, language, conversations, setConversations, setIsPermanentlyBlocked, setTotalMessageCount, uiStrings]);
  
  const handleNewChat = () => {
    if (!authenticatedUser && conversations.length >= GUEST_CHAT_LIMIT) {
        return; // Guest limit reached
    }
    const newConversation: Conversation = {
        id: Date.now().toString(),
        name: uiStrings.newChatButton,
        messages: []
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  }

  const handleDeleteChat = (idToDelete: string) => {
    const remainingConversations = conversations.filter(c => c.id !== idToDelete);
    setConversations(remainingConversations);
    if (activeConversationId === idToDelete) {
        setActiveConversationId(remainingConversations.length > 0 ? remainingConversations[0].id : null);
    }
  }

  const handleDeleteCurrentChat = () => {
    if (activeConversationId) {
      handleDeleteChat(activeConversationId);
    }
  };

  const handleLoginToggle = () => {
    setAuthenticatedUser(prevAuth => {
      const isLoggingIn = !prevAuth;
      if (isLoggingIn) {
        setConversations(prevConvos =>
          prevConvos.map(convo => ({
            ...convo,
            messages: convo.messages.filter(msg => msg.id !== 'limit-message')
          }))
        );
      }
      return isLoggingIn;
    });
  };
  
  const isGuestAndBlocked = !authenticatedUser && isPermanentlyBlocked;
  const isInputDisabled = isGuestAndBlocked || !activeConversation;
  const placeholder = isGuestAndBlocked ? uiStrings.limitReachedPlaceholder : uiStrings.chatPlaceholder;


  return (
    <div className="flex h-screen bg-[var(--bg-main-start)] font-sans">
      {/* Left Panel */}
      <div className="w-96 flex-shrink-0 bg-gradient-to-b from-[var(--bg-panel-start)] to-[var(--bg-panel-end)] p-6 flex flex-col shadow-2xl z-10 relative">
        <div className="flex-grow overflow-y-auto overflow-x-hidden">
          <TypingTitle text={uiStrings.title} />
          <p className="mt-2 text-sm text-slate-400">
            {uiStrings.slogan}
          </p>
          <LanguageSelector selectedLanguage={language} onLanguageChange={setLanguage} headerText={uiStrings.languageSelectorHeader} />
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelect={setActiveConversationId}
            onNew={handleNewChat}
            onDelete={handleDeleteChat}
            isGuest={!authenticatedUser}
            guestChatLimit={GUEST_CHAT_LIMIT}
            uiStrings={{ chatHistoryHeader: uiStrings.chatHistoryHeader, newChatButton: uiStrings.newChatButton }}
          />
        </div>
        <div className="mt-auto pt-4 flex-shrink-0">
          <button
            onClick={handleDeleteCurrentChat}
            disabled={!activeConversationId}
            className="w-full text-center px-4 py-2 rounded-lg transition-colors duration-200 bg-pink-700 hover:bg-pink-600 text-white font-semibold shadow-lg disabled:bg-slate-500 disabled:cursor-not-allowed"
          >
            {uiStrings.deleteChatButton}
          </button>
        </div>
        {/* Neon Separator */}
        <div className="absolute top-0 right-0 h-full w-px" style={{
            boxShadow: '0 0 2px #fff, 0 0 6px #a855f7, 0 0 12px #a855f7, 0 0 20px #38bdf8'
        }}></div>
      </div>

      {/* Right Panel */}
      <main className="flex-grow flex flex-col h-screen bg-gradient-to-br from-[var(--bg-main-start)] to-[var(--bg-main-end)] relative">
        <div className="flex-grow relative overflow-hidden">
          {!activeConversation ? (
            <>
              <div className="absolute inset-0 z-0">
                  <FloatingSymbols />
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8">
                <div className="mb-4">
                  <Logo />
                </div>
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">
                    {uiStrings.welcomeHeader}
                </h2>
                <p className="text-slate-400 mt-2">{uiStrings.welcomeMessage}</p>
              </div>
            </>
          ) : (
            <div ref={chatContainerRef} className="absolute inset-0 overflow-y-auto p-6">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
               {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl shadow-md bg-teal-900 text-slate-200 rounded-bl-none">
                      <div className="flex items-center space-x-2">
                         <span className="h-2 w-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                         <span className="h-2 w-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                         <span className="h-2 w-2 bg-violet-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-t-xl">
           <div className="flex justify-end mb-2">
               <button 
                  onClick={handleLoginToggle}
                  className="bg-sky-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 hover:bg-sky-600 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-400"
                >
                  {authenticatedUser ? uiStrings.logoutButton : uiStrings.loginButton}
                </button>
           </div>
           <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} placeholder={placeholder} isInputDisabled={isInputDisabled} />
        </div>
      </main>
    </div>
  );
};

export default App;
