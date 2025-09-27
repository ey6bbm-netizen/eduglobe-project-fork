import React from 'react';
import { Conversation } from '../types';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isGuest: boolean;
  guestChatLimit: number;
  uiStrings: {
    chatHistoryHeader: string;
    newChatButton: string;
  };
}

const ConversationList = ({
  conversations,
  activeConversationId,
  onSelect,
  onNew,
  onDelete,
  isGuest,
  guestChatLimit,
  uiStrings,
}: ConversationListProps) => {
  const canCreateNewChat = !isGuest || conversations.length < guestChatLimit;

  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
        {uiStrings.chatHistoryHeader}
      </h3>
      <div className="flex flex-col space-y-2">
        <button
          onClick={onNew}
          disabled={!canCreateNewChat}
          className="w-full text-center px-4 py-2 rounded-lg transition-all duration-300 bg-violet-500 text-white font-semibold shadow-lg hover:bg-violet-600 disabled:bg-slate-500 disabled:cursor-not-allowed"
        >
          {uiStrings.newChatButton}
        </button>
        <div className="flex flex-col-reverse">
          {conversations.map((convo) => (
            <div key={convo.id} className="relative group mt-2">
              <button
                onClick={() => onSelect(convo.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-violet-400 truncate ${
                  activeConversationId === convo.id
                    ? 'bg-slate-600/80 text-white font-semibold border border-slate-500'
                    : 'bg-slate-700/60 hover:bg-slate-600/80 text-slate-300 border border-transparent'
                }`}
              >
                {convo.name}
              </button>
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(convo.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:bg-slate-500/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
