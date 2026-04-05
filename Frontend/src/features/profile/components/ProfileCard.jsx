import React from 'react';

/**
 * Profile form field config
 *
 * Keeping fields in one array makes the JSX easier to read and makes it simple
 * to add or remove supported profile inputs later.
 */
const fields = [
  {
    id: 'name',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Enter your full name',
  },
  {
    id: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter your email address',
  },
];

/**
 * ProfileCard
 *
 * This component is intentionally presentational:
 * - It only renders the UI
 * - It receives form state, actions, and messages from ProfilePage
 * - It does not talk to the API directly
 *
 * That separation makes the data flow easier to follow:
 * ProfilePage -> passes props -> ProfileCard renders form
 */
export function ProfileCard({
  profileForm,
  onChange,
  onSave,
  onCancel,
  isSaving,
  isDirty,
  statusMessage,
  errorMessage,
}) {
  return (
    <section className="profile-section profile-card rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(4,10,24,0.28)] backdrop-blur-xl sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            <span className="material-symbols-outlined text-[18px]">person</span>
            Identity Details
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white">Personal Information</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Keep your profile details aligned across the workspace. Updating your name or email will sync the current signed-in account.
          </p>
        </div>
      </div>

      {/* Controlled inputs: the current values always come from ProfilePage state. */}
      <div className="profile-form mt-8 grid gap-6 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.id} className={`profile-field flex flex-col gap-3 ${field.className || ''}`}>
            <span className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
              {field.label}
            </span>
            <input
              name={field.id}
              type={field.type}
              value={profileForm[field.id]}
              onChange={onChange}
              placeholder={field.placeholder}
              className="profile-input h-16 rounded-[1.5rem] border border-white/8 bg-[#0b101a] px-5 text-base text-white outline-none transition-all duration-200 ease-out placeholder:text-slate-600 hover:border-white/12 focus:border-primary/35 focus:bg-[#0d1420] focus:ring-2 focus:ring-primary/15 focus:shadow-[0_18px_45px_rgba(34,211,238,0.12)]"
            />
          </label>
        ))}
      </div>

      {/* Footer area: show feedback first, then render the save/cancel actions. */}
      <div className="mt-8 flex flex-col gap-4 border-t border-white/6 pt-6 md:flex-row md:items-center md:justify-between">
        <div className="min-h-6 text-sm text-slate-400">
          {errorMessage ? (
            <span className="inline-flex items-center gap-2 text-rose-300">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMessage}
            </span>
          ) : statusMessage ? (
            <span className="inline-flex items-center gap-2 text-cyan-300">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              {statusMessage}
            </span>
          ) : (
            <span>{isDirty ? 'Changes are ready to sync.' : 'Your profile is already up to date.'}</span>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-3 text-sm font-semibold text-slate-400 transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-[1.02] hover:bg-white/5 hover:text-white active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !isDirty}
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(34,211,238,0.98),rgba(67,97,238,0.95))] px-6 py-3 text-sm font-bold text-slate-950 shadow-[0_18px_45px_rgba(59,130,246,0.26)] transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-[1.02] hover:shadow-[0_22px_55px_rgba(59,130,246,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 md:hidden">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-400 transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-[1.02] hover:bg-white/5 hover:text-white active:scale-[0.98]"
          >
            Cancel
          </button>
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
            {isSaving ? 'Saving' : isDirty ? 'Pending sync' : 'Ready'}
          </span>
        </div>
      </div>
    </section>
  );
}
