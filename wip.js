(() => {
    const PROD_HOST = "dsadriel.github.io";
    const COOKIE_KEY = "wip_dismissed";
    const DISMISS_DURATION_MS = 30 * 60 * 1000; // 30 minutes

    if (window.location.hostname !== PROD_HOST) return;

    const style = document.createElement("style");
    style.textContent = `
        #wip-banner {
            border-top: 1px solid rgba(128,128,128,0.2);
            margin-top: 12px;
            padding-top: 10px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            font-size: 0.75rem;
            color: #787878;
        }
        #wip-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: rgba(255, 255, 255, 0.82);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #wip-box {
            max-width: 360px;
            width: calc(100% - 48px);
            border: 1px solid #e8e8e8;
            border-radius: 16px;
            padding: 32px;
            background: #fff;
            color: #0d0d0d;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
        }
        #wip-box h2 {
            font-size: 1.1rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin: 0 0 10px;
        }
        #wip-box p {
            font-size: 0.875rem;
            color: #787878;
            line-height: 1.6;
            margin: 0 0 24px;
        }
        #wip-continue {
            display: inline-block;
            padding: 9px 24px;
            border: 1px solid #e8e8e8;
            border-radius: 100px;
            font-size: 0.875rem;
            font-weight: 600;
            color: #0d0d0d;
            background: none;
            cursor: pointer;
            font-family: inherit;
            transition: border-color 0.15s;
        }
        #wip-continue:hover { border-color: #0d0d0d; }
        @media (prefers-color-scheme: dark) {
            #wip-overlay { background: rgba(0, 0, 0, 0.85); }
            #wip-box { background: #1a1a1a; border-color: #2a2a2a; color: #f0f0f0; }
            #wip-box p { color: #888; }
            #wip-continue { color: #f0f0f0; border-color: #2a2a2a; }
            #wip-continue:hover { border-color: #f0f0f0; }
        }
    `;
    document.head.appendChild(style);

    const banner = document.createElement("div");
    banner.id = "wip-banner";
    banner.textContent = "👷🏻‍♂️  Work in progress — things might look broken or change without notice.";
    document.addEventListener("DOMContentLoaded", () => {
        const header = document.querySelector("header");
        if (header) header.appendChild(banner);
        else document.body.prepend(banner);
    });

    const dismissed = localStorage.getItem(COOKIE_KEY);
    if (dismissed && Date.now() < Number(dismissed)) return;

    const overlay = document.createElement("div");
    overlay.id = "wip-overlay";
    overlay.innerHTML = `
        <div id="wip-box">
            <div style="font-size:2.5rem;margin-bottom:12px">👷🏻‍♂️</div>
            <h2>Work in progress</h2>
            <p>This site is still being built — things might look broken or change without notice. Proceed with that in mind.</p>
            <button id="wip-continue">Continue</button>
        </div>
    `;
    document.body.prepend(overlay);

    document.getElementById("wip-continue").addEventListener("click", () => {
        localStorage.setItem(COOKIE_KEY, String(Date.now() + DISMISS_DURATION_MS));
        overlay.remove();
    });
})();
