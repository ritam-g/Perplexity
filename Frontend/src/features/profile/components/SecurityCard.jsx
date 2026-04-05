import React from 'react';

export function SecurityCard({
  securityForm,
  onChange,
  onSave,
  onLogoutEverywhere,
  isSaving,
  statusMessage,
  errorMessage,
}) {
  const canSubmit =
    securityForm.currentPassword.trim() &&
    securityForm.newPassword.trim() &&
    securityForm.confirmPassword.trim();

  return (
    <section className="security-section rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(4,10,24,0.28)] backdrop-blur-xl sm:p-8">
      <div>
        <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
          <span className="material-symbols-outlined text-[18px]">shield_lock</span>
          Security & Access
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-white">Security Protocol</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Rotate credentials, keep your workspace access protected, and force a fresh sign-in across connected sessions.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <label className="profile-field flex flex-col gap-3 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
            Current Password
          </span>
          <input
            name="currentPassword"
            type="password"
            value={securityForm.currentPassword}
            onChange={onChange}
            placeholder="Enter your current password"
            className="profile-input h-16 rounded-[1.5rem] border border-white/8 bg-[#0b101a] px-5 text-base text-white outline-none transition-all duration-200 ease-out placeholder:text-slate-600 hover:border-white/12 focus:border-primary/35 focus:bg-[#0d1420] focus:ring-2 focus:ring-primary/15 focus:shadow-[0_18px_45px_rgba(34,211,238,0.12)]"
          />
        </label>

        <label className="profile-field flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
            New Password
          </span>
          <input
            name="newPassword"
            type="password"
            value={securityForm.newPassword}
            onChange={onChange}
            placeholder="Create a stronger password"
            className="profile-input h-16 rounded-[1.5rem] border border-white/8 bg-[#0b101a] px-5 text-base text-white outline-none transition-all duration-200 ease-out placeholder:text-slate-600 hover:border-white/12 focus:border-primary/35 focus:bg-[#0d1420] focus:ring-2 focus:ring-primary/15 focus:shadow-[0_18px_45px_rgba(34,211,238,0.12)]"
          />
        </label>

        <label className="profile-field flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
            Confirm Password
          </span>
          <input
            name="confirmPassword"
            type="password"
            value={securityForm.confirmPassword}
            onChange={onChange}
            placeholder="Confirm your new password"
            className="profile-input h-16 rounded-[1.5rem] border border-white/8 bg-[#0b101a] px-5 text-base text-white outline-none transition-all duration-200 ease-out placeholder:text-slate-600 hover:border-white/12 focus:border-primary/35 focus:bg-[#0d1420] focus:ring-2 focus:ring-primary/15 focus:shadow-[0_18px_45px_rgba(34,211,238,0.12)]"
          />
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-white/6 pt-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2 text-sm">
          {errorMessage ? (
            <p className="inline-flex items-center gap-2 text-rose-300">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMessage}
            </p>
          ) : statusMessage ? (
            <p className="inline-flex items-center gap-2 text-cyan-300">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              {statusMessage}
            </p>
          ) : (
            <p className="text-slate-400">Use at least 8 characters for stronger protection.</p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onLogoutEverywhere}
            className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-rose-300 transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-[1.02] hover:bg-rose-500/10 hover:text-rose-200 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Logout all devices
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !canSubmit}
            className="inline-flex items-center justify-center rounded-full border border-white/8 bg-white/[0.04] px-6 py-3 text-sm font-bold text-white transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-[1.02] hover:border-primary/30 hover:bg-primary/10 hover:shadow-[0_18px_40px_rgba(4,10,24,0.18)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100"
          >
            {isSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </section>
  );
}
