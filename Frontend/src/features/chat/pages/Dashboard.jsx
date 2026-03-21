import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentChatId } from '../../../app/store/features/chat.slice';
import { useChat } from '../hooks/useChat.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// Components
import { SidebarChatItem } from '../components/SidebarChatItem';
import { ChatMessage } from '../components/ChatMessage';
import { WelcomeCard } from '../components/WelcomeCard';
import { LoadingMessage } from '../components/LoadingMessage';
import { VoiceOverlay } from '../components/VoiceOverlay';
import { Composer } from '../components/Composer';

// Icons
import { BotIcon } from '../icons';

const Dashboard = () => {
  const chat = useChat();
  const dispatch = useDispatch();
  const [chatInput, setChatInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  
  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const chatError = useSelector((state) => state.chat.error);
  
  const { transcript, listening } = useSelector((state) => state.voice);
  const { stopListening, toggleListening } = useSpeechRecognition();
  
  const messagesEndRef = useRef(null);
  const prevListeningRef = useRef(listening);

  // Sync transcript to input field
  useEffect(() => {
    if (listening && transcript) {
      setChatInput(transcript);
    }
  }, [listening, transcript]);

  // AUTO-SUBMIT on Voice Finish
  useEffect(() => {
    if (prevListeningRef.current === true && listening === false) {
      const finalMessage = transcript.trim() || chatInput.trim();
      if (finalMessage) {
        chat.handleSendMessage({ message: finalMessage, chatId: currentChatId, file: selectedFile });
        setChatInput('');
        setSelectedFile(null);
        dispatch({ type: 'voice/setTranscript', payload: '' });
      }
    }
    prevListeningRef.current = listening;
  }, [listening, transcript, chatInput, selectedFile, currentChatId, chat, dispatch]);

  useEffect(() => {
    chat.initializeSocketConnection();
    chat.handleGetChats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sortedChats = useMemo(() => {
    return Object.values(chats).sort(
      (left, right) => new Date(right.lastUpdated || 0).getTime() - new Date(left.lastUpdated || 0).getTime()
    );
  }, [chats]);

  const activeMessages = chats[currentChatId]?.messages || [];
  const rawTitle = chats[currentChatId]?.title || 'New Conversation';
  const activeTitle = (() => {
    const words = rawTitle.trim().split(/\s+/);
    return words.length <= 5 ? rawTitle : words.slice(0, 5).join(' ') + '…';
  })();
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [currentChatId, activeMessages.length, isLoading]);

  const handleSubmitMessage = (event) => {
    if (event) event.preventDefault();
    let trimmedMessage = chatInput.trim();
    if (!trimmedMessage && selectedFile) trimmedMessage = "Summarize this file";
    if (!trimmedMessage && !selectedFile) return;

    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId, file: selectedFile });
    setChatInput('');
    setSelectedFile(null);
  };

  const handleOpenChat = useCallback((chatId) => chat.handleOpenChat(chatId), [chat]);
  
  const handleNewChat = useCallback(() => {
    dispatch(setCurrentChatId(null));
    setChatInput('');
  }, [dispatch]);

  const handleCopyMessage = useCallback(async (message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      window.setTimeout(() => setCopiedMessageId(null), 1500);
    } catch {
      setCopiedMessageId(null);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    setChatInput(e.target.value);
  }, []);

  const handleToggleListening = useCallback(() => {
    toggleListening();
  }, [toggleListening]);

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
  }, []);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return (
    <div className="flex h-screen w-full relative bg-background text-on-background overflow-hidden selection:bg-primary/30">
      {/* Radial Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* SideNavBar (Desktop) */}
      <aside className="hidden md:flex flex-col h-full w-64 bg-surface-low p-4 space-y-8 shadow-2xl shadow-black/40 z-40 border-r border-white/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 shrink-0 transition-transform hover:scale-105">
            <BotIcon />
          </div>
          <div>
            <h1 className="text-xl font-black text-primary tracking-tighter leading-none">Doraemon</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold mt-1">Intelligence v2.4</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1 overflow-y-auto hide-scrollbar">
          <button 
            onClick={handleNewChat}
            className="bg-surface-container-highest text-primary rounded-2xl px-4 py-3.5 flex items-center justify-center gap-3 transition-all hover:bg-surface-container-high active:scale-95 border border-white/5 shadow-lg group"
          >
            <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">add_circle</span>
            <span className="font-bold text-sm tracking-tight">New Chat</span>
          </button>

          <div className="mt-8 space-y-4">
            <div className="px-4 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent Activity</p>
              <div className="w-1.5 h-1.5 rounded-full bg-secondary ai-glow"></div>
            </div>
            
            <div className="space-y-1 custom-scrollbar overflow-y-auto pr-1 max-h-[40vh]">
              {sortedChats.map((chatItem) => (
                <SidebarChatItem
                  key={chatItem.id}
                  chatItem={chatItem}
                  isActive={chatItem.id === currentChatId}
                  onClick={() => handleOpenChat(chatItem.id)}
                />
              ))}
            </div>
          </div>
        </div>



        <div className="pt-2 border-t border-outline-variant/10 flex flex-col gap-1">
          <button className="text-slate-400 px-4 py-2.5 hover:bg-surface-container rounded-xl flex items-center gap-3 text-sm transition-all hover:text-on-surface">
            <span className="material-symbols-outlined text-lg">help</span> Help & Support
          </button>
          <button className="text-slate-400 px-4 py-2.5 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl flex items-center gap-3 text-sm transition-all">
            <span className="material-symbols-outlined text-lg">logout</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface relative">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-50 flex justify-between items-center px-8 py-3 bg-background/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="md:hidden p-2 rounded-xl bg-surface-container-highest flex items-center justify-center border border-white/5">
               <BotIcon size="sm" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-on-surface tracking-tight text-lg leading-tight">{activeTitle}</h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary ai-glow animate-pulse"></div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Doramon AI · Connected</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-surface-container-low rounded-full border border-white/5 shadow-inner">
               <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Latency: 24ms</span>
            </div>
            <div className="flex gap-1">
              <button className="p-2.5 rounded-xl text-slate-400 hover:text-primary hover:bg-surface-container-highest transition-all active:scale-90">
                <span className="material-symbols-outlined">share</span>
              </button>
              <button className="p-2.5 rounded-xl text-slate-400 hover:text-primary hover:bg-surface-container-highest transition-all active:scale-90">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <section className="flex-1 overflow-y-auto pt-28 pb-40 px-4 md:px-8 hide-scrollbar scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {activeMessages.length === 0 ? (
               <WelcomeCard />
            ) : (
              <div className="space-y-10 animate-message">
                {activeMessages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    copiedMessageId={copiedMessageId}
                    onCopy={handleCopyMessage}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </section>

        {/* Bottom Floating Input Shell */}
        <div className="fixed bottom-0 right-0 left-0 md:left-64 p-8 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto flex flex-col gap-4">
             {isLoading && <LoadingMessage />}
             <Composer
                chatInput={chatInput}
                showSuggestions={activeMessages.length === 0}
                isLoading={isLoading}
                onChange={handleInputChange}
                onSubmit={handleSubmitMessage}
                disabled={!chatInput.trim() && !selectedFile || isLoading}
                onMicClick={handleToggleListening}
                isListening={listening}
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onClearFile={handleClearFile}
              />
          </div>
        </div>

        <VoiceOverlay 
          listening={listening} 
          onStop={stopListening} 
          transcript={transcript} 
        />
      </main>
    </div>
  );
};

export default Dashboard;
