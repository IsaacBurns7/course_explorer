import React from "react";

export default function LoginButton({ authUrl = "http://localhost:4000/auth/google" }) {
  return (
    <button
      type="button"
      onClick={() => (window.location.href = authUrl)}
      className="ml-4 px-6 py-2 border border-purple-500 text-white rounded-full hover:bg-purple-600 transition duration-300"
      aria-label="Log in"
      title="Log in"
    >
      Log in
    </button>
  );
}
