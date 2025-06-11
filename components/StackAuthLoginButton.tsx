import React from "react";

const STACK_PROJECT_ID = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const REDIRECT_URI = typeof window !== "undefined"
  ? `${window.location.origin}/api/auth/stackauth/callback`
  : "";
const STACKAUTH_URL = `https://app.stack-auth.com/login?client_id=${STACK_PROJECT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

export const StackAuthLoginButton: React.FC = () => {
  const handleLogin = () => {
    window.location.href = STACKAUTH_URL;
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full px-6 py-3 rounded-2xl bg-white/80 dark:bg-black/80 shadow-lg hover:shadow-xl transition-all duration-200 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center gap-3 text-lg font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
      aria-label="Login mit StackAuth"
    >
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#3B82F6" />
        <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">SA</text>
      </svg>
      <span>Login mit StackAuth</span>
    </button>
  );
};

export default StackAuthLoginButton; 

