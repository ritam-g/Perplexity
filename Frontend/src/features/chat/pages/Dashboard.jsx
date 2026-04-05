import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { setCurrentChatId } from '../../../app/store/features/chat.slice';
import { useChat } from '../hooks/useChat.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { setTranscript } from '../../../app/store/features/voice.slice.js';
import { useAuth } from '../../auth/hook/useAuth';
import { UserDropdown } from '../../profile/components/UserDropdown';

// Components
import { SidebarChatItem } from '../components/SidebarChatItem';
import { ChatMessage } from '../components/ChatMessage';
import { WelcomeCard } from '../components/WelcomeCard';
import { VoiceOverlay } from '../components/VoiceOverlay';
import { Composer } from '../components/Composer';

// Icons
import { BotIcon } from '../icons';

const AUTO_SCROLL_THRESHOLD = 56;

const Dashboard = () => {
  const chat = useChat();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const [chatInput, setChatInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const chatError = useSelector((state) => state.chat.error);
  const user = useSelector((state) => state.auth.user);

  const { transcript, listening } = useSelector((state) => state.voice);
  const { stopListening, toggleListening } = useSpeechRecognition();

  const chatScrollRef = useRef(null);
  const prevListeningRef = useRef(listening);
  const scrollFrameRef = useRef(null);
  const isAutoScrollRef = useRef(true);
  const lastKnownScrollTopRef = useRef(0);
  const messageCountRef = useRef(0);
  const touchStartYRef = useRef(null);

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
        dispatch(setTranscript(''));
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

  const activeMessages = useMemo(() => chats[currentChatId]?.messages || [], [chats, currentChatId]);
  const hasMessages = activeMessages.length > 0;
  const rawTitle = chats[currentChatId]?.title || 'New Conversation';
  const activeTitle = useMemo(() => {
    const words = rawTitle.trim().split(/\s+/);
    return words.length <= 5 ? rawTitle : `${words.slice(0, 5).join(' ')}...`;
  }, [rawTitle]);

  // Keep the latest count in a ref so the scroll listener can stay stable
  // while streamed tokens update the Redux state.
  useEffect(() => {
    messageCountRef.current = activeMessages.length;
  }, [activeMessages.length]);

  const isAtBottom = useCallback((container) => {
    if (!container) return true;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    return distanceFromBottom < AUTO_SCROLL_THRESHOLD;
  }, []);

  const handleManualScrollIntent = useCallback(() => {
    if (scrollFrameRef.current) {
      window.cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }

    isAutoScrollRef.current = false;
    setShowJumpToLatest(messageCountRef.current > 0);
  }, []);

  const syncScrollState = useCallback(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    const currentScrollTop = container.scrollTop;
    const userScrolledUp = currentScrollTop < lastKnownScrollTopRef.current;
    lastKnownScrollTopRef.current = currentScrollTop;

    if (userScrolledUp) {
      if (scrollFrameRef.current) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }

      isAutoScrollRef.current = false;
      setShowJumpToLatest(messageCountRef.current > 0);
      return;
    }

    const shouldAutoScroll = isAtBottom(container);

    if (shouldAutoScroll) {
      isAutoScrollRef.current = true;
      setShowJumpToLatest(false);
      return;
    }

    setShowJumpToLatest(!isAutoScrollRef.current && messageCountRef.current > 0);
  }, [isAtBottom]);

  const scrollToBottom = useCallback((behavior = 'auto') => {
    const container = chatScrollRef.current;
    if (!container) return;

    if (scrollFrameRef.current) {
      window.cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      const nextContainer = chatScrollRef.current;
      if (!nextContainer) return;

      if (behavior === 'smooth') {
        nextContainer.scrollTo({
          top: nextContainer.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        nextContainer.scrollTop = nextContainer.scrollHeight;
      }

      lastKnownScrollTopRef.current = nextContainer.scrollTop;
      isAutoScrollRef.current = true;
      setShowJumpToLatest(false);
      scrollFrameRef.current = null;
    });
  }, []);

  const lastMessageSignature = useMemo(() => {
    const lastMessage = activeMessages[activeMessages.length - 1];

    if (!lastMessage) {
      return `${currentChatId || 'empty'}:0`;
    }

    return [
      currentChatId || 'draft',
      activeMessages.length,
      lastMessage.id,
      lastMessage.content.length,
      lastMessage.isLoading ? 'loading' : 'ready',
    ].join(':');
  }, [activeMessages, currentChatId]);

  // Step 1: Track whether the reader is still near the bottom before
  // auto-scrolling again.
  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return undefined;

    syncScrollState();

    const handleScroll = () => {
      syncScrollState();
    };
    const handleWheel = (event) => {
      if (event.deltaY < 0) {
        handleManualScrollIntent();
      }
    };
    const handleTouchStart = (event) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };
    const handleTouchMove = (event) => {
      const nextY = event.touches[0]?.clientY ?? null;

      if (touchStartYRef.current !== null && nextY !== null && nextY > touchStartYRef.current) {
        handleManualScrollIntent();
      }

      touchStartYRef.current = nextY;
    };
    const handleTouchEnd = () => {
      touchStartYRef.current = null;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentChatId, handleManualScrollIntent, syncScrollState]);

  // Step 2: New conversations should open at the latest message instead of
  // carrying over the previous scroll lock.
  useEffect(() => {
    isAutoScrollRef.current = true;
    setShowJumpToLatest(false);
    scrollToBottom();
  }, [currentChatId, scrollToBottom]);

  // Step 3: Streamed tokens only move the viewport when the user is following
  // the latest response. Otherwise we preserve their manual scroll position.
  useEffect(() => {
    if (!hasMessages) return;
    if (isAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [hasMessages, lastMessageSignature, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, []);

  const handleSubmitMessage = (event) => {
    if (event) event.preventDefault();
    let trimmedMessage = chatInput.trim();
    if (!trimmedMessage && selectedFile) trimmedMessage = 'Summarize this file';
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

  const handleOpenProfile = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const handleOpenSettings = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const handleLogoutAction = useCallback(async () => {
    await handleLogout();
    navigate('/login');
  }, [handleLogout, navigate]);

  const handleCopyMessage = useCallback(async (message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      window.setTimeout(() => setCopiedMessageId(null), 1500);
    } catch {
      setCopiedMessageId(null);
    }
  }, []);

  const handleInputChange = useCallback((event) => {
    setChatInput(event.target.value);
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

  const handleJumpToLatest = useCallback(() => {
    scrollToBottom('smooth');
  }, [scrollToBottom]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background text-on-background selection:bg-primary/30">
      {/* Radial Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      {/* SideNavBar (Desktop) */}
      <aside className="z-40 hidden h-full w-64 flex-col space-y-8 border-r border-white/5 bg-surface-low p-4 shadow-2xl shadow-black/40 md:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 shrink-0 transition-transform duration-200 ease-out hover:scale-105">
            <BotIcon />
          </div>
          <div>
            <h1 className="leading-none tracking-tighter text-primary text-xl font-black">Doraemon</h1>
            <p className="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Intelligence v2.4</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto hide-scrollbar">
          <button
            onClick={handleNewChat}
            className="group flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-surface-container-highest px-4 py-3.5 text-primary shadow-lg transition-all duration-200 ease-out transform-gpu will-change-transform hover:scale-[1.02] hover:bg-surface-container-high hover:shadow-[0_18px_45px_rgba(4,10,24,0.2)] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-xl transition-transform duration-300 group-hover:rotate-90">add_circle</span>
            <span className="text-sm font-bold tracking-tight">New Chat</span>
          </button>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recent Activity</p>
              <div className="h-1.5 w-1.5 rounded-full bg-secondary ai-glow" />
            </div>

            <div className="custom-scrollbar max-h-[40vh] space-y-1 overflow-y-auto pr-1">
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

        <div className="space-y-3 border-t border-outline-variant/10 pt-3">
          <button
            type="button"
            onClick={handleOpenProfile}
            className="w-full rounded-2xl border border-white/5 bg-surface-container-low px-4 py-3 text-left text-sm font-semibold text-slate-300 transition-all duration-200 ease-out transform-gpu will-change-transform hover:scale-[1.01] hover:border-primary/20 hover:bg-surface-container-high hover:text-primary active:scale-[0.99]"
          >
            <span className="inline-flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">manage_accounts</span>
              Profile Settings
            </span>
          </button>

          <UserDropdown
            user={user}
            onProfile={handleOpenProfile}
            onSettings={handleOpenSettings}
            onLogout={handleLogoutAction}
          />
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="relative flex min-w-0 flex-1 flex-col bg-surface">
        {/* TopAppBar */}
        <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-background/80 px-8 py-3 backdrop-blur-xl md:left-64">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-xl border border-white/5 bg-surface-container-highest p-2 transition-all duration-200 ease-out md:hidden">
              <BotIcon size="sm" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold leading-tight tracking-tight text-on-surface">{activeTitle}</h2>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-secondary ai-glow animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Doraemon AI / Connected</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-3 rounded-full border border-white/5 bg-surface-container-low px-4 py-2 shadow-inner sm:flex">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Latency: 24ms</span>
            </div>
            <button
              type="button"
              className="rounded-xl p-2.5 text-slate-400 transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-105 hover:bg-surface-container-highest hover:text-primary active:scale-95"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <UserDropdown
              compact
              user={user}
              onProfile={handleOpenProfile}
              onSettings={handleOpenSettings}
              onLogout={handleLogoutAction}
            />
          </div>
        </header>

        {/* Chat Container */}
        <section
          ref={chatScrollRef}
          className="chat-scroll-shell stable-scroll-surface flex-1 overflow-y-auto px-4 pb-40 pt-28 hide-scrollbar md:px-8"
        >
          <div className="mx-auto max-w-4xl">
            {!hasMessages ? (
              <WelcomeCard />
            ) : (
              <div className="chat-scroll-content space-y-10 animate-message">
                {activeMessages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    copiedMessageId={copiedMessageId}
                    onCopy={handleCopyMessage}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {showJumpToLatest && hasMessages && (
          <div className="pointer-events-none fixed bottom-36 left-0 right-0 z-40 flex justify-center px-4 md:left-64">
            <button
              type="button"
              onClick={handleJumpToLatest}
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface-container-high/95 px-4 py-2 text-sm font-semibold text-primary shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-200 ease-out transform-gpu will-change-transform hover:scale-105 hover:border-primary/40 hover:bg-surface-container-highest active:scale-95"
            >
              <span className="material-symbols-outlined text-base">south</span>
              New messages
            </button>
          </div>
        )}

        {/* Bottom Floating Input Shell */}
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent p-8 md:left-64">
          <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-4">
            {chatError && (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 shadow-lg">
                {chatError}
              </div>
            )}
            <Composer
              chatInput={chatInput}
              showSuggestions={activeMessages.length === 0}
              isLoading={isLoading}
              onChange={handleInputChange}
              onSubmit={handleSubmitMessage}
              disabled={(!chatInput.trim() && !selectedFile) || isLoading}
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
