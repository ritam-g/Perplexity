import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentChatId } from "../../../app/store/features/chat.slice";
import { useChat } from "../hooks/useChat";

function MarkdownMessage({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="mb-3 text-xl font-bold">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-3 text-lg font-bold">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-2 text-base font-semibold">{children}</h3>,
        p: ({ children }) => <p className="mb-3 last:mb-0 whitespace-pre-wrap">{children}</p>,
        ul: ({ children }) => <ul className="mb-3 list-disc pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="mb-3 list-decimal pl-5">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-cyan-300 underline underline-offset-2"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-3 border-l-2 border-slate-500 pl-4 italic text-slate-300">
            {children}
          </blockquote>
        ),
        pre: ({ children }) => (
          <pre className="mb-3 overflow-x-auto rounded-2xl bg-slate-950/90 p-4 text-xs">
            {children}
          </pre>
        ),
        code: ({ inline, children }) =>
          inline ? (
            <code className="rounded bg-slate-950/80 px-1.5 py-0.5 text-xs text-cyan-200">
              {children}
            </code>
          ) : (
            <code className="text-slate-100">{children}</code>
          ),
        hr: () => <hr className="my-4 border-slate-700" />,
      }}
    >
      {content || ""}
    </ReactMarkdown>
  );
}

function Dashboard() {
  const dispatch = useDispatch();
  const { handelSendMessage } = useChat();
  const { chats, currentChatId, isLoading, error } = useSelector(
    (state) => state.chat
  );
  const { user } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");

  // Convert chats object into an array for rendering.
  // We sort by lastUpdated so the latest active chat appears first.
  const chatList = Object.values(chats || {}).sort((a, b) => {
    return new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0);
  });

  // If a chat is selected, show it.
  // Otherwise show the latest chat as default.
  const activeChat = chats?.[currentChatId] || chatList[0] || null;
  const selectedChatId = currentChatId || activeChat?.id;

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Pass the current chat id for follow-up messages.
    // If there is no active chat yet, backend will create a new one.
    await handelSendMessage({
      message: trimmedMessage,
      chatId: activeChat?.id || null,
    });

    // Clear input after send for better UX.
    setMessage("");
  }

  return (
    <section className="chat-dashboard min-h-screen bg-slate-950 px-4 py-6 text-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
              Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-bold">
              {user?.username ? `${user.username}'s Chat` : "Simple Chat"}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => dispatch(setCurrentChatId(null))}
            className="mb-4 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            New Chat
          </button>

          <div className="dashboard-scrollbar max-h-[70vh] space-y-2 overflow-y-auto pr-1">
            {chatList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
                No chats yet. Send your first message.
              </div>
            ) : (
              chatList.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => dispatch(setCurrentChatId(chat.id))}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    selectedChatId === chat.id
                      ? "border-cyan-400 bg-slate-800"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-600"
                  }`}
                >
                  <p className="truncate font-semibold">
                    {chat.title || "New Chat"}
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-400">
                    {chat.messages?.[chat.messages.length - 1]?.content ||
                      "No messages"}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="flex min-h-[75vh] flex-col rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-xl font-semibold">
              {activeChat?.title || "Start a new chat"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Send a message and the reply will appear here.
            </p>
          </div>

          <div className="dashboard-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {error ? (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {!activeChat?.messages?.length ? (
              <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center text-slate-400">
                Type a message below to create a chat.
              </div>
            ) : (
              activeChat.messages.map((item, index) => (
                <div
                  key={item._id || `${item.role}-${index}`}
                  className={`message-enter flex ${
                    item.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-7 shadow-lg ${
                      item.role === "user"
                        ? "bg-cyan-500 text-slate-950"
                        : "chat-display bg-slate-800 text-slate-100"
                    }`}
                  >
                    {item.role === "ai" ? (
                      <MarkdownMessage content={item.content} />
                    ) : (
                      item.content
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-3xl bg-slate-800 px-4 py-3">
                  <span className="typing-dot h-2 w-2 rounded-full bg-cyan-400" />
                  <span
                    className="typing-dot h-2 w-2 rounded-full bg-cyan-400"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="typing-dot h-2 w-2 rounded-full bg-cyan-400"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-800 p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask anything..."
                rows={3}
                className="min-h-[88px] flex-1 resize-none rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </section>
  );
}

export default Dashboard;
