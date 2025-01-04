"use client";

import React from "react";
import { useRouter } from "next/navigation";

function RedirectButton({ route, children, className = "" }) {
  const router = useRouter();

  function handleRedirect() {
    if (route) {
      router.push(route);
    } else {
      console.warn("No route specified for redirection");
    }
  }

  return (
    <button onClick={handleRedirect} className={`${className}`}>
      {children || "Redirect"}
    </button>
  );
}

export default RedirectButton;
