"use client";

import { useEffect } from "react";

const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID;
const WIDGET_ID = process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID;

export default function TawkToWidget() {
  useEffect(() => {
    if (!PROPERTY_ID || !WIDGET_ID) {
      return;
    }

    // Avoid injecting the script multiple times
    if (document.getElementById("tawkto-script")) {
      return;
    }

    const s1 = document.createElement("script");
    s1.id = "tawkto-script";
    s1.async = true;
    s1.src = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    document.body.appendChild(s1);

    return () => {
      s1.remove();
    };
  }, []);

  return null;
}


