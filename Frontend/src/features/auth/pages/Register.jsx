import React, { useState } from "react";
import { useNavigate } from 'react-router';
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";

const Register = () => {
  const navigate = useNavigate();
  const { handleRegister } = useAuth()
  const { user, loading, error } = useSelector(state => state.auth)
  // -------------------------
  // Two-way binding states
  // -------------------------
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // -------------------------
  // Form submit
  // -------------------------
  const submitForm = (event) => {
    event.preventDefault();

    const payload = {
      username,
      email,
      password,
    };
    handleRegister(payload)
    navigate('/login')
  };
  if (loading) return <h1>Loading...</h1>
  if(!loading && user) navigate('/chat')
  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">

        <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur">

          <h1 className="text-3xl font-bold text-[#31b8c6]">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-zinc-300">
            Register with your username, email, and password.
          </p>

          <form onSubmit={submitForm} className="mt-8 space-y-5">

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Choose a username"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
              />
            </div>

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
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
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
                placeholder="Create a password"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#31b8c6] px-4 py-3 font-semibold text-zinc-950 transition hover:bg-[#45c7d4]"
            >
              Register
            </button>

          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-zinc-300">
            Already have an account?
            <span
              className="ml-1 font-semibold text-[#31b8c6] cursor-pointer hover:underline"
              onClick={() => navigate('/login')}
            >
              Login
            </span>
          </p>

        </div>
      </div>
    </section>
  );
};

export default Register;