import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentChatId } from '../../../app/store/features/chat.slice'
import { useChat } from '../hooks/useChat'

// ===== Motion Configuration =====
// 👉 Reuse one small motion preset so message cards enter consistently.
const itemMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut' }
}

// ===== Icon Components =====
function BotIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5'>
      <path d='M9 4h6M12 4V2M7 9h10a2 2 0 0 1 2 2v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5a2 2 0 0 1 2-2Zm3 4h.01M14 13h.01M9 19v2M15 19v2M3 12H1M23 12h-2' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5'>
      <path d='M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 9a7 7 0 0 1 14 0' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5'>
      <path d='M12 5v14M5 12h14' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-4 w-4'>
      <path d='M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-4 w-4'>
      <path d='M9 9V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4M9 9H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4M9 9h8' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5'>
      <path d='m4 12 15-7-4 7 4 7-15-7Zm0 0h11' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5'>
      <path d='m8 12.5 6.7-6.7a3 3 0 1 1 4.3 4.2l-9 9a5 5 0 0 1-7.1-7.1l9-9' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5'>
      <path d='M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm0 0v4m-5-6a5 5 0 0 0 10 0' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5'>
      <path d='M16 8a3 3 0 1 0-2.8-4H13a3 3 0 0 0 .2 1L8.8 8.1a3 3 0 0 0-1.8-.6 3 3 0 1 0 1.8 5.4l4.5 3.1a3 3 0 1 0 .9-1.3l-4.6-3.2a3 3 0 0 0 0-1l4.6-3.2A3 3 0 0 0 16 8Z' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5'>
      <path d='M12 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z' fill='currentColor' />
    </svg>
  )
}

// ===== Formatting Helpers =====
// 👉 Sidebar timestamps are reduced to relative labels so history is easier to scan.
function formatRelativeTime(value) {
  if (!value) {
    return 'Just now'
  }

  const date = new Date(value)
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diffMinutes < 1) {
    return 'Just now'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }

  return date.toLocaleDateString()
}

// ===== Sidebar Component =====
// Renders one history item and highlights the chat that Redux marks as active.
function SidebarChatItem({ chatItem, isActive, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -1.5 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      type='button'
      className={`w-full rounded-[20px] border px-4 py-3 text-left transition duration-200 ${isActive
          ? 'border-teal-400/30 bg-[linear-gradient(135deg,rgba(45,212,191,0.15),rgba(15,23,42,0.9))] shadow-[0_20px_50px_-34px_rgba(45,212,191,0.85)]'
          : 'border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]'
        }`}
    >
      <p className='truncate text-sm font-semibold text-white'>{chatItem.title}</p>
      <div className='mt-2 flex items-center gap-1.5 text-xs text-slate-400'>
        <ClockIcon />
        <span>{formatRelativeTime(chatItem.lastUpdated)}</span>
      </div>
    </motion.button>
  )
}

