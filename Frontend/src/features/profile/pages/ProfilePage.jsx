import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { setCurrentChatId } from '../../../app/store/features/chat.slice';
import { useAuth } from '../../auth/hook/useAuth';
import { formatRelativeTime } from '../../chat/utils/formatters';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileCard } from '../components/ProfileCard';
import { SecurityCard } from '../components/SecurityCard';
import { ActivityCard } from '../components/ActivityCard';
import { UserDropdown } from '../components/UserDropdown';
import { BotIcon } from '../../chat/icons';

// Simple client-side email check so we can give fast feedback before the API call.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Build a readable display name from the available user fields.
 *
 * Priority:
 * 1. fullName from frontend state
 * 2. name from backend-normalized data
 * 3. username fallback
 */
function toDisplayName(user) {
  if (user?.fullName?.trim()) return user.fullName.trim();
  if (user?.name?.trim()) return user.name.trim();
  if (!user?.username) return 'Neural Operator';

  return user.username
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatJoinedDate(value) {
  if (!value) {
    return 'Joined recently';
  }

  return `Joined ${new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })}`;
}

function normalizeNameValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmailValue(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/**
 * Profile page
 *
 * Main responsibilities:
 * - Read the current user from Redux
 * - Pre-fill the profile form with existing data
 * - Let the user update name and email
 * - Call the backend profile API through the existing auth hook
 * - Show clear success/error/loading states
 */
export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleLogout, handleUpdateProfile } = useAuth();

  const user = useSelector((state) => state.auth.user);
  const chats = useSelector((state) => state.chat.chats);

  const securitySectionRef = useRef(null);
  const profileSectionRef = useRef(null);

  // Profile form only contains the fields supported by the backend update endpoint.
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });

  // Security form is still local-only for now and keeps the current page structure intact.
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState('');
  const [profileError, setProfileError] = useState('');
  const [securityStatus, setSecurityStatus] = useState('');
  const [securityError, setSecurityError] = useState('');

  const sortedChats = useMemo(() => {
    return Object.values(chats).sort(
      (left, right) =>
        new Date(right.lastUpdated || 0).getTime() - new Date(left.lastUpdated || 0).getTime()
    );
  }, [chats]);

  const totalChats = sortedChats.length;
  const totalMessages = sortedChats.reduce(
    (count, chatItem) => count + (chatItem.messages?.length || 0),
    0
  );
  const lastActive = sortedChats[0]?.lastUpdated || null;

  /**
   * This object prepares the user data in the exact shape expected by the
   * existing profile UI components like ProfileHeader and UserDropdown.
   */
  const baseProfile = useMemo(() => {
    const fullName = toDisplayName(user);
    const username = user?.username || 'neural_operator';
    const subtitle = user?.email || 'operator@sanctuary.ai';

    return {
      fullName,
      username,
      email: user?.email || '',
      avatarUrl: user?.avatarUrl || '',
      roleLabel: 'Profile Settings',
      subtitle,
      joinedLabel: formatJoinedDate(user?.createdAt),
      badgeLabel: user?.verified === false ? 'Core Member' : 'Pro Member',
    };
  }, [user]);

  // Whenever Redux user data changes, refresh the local form with the latest saved values.
  useEffect(() => {
    setProfileForm({
      name: baseProfile.fullName,
      email: baseProfile.email,
    });
  }, [baseProfile.email, baseProfile.fullName]);

  // Dirty check decides whether the save button should be enabled.
  const profileDirty =
    normalizeNameValue(profileForm.name) !== normalizeNameValue(baseProfile.fullName) ||
    normalizeEmailValue(profileForm.email) !== normalizeEmailValue(baseProfile.email);

  const headerStats = useMemo(
    () => [
      {
        label: 'Total Chats',
        value: totalChats > 0 ? totalChats.toLocaleString() : '0',
      },
      {
        label: 'Last Active',
        value: lastActive ? formatRelativeTime(lastActive) : 'Just now',
      },
    ],
    [lastActive, totalChats]
  );

  const workspaceStats = useMemo(
    () => [
      {
        label: 'Active Threads',
        value: totalChats > 0 ? String(totalChats).padStart(2, '0') : '00',
      },
      {
        label: 'Knowledge Sync',
        value: `${Math.max(1.2, totalMessages / 8 || 1.2).toFixed(1)}GB`,
      },
    ],
    [totalChats, totalMessages]
  );

  const activities = useMemo(() => {
    const chatActivities = sortedChats.slice(0, 3).map((chatItem, index) => ({
      id: chatItem.id,
      icon: index === 0 ? 'chat_bubble' : index === 1 ? 'history' : 'auto_awesome',
      tone: 'chat',
      title: chatItem.title || 'New workspace created',
      description:
        chatItem.messages?.length > 0
          ? `${chatItem.messages.length} messages currently active in this thread.`
          : 'Conversation shell created and ready for the next prompt.',
      timestamp: formatRelativeTime(chatItem.lastUpdated),
    }));

    if (chatActivities.length >= 3) {
      return chatActivities;
    }

    return [
      ...chatActivities,
      {
        id: 'profile-sync',
        icon: 'person_check',
        tone: 'profile',
        title: 'Profile identity synced',
        description: 'Personal details are aligned across your current workspace session.',
        timestamp: 'Today',
      },
      {
        id: 'security-guard',
        icon: 'shield',
        tone: 'security',
        title: 'Security protocol ready',
        description: 'Password rotation tools are available whenever you want to tighten access.',
        timestamp: 'Today',
      },
    ].slice(0, 3);
  }, [sortedChats]);

  const wait = useCallback((duration) => {
    return new Promise((resolve) => {
      window.setTimeout(resolve, duration);
    });
  }, []);

  // Keep the profile form controlled so UI and state always stay in sync.
  const handleProfileChange = useCallback((event) => {
    const { name, value } = event.target;

    setProfileStatus('');
    setProfileError('');
    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  }, []);

  const handleSecurityChange = useCallback((event) => {
    const { name, value } = event.target;

    setSecurityForm((current) => ({
      ...current,
      [name]: value,
    }));
  }, []);

  // Reset the local form back to the latest saved profile values.
  const handleCancelProfile = useCallback(() => {
    setProfileForm({
      name: baseProfile.fullName,
      email: baseProfile.email,
    });
    setProfileStatus('');
    setProfileError('');
  }, [baseProfile.email, baseProfile.fullName]);

  const handleSaveProfile = useCallback(async () => {
    if (profileSaving) return;

    // Step 1: Get user input from the controlled profile form.
    const nextName = normalizeNameValue(profileForm.name);
    const nextEmail = normalizeEmailValue(profileForm.email);
    const currentName = normalizeNameValue(baseProfile.fullName);
    const currentEmail = normalizeEmailValue(baseProfile.email);

    setProfileStatus('');
    setProfileError('');

    if (!nextName) {
      setProfileError('Full name is required before saving.');
      return;
    }

    if (!nextEmail) {
      setProfileError('Email is required before saving.');
      return;
    }

    if (!emailRegex.test(nextEmail)) {
      setProfileError('Enter a valid email address before saving.');
      return;
    }

    // Step 2: Only send fields that were actually changed.
    const updatePayload = {};

    if (nextName !== currentName) {
      updatePayload.name = nextName;
    }

    if (nextEmail !== currentEmail) {
      updatePayload.email = nextEmail;
    }

    if (!Object.keys(updatePayload).length) {
      setProfileStatus('Your profile is already up to date.');
      return;
    }

    // Step 3: Show local saving state for the profile form.
    setProfileSaving(true);

    try {
      // Step 4: Call the protected update profile API using the existing auth hook pattern.
      const updatedUser = await handleUpdateProfile(updatePayload);

      // Step 5: Refresh the local form with the saved values from Redux/API.
      setProfileForm({
        name: toDisplayName(updatedUser),
        email: updatedUser?.email || nextEmail,
      });
      setProfileStatus('Profile details synchronized successfully.');
    } catch (error) {
      setProfileError(error.message || 'Unable to update your profile right now.');
    } finally {
      setProfileSaving(false);
    }
  }, [
    baseProfile.email,
    baseProfile.fullName,
    handleUpdateProfile,
    profileForm.email,
    profileForm.name,
    profileSaving,
  ]);

  const handleSaveSecurity = useCallback(async () => {
    if (securitySaving) return;

    setSecurityError('');
    setSecurityStatus('');

    if (!securityForm.currentPassword || !securityForm.newPassword || !securityForm.confirmPassword) {
      setSecurityError('Fill all password fields before updating access.');
      return;
    }

    if (securityForm.newPassword.length < 8) {
      setSecurityError('Use at least 8 characters for your new password.');
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSecurityError('New password and confirmation do not match.');
      return;
    }

    setSecuritySaving(true);
    await wait(900);

    setSecurityForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setSecurityStatus('Password update staged successfully.');
    setSecuritySaving(false);
  }, [securityForm.confirmPassword, securityForm.currentPassword, securityForm.newPassword, securitySaving, wait]);

  const handleLogoutAction = useCallback(async () => {
    await handleLogout();
    navigate('/login');
  }, [handleLogout, navigate]);

  const handleNewChat = useCallback(() => {
    dispatch(setCurrentChatId(null));
    navigate('/dashboard');
  }, [dispatch, navigate]);

  // Sidebar shortcuts scroll directly to the matching section on the same page.
  const scrollToProfile = useCallback(() => {
    profileSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToSecurity = useCallback(() => {
    securitySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const sidebarItems = [
    {
      id: 'chat',
      label: 'New Chat',
      icon: 'add_comment',
      onClick: handleNewChat,
    },
    {
      id: 'history',
      label: 'History',
      icon: 'history',
      onClick: () => navigate('/dashboard'),
    },
    {
      id: 'models',
      label: 'Models',
      icon: 'neurology',
      onClick: scrollToProfile,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'monitoring',
      onClick: scrollToSecurity,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-background">
      <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_22%)]">
        <aside className="hidden w-72 flex-col border-r border-white/5 bg-[#0a0f18]/95 px-6 py-7 shadow-[30px_0_90px_rgba(0,0,0,0.16)] backdrop-blur-xl lg:flex">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(145deg,rgba(34,211,238,0.92),rgba(67,97,238,0.86))] shadow-[0_20px_50px_rgba(34,211,238,0.22)]">
              <BotIcon size="lg" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-primary">Cognitive</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Sanctuary
              </p>
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition-all duration-200 ease-out transform-gpu will-change-transform ${
                  item.id === 'analytics'
                    ? 'border border-primary/20 bg-primary/10 text-primary shadow-[0_18px_50px_rgba(56,189,248,0.12)] hover:scale-[1.01]'
                    : 'text-slate-400 hover:scale-[1.01] hover:bg-white/[0.04] hover:text-white active:scale-[0.99]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-5">
            <div className="rounded-[2rem] border border-primary/15 bg-[linear-gradient(160deg,rgba(8,19,34,0.96),rgba(12,31,49,0.88))] p-5 shadow-[0_22px_60px_rgba(6,10,22,0.35)]">
              <p className="text-lg font-black text-primary">Upgrade to Pro</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Unlock advanced reasoning, richer memory, and premium model orchestration.
              </p>
              <button
                type="button"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(34,211,238,0.95),rgba(67,97,238,0.9))] px-4 py-3 text-sm font-bold text-slate-950 transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-[1.02] hover:shadow-[0_22px_55px_rgba(59,130,246,0.22)] active:scale-[0.98]"
              >
                Upgrade
              </button>
            </div>

            <UserDropdown
              user={user}
              onProfile={scrollToProfile}
              onSettings={scrollToSecurity}
              onLogout={handleLogoutAction}
            />
          </div>
        </aside>

        <main className="relative flex-1 overflow-y-auto px-4 pb-32 pt-5 sm:px-6 lg:px-10 lg:pb-14">
          <div className="mx-auto max-w-7xl">
            <header className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-surface-container-low/90 text-slate-300 transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-105 hover:border-primary/25 hover:text-primary active:scale-95 lg:hidden"
                  aria-label="Open workspace"
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>

                <div>
                  <p className="text-sm text-slate-500">Library</p>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Workspace</span>
                    <span className="text-slate-600">/</span>
                    <span className="font-semibold text-primary">Profile Settings</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-surface-container-low/90 text-slate-300 transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-105 hover:border-primary/25 hover:text-primary active:scale-95"
                  aria-label="Notifications"
                >
                  <span className="material-symbols-outlined">notifications</span>
                </button>

                <UserDropdown
                  compact
                  user={user}
                  onProfile={scrollToProfile}
                  onSettings={scrollToSecurity}
                  onLogout={handleLogoutAction}
                />
              </div>
            </header>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
              <div className="space-y-8">
                <ProfileHeader
                  profile={baseProfile}
                  stats={headerStats}
                  onEditAvatar={() => setProfileStatus('Avatar customization can be connected next.')}
                />

                <div ref={profileSectionRef}>
                  <ProfileCard
                    profileForm={profileForm}
                    onChange={handleProfileChange}
                    onSave={handleSaveProfile}
                    onCancel={handleCancelProfile}
                    isSaving={profileSaving}
                    isDirty={profileDirty}
                    statusMessage={profileStatus}
                    errorMessage={profileError}
                  />
                </div>

                <div ref={securitySectionRef}>
                  <SecurityCard
                    securityForm={securityForm}
                    onChange={handleSecurityChange}
                    onSave={handleSaveSecurity}
                    onLogoutEverywhere={handleLogoutAction}
                    isSaving={securitySaving}
                    statusMessage={securityStatus}
                    errorMessage={securityError}
                  />
                </div>
              </div>

              <aside className="space-y-8">
                <ActivityCard activities={activities} />

                <section className="profile-card rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(4,10,24,0.28)] backdrop-blur-xl sm:p-8">
                  <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    <span className="material-symbols-outlined text-[18px]">hub</span>
                    Workspace Nodes
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    {workspaceStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-[1.75rem] border border-white/6 bg-black/18 px-5 py-6 text-center"
                      >
                        <p className="text-3xl font-black tracking-tight text-primary">{stat.value}</p>
                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="profile-card overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(14,21,35,0.98),rgba(18,29,48,0.88))] shadow-[0_26px_90px_rgba(4,10,24,0.34)]">
                  <div className="relative p-7">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_32%)]" />
                    <div className="relative">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                        Neural Nodes
                      </p>
                      <h3 className="mt-4 max-w-sm text-3xl font-black leading-tight tracking-tight text-white">
                        Explore the advanced model library
                      </h3>
                      <p className="mt-4 max-w-md text-sm leading-6 text-slate-300/80">
                        Discover specialized assistants for coding, research, and creative workflows with richer context depth.
                      </p>
                      <button
                        type="button"
                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition-all duration-200 ease-out transform-gpu will-change-transform hover:translate-x-1 hover:gap-3 active:translate-x-0"
                      >
                        Go to models
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/6 bg-[linear-gradient(180deg,rgba(8,12,20,0),rgba(8,12,20,0.88)_35%,rgba(8,12,20,0.96))] p-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={profileSaving || !profileDirty}
          className="inline-flex h-16 w-full items-center justify-center rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(34,211,238,0.98),rgba(67,97,238,0.92))] px-6 text-lg font-black tracking-tight text-slate-950 shadow-[0_20px_55px_rgba(34,211,238,0.2)] transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
        >
          {profileSaving ? 'Saving...' : profileDirty ? 'Save Changes' : 'Profile In Sync'}
        </button>
      </div>
    </div>
  );
}
