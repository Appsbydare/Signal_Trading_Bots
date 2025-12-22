"use client";

import { useState } from "react";

import TawkToWidget from "./TawkToWidget";

export default function HumanAgentChatLink() {
  const [active, setActive] = useState(false);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setActive(true);

    // If the widget is already loaded, try to open it.
    try {
      const anyWindow = window as any;
      if (anyWindow.Tawk_API && typeof anyWindow.Tawk_API.maximize === "function") {
        anyWindow.Tawk_API.maximize();
      }
    } catch {
      // ignore
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="text-zinc-400 transition hover:text-zinc-200"
      >
        Chat with a human agent
      </button>
      {active && <TawkToWidget active={true} />}
    </>
  );
}


