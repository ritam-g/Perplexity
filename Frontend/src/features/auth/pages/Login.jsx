import React, { useState } from "react";
import { useNavigate } from 'react-router';
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { PageLoader } from "../../../app/route-utils";

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin } = useAuth()
  const { user, loading, error } = useSelector(state => state.auth)
  // -------------------------
  // Two-way binding states
  // -------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/chat')
    }
  }, [user, navigate])

  // -------------------------
  // Form submit (only UI logic)
  // -------------------------
  
  
  const submitForm = async (event) => {
    event.preventDefault();

    const payload = {
      email,
      password
    };
    await handleLogin(payload)
  };
  if (loading) return <PageLoader />
  if(!loading && user) navigate('/chat')
  return (
    <section className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-[110px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">

        <div className="glass-panel relative w-full max-w-md rounded-[1.75rem] border border-[#31b8c6]/35 p-8 shadow-2xl shadow-black/50 backdrop-blur">

          <h1 className="text-3xl font-bold text-[#31b8c6]">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-zinc-300">
            Sign in with your email and password.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
              {error}
            </div>
          )}

          <form onSubmit={submitForm} className="mt-8 space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none transition-all duration-200 ease-out hover:border-zinc-500 focus:border-[#31b8c6] focus:ring-2 focus:ring-[#31b8c6]/25 focus:shadow-[0_18px_40px_rgba(49,184,198,0.12)]"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none transition-all duration-200 ease-out hover:border-zinc-500 focus:border-[#31b8c6] focus:ring-2 focus:ring-[#31b8c6]/25 focus:shadow-[0_18px_40px_rgba(49,184,198,0.12)]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-xl bg-[#31b8c6] px-4 py-3 font-semibold text-zinc-950 transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-[1.01] hover:bg-[#45c7d4] hover:shadow-[0_18px_40px_rgba(49,184,198,0.24)] active:scale-[0.99]"
            >
              Login
            </button>

          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-zinc-300">
            Don&apos;t have an account?
            <span
              className="ml-1 cursor-pointer font-semibold text-[#31b8c6] transition-all duration-200 ease-out hover:text-white hover:underline"
              onClick={() => navigate('/register')}
            >
              Register
            </span>
          </p>

        </div>
      </div>
    </section>
  );
};

export default Login;

