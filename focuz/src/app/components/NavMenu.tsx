"use client";

import { signIn, signOut, useSession } from "next-auth/react";

function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button onClick={() => signOut()} className="text-[#FCB7AB] text-2xl hover:scale-110 transition" >
        Sign out
      </button>
    );
  }

  return (
    <button onClick={() => signIn()} className="text-[#FCB7AB] text-2xl hover:scale-110 transition" >
      Sign in
    </button>
  );
}

export default function NavMenu() {
  const { data: session } = useSession();
  if(!session) {
    signIn();
  }
  else {
    console.log("session detected at main");
  }
  return (
    <div>
      {/* Navbar */}
      <nav className="bg-[#2B4448] h-20 flex items-center justify-start space-x-4 px-6">
        <span className="text-[#FCB7AB] text-6xl font-semibold ">
          {session ? session.user.name : "Not Logged In"}
        </span>
        <AuthButton />
      </nav>

      {/* Stripe Below Navbar */}
      <div className="h-4 bg-[#757086]"></div>
    </div>
  );
}
