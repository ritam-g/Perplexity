import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { PlusIcon, UserIcon, BotIcon, ShareIcon, DotsIcon } from '../icons';

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
  
  const { transcript, listening, error: voiceError } = useSelector((state) => state.voice);
  const { startListening, stopListening, toggleListening } = useSpeechRecognition();
  
  const messagesEndRef = useRef(null);
  const prevListeningRef = useRef(listening);

  // Sync transcript to input field only when listening
  useEffect(() => {
    if (listening && transcript) {
      setChatInput(transcript);
    }
  }, [listening, transcript]);

  // AUTO-SUBMIT on Voice Finish
  useEffect(() => {
    if (prevListeningRef.current === true && listening === false) {
      const finalMessage = transcript.trim() || chatInput.trim() || (selectedFile ? "Summarize this file" : "");
      if (finalMessage) {
        chat.handleSendMessage({ message: finalMessage, chatId: currentChatId, file: selectedFile });
        setChatInput('');
        setSelectedFile(null);
        // Let Redux know we consumed this transcript
        dispatch({ type: 'voice/setTranscript', payload: '' });
      }
    }
    prevListeningRef.current = listening;
  }, [listening, transcript, chatInput, selectedFile, currentChatId, chat, dispatch]);

  // ===== API Data Handling =====
  useEffect(() => {
    chat.initializeSocketConnection();
    chat.handleGetChats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Flow:
  // 1. Get chats from Redux
  // 2. Convert object -> array
  // 3. Sort newest first for sidebar rendering
  const sortedChats = useMemo(() => {
    return Object.values(chats).sort(
      (left, right) => new Date(right.lastUpdated || 0).getTime() - new Date(left.lastUpdated || 0).getTime()
    );
  }, [chats]);

  const activeMessages = chats[currentChatId]?.messages || [];
  const rawTitle = chats[currentChatId]?.title || 'Doraemon';
  const activeTitle = (() => {
    const words = rawTitle.trim().split(/\s+/);
    return words.length <= 5 ? rawTitle : words.slice(0, 5).join(' ') + '…';
  })();

  // 👉 Scroll after message changes so the latest response stays visible above the composer.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [currentChatId, activeMessages.length, isLoading]);

  const handleSubmitMessage = (event) => {
    if (event) event.preventDefault();

    let trimmedMessage = chatInput.trim();
    
    // Auto-ask to summarize if a file is present but no message is typed.
    if (!trimmedMessage && selectedFile) {
        trimmedMessage = "Summarize this file";
    }

    if (!trimmedMessage && !selectedFile) {
      return;
    }

    // User sends message -> API -> Redux update -> UI re-render
    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId, file: selectedFile });
    setChatInput('');
    setSelectedFile(null);
  };

  const handleOpenChat = (chatId) => {
    chat.handleOpenChat(chatId);
  };

  const handleNewChat = () => {
    // 👉 Resetting the active id lets the next send create a fresh conversation.
    dispatch(setCurrentChatId(null));
    setChatInput('');
  };

  const handleCopyMessage = async (message) => {
    try {
      // 👉 Copying from the rendered state avoids depending on DOM selection.
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      window.setTimeout(() => setCopiedMessageId(null), 1500);
    } catch {
      setCopiedMessageId(null);
    }
  };

  return (
    // ===== Main Layout Container (Full Height) =====
    <main className='chat-dashboard h-screen overflow-hidden bg-[#09111a] text-slate-100'>
      <div className='mx-auto h-full max-w-[1680px] p-3 md:p-5'>
        <section className='grid h-full gap-4 lg:grid-cols-[320px_minmax(0,1fr)]'>
          {/* ===== Sidebar Component ===== */}
          <aside className='relative h-full overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(9,17,26,0.98),rgba(6,12,19,0.98))] shadow-[0_30px_100px_-44px_rgba(2,6,23,1)]'>
            <div className='flex h-full flex-col p-4 md:p-5'>
              <button
                type='button'
                onClick={handleNewChat}
                className='inline-flex w-full items-center justify-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 text-base font-semibold text-white transition hover:border-teal-400/22 hover:bg-white/[0.05]'
              >
                <PlusIcon />
                <span>New Chat</span>
              </button>

              <div className='mt-9 flex items-center justify-between'>
                <p className='text-xs font-semibold uppercase tracking-[0.28em] text-slate-500'>Recent Chats</p>
                <span className='rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400'>
                  {sortedChats.length}
                </span>
              </div>

              <div className='dashboard-scrollbar mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1'>
                {sortedChats.length ? (
                  sortedChats.map((chatItem) => (
                    <SidebarChatItem
                      key={chatItem.id}
                      chatItem={chatItem}
                      isActive={chatItem.id === currentChatId}
                      // 👉 Clicking history hydrates full messages through the existing API flow.
                      onClick={() => handleOpenChat(chatItem.id)}
                    />
                  ))
                ) : (
                  <div className='rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm leading-6 text-slate-400'>
                    No previous chats yet. Send your first message to start a new thread.
                  </div>
                )}
              </div>

              <div className='mt-5 border-t border-white/8 pt-5'>
                <button
                  type='button'
                  className='flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left text-slate-300 transition hover:bg-white/[0.04] hover:text-white'
                >
                  <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-300'>
                    <UserIcon />
                  </div>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold text-white'>Workspace</p>
                    <p className='text-xs uppercase tracking-[0.22em] text-teal-300'>Premium Plan</p>
                  </div>
                </button>
              </div>
            </div>
          </aside>

          {/* ===== Main Chat Area ===== */}
          <section className='relative flex h-full min-w-0 min-h-0 flex-col overflow-hidden rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.08),transparent_26%),linear-gradient(180deg,rgba(10,17,28,0.98),rgba(7,12,21,0.98))] shadow-[0_30px_100px_-44px_rgba(2,6,23,1)]'>
            {/* ===== Top Bar ===== */}
            <header className="border-b border-white/10 px-4 py-3 md:px-6">
              <div className="flex items-center justify-between">

                {/* ===== Left Section ===== */}
                <div className="flex items-center gap-3 min-w-0">

                  {/* Bot Icon */}
                  <div className="shrink-0">
                    <BotIcon size='lg' />
                  </div>

                  {/* Title */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="truncate text-lg font-semibold text-white">
                        {activeTitle}
                      </h1>
                      <span className="hidden md:inline text-xs text-slate-400">
                        Doraemon AI · Friends Forever
                      </span>
                    </div>
                  </div>

                </div>

                {/* ===== Right Section ===== */}
                <div className="flex items-center gap-1 text-slate-400">

                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-white/10 hover:text-white"
                  >
                    <ShareIcon />
                  </button>

                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-white/10 hover:text-white"
                  >
                    <DotsIcon />
                  </button>

                </div>

              </div>
            </header>

            {chatError && (
              <div className='mx-4 mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 md:mx-7'>
                {chatError}
              </div>
            )}

            {voiceError && (
              <div className='mx-4 mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 md:mx-7'>
                Voice Error: {voiceError}
              </div>
            )}

            <div className='flex min-h-0 flex-1 flex-col'>
              {/* ===== Scrollable Messages Section ===== */}
              <div className='dashboard-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-7 md:py-7'>
                <div className='mx-auto flex w-full max-w-5xl flex-col gap-7'>
                  <WelcomeCard />

                  {activeMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      copiedMessageId={copiedMessageId}
                      onCopy={handleCopyMessage}
                    />
                  ))}

                  {isLoading && activeMessages.length === 0 && <LoadingMessage />}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className='border-t border-white/8 bg-[linear-gradient(180deg,rgba(8,17,26,0.88),rgba(8,17,26,0.98))] px-4 py-4 backdrop-blur-xl md:px-7 md:py-5'>
                <div className='mx-auto max-w-5xl'>
                  <Composer
                    chatInput={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    onSubmit={handleSubmitMessage}
                    disabled={!chatInput.trim() && !selectedFile}
                    onMicClick={() => toggleListening(listening)}
                    isListening={listening}
                    onFileSelect={setSelectedFile}
                    selectedFile={selectedFile}
                    onClearFile={() => setSelectedFile(null)}
                  />
                </div>
              </div>
              
              <VoiceOverlay 
                listening={listening} 
                onStop={stopListening} 
                transcript={transcript} 
              />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
