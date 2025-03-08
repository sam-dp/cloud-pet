"use client"; // Mark this as a Client Component

import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        <p>Welcome, {session.user?.email}!</p>
        <a href="/dashboard">Go to Dashboard</a>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  return (
    <div>
      <p>You are not signed in.</p>
      <button onClick={() => signIn("cognito")}>Sign In</button>
    </div>
  );
}
