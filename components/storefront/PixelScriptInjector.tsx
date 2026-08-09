"use client";

import Script from "next/script";
import { useEffect, useState, useRef } from "react";

function injectSnippet(rawSnippet: string, container: HTMLElement) {
  if (!rawSnippet || !rawSnippet.trim()) return;

  if (container.getAttribute("data-injected-snippet") === rawSnippet) {
    return;
  }

  container.setAttribute("data-injected-snippet", rawSnippet);
  container.innerHTML = "";

  const trimmed = rawSnippet.trim();
  const htmlToParse = trimmed.toLowerCase().includes("<script")
    ? trimmed
    : `<script>${trimmed}</script>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlToParse, "text/html");

  // Append non-script nodes (comments, noscript, HTML tags)
  const nonScriptNodes: Node[] = [];
  doc.head.childNodes.forEach((node) => {
    if (node.nodeName.toLowerCase() !== "script") {
      nonScriptNodes.push(node);
    }
  });
  doc.body.childNodes.forEach((node) => {
    if (node.nodeName.toLowerCase() !== "script") {
      nonScriptNodes.push(node);
    }
  });

  nonScriptNodes.forEach((node) => {
    container.appendChild(node.cloneNode(true));
  });

  // Append script elements via document.createElement for real browser execution
  const scripts = Array.from(doc.querySelectorAll("script"));
  scripts.forEach((oldScript) => {
    const newScript = document.createElement("script");
    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value);
    });

    if (oldScript.src) {
      newScript.src = oldScript.src;
    } else {
      newScript.textContent = oldScript.textContent;
    }

    container.appendChild(newScript);
  });
}

export default function PixelScriptInjector() {
  const [config, setConfig] = useState<any>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/pixel")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!config) return;

    if (config.headerScript && headerRef.current) {
      injectSnippet(config.headerScript, headerRef.current);
    }
    if (config.bodyScript && bodyRef.current) {
      injectSnippet(config.bodyScript, bodyRef.current);
    }
  }, [config]);

  if (!config) return null;

  const { metaPixelId, googleTagId } = config;

  return (
    <>
      {/* Meta Pixel */}
      {metaPixelId && (
        <Script
          id="meta-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* Google Tag (GA4 / Ads) */}
      {googleTagId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-tag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleTagId}');
              `,
            }}
          />
        </>
      )}

      {/* Dynamic Header & Body Script Containers */}
      <div ref={headerRef} id="custom-header-scripts-container" />
      <div ref={bodyRef} id="custom-body-scripts-container" />
    </>
  );
}
