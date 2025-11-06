"use client";
import Script from "next/script";

export default function SchemaOrg() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "signaltradingbots",
    url: "https://www.signaltradingbots.com",
    email: "support@signaltradingbots.com",
  };

  return (
    <Script type="application/ld+json" id="schema-org" strategy="afterInteractive">
      {JSON.stringify(org)}
    </Script>
  );
}