// ===== Chat Message Rendering =====
// Only assistant messages expose actions, which keeps the user side visually cleaner.
function MessageActions({ message, copiedMessageId, onCopy }) {
  const isCopied = copiedMessageId === message.id

  if (message.role === 'user') {
    return null
  }

  return (
    <div className='mt-4 flex items-center gap-2'>
      <button
        type='button'
        onClick={() => onCopy(message)}
        className='inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-white/16 hover:bg-white/[0.05] hover:text-white'
      >
        <CopyIcon />
        <span>{isCopied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  )
}

// Renders one message bubble and switches layout/styles by role.
function ChatMessage({ message, copiedMessageId, onCopy }) {
  const isUser = message.role === 'user'

  return (
    <motion.article
      {...itemMotion}
      className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/10 text-teal-200'>
          <BotIcon />
        </div>
      )}

      <div className={`max-w-[88%] md:max-w-[78%] ${isUser ? 'order-first' : ''}`}>
        <div className={`mb-2 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{isUser ? 'You' : 'Nova Assistant'}</span>
        </div>

        <div
          className={`rounded-[28px] px-5 py-4 text-[15px] leading-7 shadow-[0_24px_60px_-34px_rgba(2,6,23,1)] md:px-6 md:py-5 ${isUser
              ? 'rounded-tr-md bg-[linear-gradient(135deg,#14b8a6,#0f766e)] text-white'
              : 'rounded-tl-md border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(9,12,24,0.98))] text-slate-100'
            }`}
        >
          {isUser ? (
            <p className='whitespace-pre-wrap'>{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className='mb-3 last:mb-0'>{children}</p>,
                ul: ({ children }) => <ul className='mb-3 list-disc space-y-1 pl-5 last:mb-0'>{children}</ul>,
                ol: ({ children }) => <ol className='mb-3 list-decimal space-y-1 pl-5 last:mb-0'>{children}</ol>,
                code: ({ children }) => <code className='rounded-lg bg-white/8 px-1.5 py-0.5 text-teal-200'>{children}</code>,
                pre: ({ children }) => <pre className='mb-3 overflow-x-auto rounded-2xl border border-white/8 bg-black/30 p-4 last:mb-0'>{children}</pre>,
                strong: ({ children }) => <strong className='font-semibold text-white'>{children}</strong>
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}

          <MessageActions message={message} copiedMessageId={copiedMessageId} onCopy={onCopy} />
        </div>
      </div>

      {isUser && (
        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-100'>
          <UserIcon />
        </div>
      )}
    </motion.article>
  )
}

// Keeps a stable assistant intro so the chat area never feels empty on first load.
function WelcomeCard() {
  return (
    <motion.article
      {...itemMotion}
      className='flex gap-4'
    >
      <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/10 text-teal-200'>
        <BotIcon />
      </div>
      <div className='max-w-[88%] md:max-w-[86%]'>
        <div className='mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500'>
          Nova Assistant
        </div>
        <div className='rounded-[28px] rounded-tl-md border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(9,12,24,0.98))] px-5 py-5 text-[15px] leading-7 text-slate-100 shadow-[0_24px_60px_-34px_rgba(2,6,23,1)] md:px-6'>
          Hello! I&apos;m your AI assistant. I can help you with coding, creative writing, research, analysis, and general problem solving. How can I assist you today?
        </div>
      </div>
    </motion.article>
  )
}

// Mirrors the loading state from Redux while the API is processing a request.
function LoadingMessage() {
  return (
    <motion.article
      {...itemMotion}
      className='flex gap-4'
    >
      <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/10 text-teal-200'>
        <BotIcon />
      </div>
      <div className='max-w-[88%] md:max-w-[70%]'>
        <div className='mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500'>
          Nova Assistant
        </div>
        <div className='rounded-[28px] rounded-tl-md border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(9,12,24,0.98))] px-5 py-5 text-slate-300 shadow-[0_24px_60px_-34px_rgba(2,6,23,1)]'>
          <div className='mb-3 flex items-center gap-2'>
            <span className='typing-dot h-2.5 w-2.5 rounded-full bg-teal-300 [animation-delay:0ms]' />
            <span className='typing-dot h-2.5 w-2.5 rounded-full bg-emerald-300 [animation-delay:150ms]' />
            <span className='typing-dot h-2.5 w-2.5 rounded-full bg-cyan-300 [animation-delay:300ms]' />
          </div>
          <p className='text-sm text-slate-400'>Thinking...</p>
        </div>
      </div>
    </motion.article>
  )
}

// ===== Composer Component =====
// Shared input UI so the footer stays simple and logic remains in the page component.
function Composer({ chatInput, onChange, onSubmit, disabled }) {
  return (
    <form onSubmit={onSubmit} className='w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,26,0.92),rgba(6,9,18,0.98))] px-4 py-3 shadow-[0_20px_60px_-20px_rgba(2,6,23,1)] backdrop-blur-xl'>
      <div className='flex items-center gap-3'>
        <button
          type='button'
          className='hidden h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white md:flex'
        >
          <PaperclipIcon />
        </button>

        <div className='flex flex-1 items-center rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 transition focus-within:border-teal-400/50'>
          <input
            type='text'
            value={chatInput}
            onChange={onChange}
            placeholder='Type your message...'
            className='w-full bg-transparent text-[15px] text-white outline-none placeholder:text-slate-400'
          />
        </div>

        <button
          type='button'
          className='hidden h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white md:flex'
        >
          <MicIcon />
        </button>

        <button
          type='submit'
          disabled={disabled}
          className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100'
        >
          <SendIcon />
        </button>
      </div>
    </form>
  )
}

// ===== Dashboard Page =====
// Orchestrates sidebar history, selected chat state, and message rendering.
const Dashboard = () => {
  const chat = useChat()
  const dispatch = useDispatch()
  const [chatInput, setChatInput] = useState('')
  const [copiedMessageId, setCopiedMessageId] = useState(null)
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)
  const isLoading = useSelector((state) => state.chat.isLoading)
  const error = useSelector((state) => state.chat.error)
  const messagesEndRef = useRef(null)

  // ===== API Data Handling =====
  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [])

  // Flow:
  // 1. Get chats from Redux
  // 2. Convert object -> array
  // 3. Sort newest first for sidebar rendering
  const sortedChats = useMemo(() => {
    return Object.values(chats).sort(
      (left, right) => new Date(right.lastUpdated || 0).getTime() - new Date(left.lastUpdated || 0).getTime()
    )
  }, [chats])

  const activeMessages = chats[currentChatId]?.messages || []
  const activeTitle = chats[currentChatId]?.title || 'Nova AI'

  // 👉 Scroll after message changes so the latest response stays visible above the composer.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [currentChatId, activeMessages.length, isLoading])

  const handleSubmitMessage = (event) => {
    event.preventDefault()

    const trimmedMessage = chatInput.trim()
    if (!trimmedMessage) {
      return
    }

    // User sends message -> API -> Redux update -> UI re-render
    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId })
    setChatInput('')
  }

  const handleOpenChat = (chatId) => {
    chat.handleOpenChat(chatId)
  }

  const handleNewChat = () => {
    // 👉 Resetting the active id lets the next send create a fresh conversation.
    dispatch(setCurrentChatId(null))
    setChatInput('')
  }

  const handleCopyMessage = async (message) => {
    try {
      // 👉 Copying from the rendered state avoids depending on DOM selection.
      await navigator.clipboard.writeText(message.content)
      setCopiedMessageId(message.id)
      window.setTimeout(() => setCopiedMessageId(null), 1500)
    } catch {
      setCopiedMessageId(null)
    }
  }

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
                  <div className="flex h-9 w-9 items-center justify-center 
        rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 
        text-white shadow-md shrink-0">
                    <BotIcon />
                  </div>

                  {/* Title */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="truncate text-lg font-semibold text-white">
                        {activeTitle}
                      </h1>
                      <span className="hidden md:inline text-xs text-slate-400">
                        GPT-4 Turbo
                      </span>
                    </div>
                  </div>

                </div>

                {/* ===== Right Section ===== */}
                <div className="flex items-center gap-1 text-slate-400">

                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center 
        rounded-xl transition hover:bg-white/10 hover:text-white"
                  >
                    <ShareIcon />
                  </button>

                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center 
        rounded-xl transition hover:bg-white/10 hover:text-white"
                  >
                    <DotsIcon />
                  </button>

                </div>

              </div>
            </header>

            {error && (
              <div className='mx-4 mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 md:mx-7'>
                {error}
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

                  {isLoading && <LoadingMessage />}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* ===== Fixed Input Box ===== */}
              <div className='border-t border-white/8 bg-[linear-gradient(180deg,rgba(8,17,26,0.88),rgba(8,17,26,0.98))] px-4 py-4 backdrop-blur-xl md:px-7 md:py-5'>
                <div className='mx-auto max-w-5xl'>
                  <Composer
                    chatInput={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    onSubmit={handleSubmitMessage}
                    disabled={!chatInput.trim()}
                  />
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}

export default Dashboard
