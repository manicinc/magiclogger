/**
 * Analytics Plugin for Docusaurus
 * Combines Google Analytics (gtag.js) and Microsoft Clarity
 * IDs are read from environment variables - never hardcoded
 */

module.exports = function analyticsPlugin() {
  return {
    name: 'docusaurus-plugin-analytics',

    injectHtmlTags() {
      const gaTrackingId = process.env.GA_TRACKING_ID;
      const clarityId = process.env.MS_CLARITY_ID;
      
      const tags = [];

      // Google Analytics gtag.js
      if (gaTrackingId) {
        tags.push(
          {
            tagName: 'script',
            attributes: {
              async: true,
              src: `https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`,
            },
          },
          {
            tagName: 'script',
            innerHTML: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              
              // Set default consent to denied
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied'
              });
              
              gtag('js', new Date());
              gtag('config', '${gaTrackingId}', {
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure'
              });
            `,
          }
        );
      } else {
        console.warn('[Analytics Plugin] GA_TRACKING_ID not set, skipping Google Analytics');
      }

      // Microsoft Clarity
      if (clarityId) {
        tags.push({
          tagName: 'script',
          innerHTML: `
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `,
        });
      } else {
        console.warn('[Analytics Plugin] MS_CLARITY_ID not set, skipping Microsoft Clarity');
      }

      return {
        headTags: tags,
      };
    },
  };
};