import { setToken } from '@/lib/auth';
import { baseUrl } from '@/utils';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || 'Login failed');
        return;
      }

      const data = await res.json();
      setToken(data.access_token);

      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    }
  };

  return (
    <>
      <Head>
        <title>CleverSolution Admin | Login</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 px-4">
        <div className="w-full max-w-md rounded-2xl bg-neutral-800 p-8 shadow-xl">
          <h1 className="mb-6 text-center text-3xl font-bold text-neutral-100">
            Admin Sign In
          </h1>
          <form className="space-y-5">
            <div>
              <label
                htmlFor="login"
                className="mb-1 block text-sm font-medium text-neutral-200"
              >
                Login
              </label>
              <input
                id="login"
                type="text"
                onChange={(e) => setLogin(e.target.value)}
                value={login}
                className="w-full rounded-lg border border-neutral-600 bg-neutral-700 p-3 text-neutral-100 placeholder-neutral-400 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Enter login"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-neutral-200"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="w-full rounded-lg border border-neutral-600 bg-neutral-700 p-3 text-neutral-100 placeholder-neutral-400 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              onClick={handleLogin}
              type="submit"
              className="w-full rounded-lg bg-primary p-3 text-white transition-colors hover:bg-primary-dark"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
