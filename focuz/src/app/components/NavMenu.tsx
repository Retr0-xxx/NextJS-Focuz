"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

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

function CoinDisplay({ amount }: { amount: number }) {
  return (
    <div>
      <button className="text-[#FCB7AB] text-2xl hover:scale-110 transition" >
        Coins: {amount}
      </button>
    </div>
  );
}

async function fetchCoins(email: string) {
  const response = await fetch("/api/playerCoin", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data.coin;
}

export default function NavMenu() {
  const { data: session } = useSession();
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    if (session?.user?.email) {
      fetchCoins(session.user.email).then(setCoins);
    }
  }, [session]);

  if (!session) {
    return (
      <div>
        <button onClick={() => signIn()} className="text-[#FCB7AB] text-2xl hover:scale-110 transition">
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-[#2B4448] h-20 flex items-center justify-start space-x-4 px-6">
        <span className="text-[#FCB7AB] text-6xl font-semibold">
          {session.user.name || "Not Logged In"}
        </span>
        <AuthButton />
        <CoinDisplay amount={coins} />
      </nav>

      {/* Stripe Below Navbar */}
      <div className="h-4 bg-[#757086]"></div>
    </div>
  );
}