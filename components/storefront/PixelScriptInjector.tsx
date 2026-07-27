"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function PixelScriptInjector() {
  const [config, setConfig] = useState<any>(null);

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

  if (!config) return null;

  const { metaPixelId, googleTagId, headerScript, bodyScript } = config;

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

      {/* Custom Header Script Injection */}
      {headerScript && (
        <Script
          id="custom-header-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: headerScript.replace(/<\/?script[^>]*>/gi, "") }}
        />
      )}

      {/* Custom Body Script Injection */}
      {bodyScript && (
        <div
          id="custom-body-script"
          dangerouslySetInnerHTML={{ __html: bodyScript }}
        />
      )}
    </>
  );
}
