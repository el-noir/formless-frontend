(function () {
    const script = document.currentScript;
    const token = script ? script.getAttribute('data-zerofill-token') : null;
    const requestedMode = script ? (script.getAttribute('data-mode') || 'bubble') : 'bubble';
    const requestedPosition = script ? (script.getAttribute('data-position') || 'bottom-right') : 'bottom-right';
    const requestedProtocol = script ? (script.getAttribute('data-protocol') || 'v1') : 'v1';
    const requestedAutoOpen = script ? script.getAttribute('data-auto-open') !== 'false' : true;
    const requestedAutoOpenDelay = parseInt(script?.getAttribute('data-auto-open-delay') || '5000', 10);
    const requestedThemeInherit = script ? script.getAttribute('data-theme-inherit') === 'true' : false;

    const baseUrl = (window.location.origin.includes('localhost') || window.location.protocol === 'file:')
        ? 'http://localhost:3000'
        : 'https://0fill.vercel.app';

    if (!token || token === 'undefined') {
        console.error('ZeroFill Widget: Missing or invalid data-zerofill-token attribute.');
        return;
    }

    const handshakeUrl = `${baseUrl}/api/public/chat/${encodeURIComponent(token)}/widget-config`;
    const widgetEventUrl = `${baseUrl}/api/public/chat/${encodeURIComponent(token)}/widget-events`;

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function reportWidgetEvent(event, properties) {
        const payload = JSON.stringify({
            event,
            properties: properties || {},
        });

        try {
            if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
                const blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon(widgetEventUrl, blob);
                return;
            }

            fetch(widgetEventUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: payload,
                keepalive: true,
            }).catch(function () {
                // Telemetry failures must never affect widget behavior.
            });
        } catch {
            // Telemetry failures must never affect widget behavior.
        }
    }

    async function fetchWidgetConfigWithRetry() {
        const attempts = [0, 250, 750];
        for (let i = 0; i < attempts.length; i++) {
            if (attempts[i] > 0) {
                await delay(attempts[i]);
            }
            try {
                const res = await fetch(handshakeUrl, {
                    method: 'GET',
                    headers: {
                        'x-zerofill-protocol': requestedProtocol,
                    },
                });

                if (!res.ok) {
                    let payload = null;
                    try {
                        payload = await res.json();
                    } catch {
                        payload = null;
                    }

                    const code = payload?.code || payload?.message?.code || payload?.error?.code || null;
                    const message =
                        payload?.message?.message ||
                        payload?.message ||
                        payload?.error?.message ||
                        `Handshake failed (${res.status})`;
                    if (res.status === 403 || res.status === 400) {
                        const err = new Error(message);
                        err.code = code;
                        err.status = res.status;
                        err.attempt = i + 1;
                        throw err;
                    }

                    if (i === attempts.length - 1) {
                        const err = new Error(message);
                        err.code = code;
                        err.status = res.status;
                        err.attempt = i + 1;
                        throw err;
                    }
                    continue;
                }

                const payload = await res.json();
                return {
                    data: payload?.data || null,
                    attempt: i + 1,
                };
            } catch (err) {
                if (i === attempts.length - 1) {
                    if (!err.attempt) {
                        err.attempt = i + 1;
                    }
                    throw err;
                }
            }
        }

        return null;
    }

    function sanitizeMode(value) {
        if (value === 'inline' || value === 'popup' || value === 'bubble') return value;
        return 'bubble';
    }

    function renderWidget(config) {
        const modeMap = {
            inline_iframe: 'inline',
            popup_launcher: 'popup',
            floating_bubble: 'bubble',
        };

        const serverMode = modeMap[config?.embedMode] || null;
        const mode = sanitizeMode(serverMode || requestedMode);
        const position = config?.embedPosition || requestedPosition || 'bottom-right';
        const themeInherit = typeof config?.embedThemeInherit === 'boolean'
            ? config.embedThemeInherit
            : requestedThemeInherit;
        const autoOpen = mode === 'bubble' ? requestedAutoOpen : false;
        const autoOpenDelay = Number.isFinite(config?.embedAutoOpenDelayMs)
            ? config.embedAutoOpenDelayMs
            : requestedAutoOpenDelay;
        const themeColor = config?.themeColor || '#10B981';

        const style = document.createElement('style');
        style.innerHTML = `
            #zerofill-widget-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }

            #zerofill-widget-container.left {
                right: auto;
                left: 20px;
            }

            #zerofill-button {
                width: 60px;
                height: 60px;
                border-radius: 30px;
                background: ${themeColor};
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s ease;
                border: none;
                outline: none;
            }

            #zerofill-button:hover { transform: scale(1.05); }
            #zerofill-button:active { transform: scale(0.95); }

            #zerofill-iframe-container {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 400px;
                height: 600px;
                max-height: calc(100vh - 120px);
                max-width: calc(100vw - 40px);
                background: #0B0B0F;
                border-radius: 16px;
                box-shadow: 0 12px 24px rgba(0,0,0,0.25);
                overflow: hidden;
                border: 1px solid rgba(255,255,255,0.05);
                display: none;
                opacity: 0;
                transform: translateY(10px) scale(0.97);
                transition: opacity 0.25s ease, transform 0.25s ease;
            }

            #zerofill-widget-container.left #zerofill-iframe-container {
                right: auto;
                left: 0;
            }

            #zerofill-iframe-container.open {
                display: block;
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            #zerofill-iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
        `;
        document.head.appendChild(style);

        if (mode === 'inline') {
            const iframeInline = document.createElement('iframe');
            iframeInline.id = 'zerofill-inline-iframe';
            iframeInline.src = `${baseUrl}/chat/${token}/embed`;
            iframeInline.style.cssText = [
                'width:100%',
                'height:700px',
                'border:0',
                'border-radius:12px',
                'max-width:100%',
                themeInherit ? 'background:transparent' : '',
            ].join(';');
            iframeInline.setAttribute('loading', 'lazy');
            iframeInline.setAttribute('title', 'ZeroFill Chat');
            script?.parentNode?.insertBefore(iframeInline, script.nextSibling);
            return;
        }

        if (mode === 'popup') {
            const launcher = document.createElement('button');
            launcher.id = 'zerofill-popup-launcher';
            launcher.textContent = 'Open Chat';
            launcher.style.cssText = [
                'position:fixed',
                position === 'bottom-left' ? 'left:20px' : 'right:20px',
                'bottom:20px',
                'z-index:999999',
                'border:none',
                'border-radius:9999px',
                'padding:10px 14px',
                themeInherit ? 'background:inherit' : `background:${themeColor}`,
                themeInherit ? 'color:inherit' : 'color:#ffffff',
                'box-shadow:0 4px 12px rgba(0,0,0,0.15)',
                'cursor:pointer',
                'font:600 12px/1.2 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
            ].join(';');

            launcher.onclick = function () {
                window.open(`${baseUrl}/chat/${token}/embed`, '_blank', 'noopener,noreferrer,width=420,height=700');
            };

            document.body.appendChild(launcher);
            return;
        }

        const container = document.createElement('div');
        container.id = 'zerofill-widget-container';
        if (position === 'bottom-left') {
            container.classList.add('left');
        }

        const iframeContainer = document.createElement('div');
        iframeContainer.id = 'zerofill-iframe-container';

        const iframe = document.createElement('iframe');
        iframe.id = 'zerofill-iframe';
        iframeContainer.appendChild(iframe);

        const button = document.createElement('button');
        button.id = 'zerofill-button';
        button.setAttribute('aria-label', 'Open chat');
        button.innerHTML = `
            <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        `;

        container.appendChild(iframeContainer);
        container.appendChild(button);
        document.body.appendChild(container);

        const pageTitle = encodeURIComponent(document.title || '');
        const pageUrl = encodeURIComponent(window.location.href || '');
        const iframeSrc = `${baseUrl}/chat/${token}/embed?pageTitle=${pageTitle}&pageUrl=${pageUrl}`;

        let isOpen = false;
        let iframeLoaded = false;

        function openWidget() {
            isOpen = true;
            if (!iframeLoaded) {
                iframe.src = iframeSrc;
                iframeLoaded = true;
            }
            reportWidgetEvent('widget_opened', {
                protocol: requestedProtocol,
            });
            iframeContainer.classList.add('open');
            button.setAttribute('aria-label', 'Close chat');
            button.innerHTML = `
                <svg viewBox="0 0 24 24" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `;
        }

        function closeWidget() {
            isOpen = false;
            iframeContainer.classList.remove('open');
            button.setAttribute('aria-label', 'Open chat');
            button.innerHTML = `
                <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            `;
        }

        button.onclick = function () {
            if (isOpen) closeWidget(); else openWidget();
        };

        if (autoOpen) {
            setTimeout(function () {
                if (!isOpen) openWidget();
            }, Math.max(0, autoOpenDelay));
        }
    }

    (async function init() {
        let handshakeResult = null;
        try {
            handshakeResult = await fetchWidgetConfigWithRetry();
            reportWidgetEvent('widget_handshake_success', {
                attempt: handshakeResult?.attempt || 1,
                protocol: requestedProtocol,
                compatibilityMode: handshakeResult?.data?.compatibilityMode || 'unknown',
            });
        } catch (err) {
            console.warn('ZeroFill Widget: handshake unavailable, using local defaults.', err?.message || err);
            reportWidgetEvent('widget_handshake_fallback', {
                attempt: err?.attempt || null,
                protocol: requestedProtocol,
                code: err?.code || null,
                status: err?.status || null,
                reason: String(err?.message || 'handshake_unavailable').slice(0, 200),
            });
        }

        renderWidget(handshakeResult?.data?.config || null);
    })();
})();