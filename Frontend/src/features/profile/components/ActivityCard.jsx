import React from 'react';

const iconThemes = {
  chat: 'bg-cyan-400/10 text-cyan-300',
  security: 'bg-violet-400/10 text-violet-300',
  billing: 'bg-amber-400/10 text-amber-300',
  profile: 'bg-emerald-400/10 text-emerald-300',
};

export function ActivityCard({ activities }) {
  return (
    <section className="activity-card rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(4,10,24,0.28)] backdrop-blur-xl sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            <span className="material-symbols-outlined text-[18px]">insights</span>
            Recent Activity
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white">Workspace Timeline</h2>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="rounded-[1.5rem] border border-white/6 bg-black/15 p-4 transition-all duration-200 ease-out transform-gpu will-change-transform hover:scale-[1.01] hover:border-white/10 hover:bg-black/25 hover:shadow-[0_18px_40px_rgba(4,10,24,0.16)]"
          >
            <div className="flex items-start gap-4">
              <div
                className={`mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconThemes[activity.tone] || iconThemes.profile}`}
              >
                <span className="material-symbols-outlined text-[20px]">{activity.icon}</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-white">{activity.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">{activity.description}</p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-white/8 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-300 transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-[1.01] hover:border-primary/25 hover:bg-primary/10 hover:text-primary active:scale-[0.99]"
      >
        View All Activity
      </button>
    </section>
  );
}
