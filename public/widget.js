(function () {
    const script = document.currentScript;
    const token = script ? script.getAttribute('data-zerofill-token') : null;
    const mode = script ? (script.getAttribute('data-mode') || 'bubble') : 'bubble';
    const position = script ? (script.getAttribute('data-position') || 'bottom-right') : 'bottom-right';
    const protocol = script ? (script.getAttribute('data-protocol') || 'v1') : 'v1';
    const autoOpen = script ? script.getAttribute('data-auto-open') !== 'false' : true; // default: auto-open
    const autoOpenDelay = parseInt(script?.getAttribute('data-auto-open-delay') || '5000', 10);
    const themeInherit = script ? script.getAttribute('data-theme-inherit') === 'true' : false;
    const baseUrl = (window.location.origin.includes('localhost') || window.location.protocol === 'file:')
        ? 'http://localhost:3000'
        : 'https://zerofill.app';

    if (protocol !== 'v1') {
        console.warn(`ZeroFill Widget: Unsupported data-protocol "${protocol}". Falling back to v1.`);
    }

    if (!token || token === 'undefined') {
        console.error('ZeroFill Widget: Missing or invalid data-zerofill-token attribute. Please copy the code from your dashboard.');
        return;
    }

    // Styles
    const style = document.createElement('style');
    style.innerHTML = `
        #zerofill-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        #zerofill-button {
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background: #10B981;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 20px rgba(16,185,129,0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: none;
            outline: none;
        }

        #zerofill-button:hover {
            transform: scale(1.05);
        }

        #zerofill-button:active {
            transform: scale(0.95);
        }

        #zerofill-button svg {
            width: 28px;
            height: 28px;
            fill: white;
        }

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

        #zerofill-iframe-container.open {
            display: block;
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        #zerofill-widget-container.left {
            right: auto;
            left: 20px;
        }

        #zerofill-widget-container.left #zerofill-iframe-container {
            right: auto;
            left: 0;
        }

        #zerofill-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        @media (max-width: 480px) {
            #zerofill-iframe-container {
                width: calc(100vw - 40px);
                height: calc(100vh - 120px);
            }
        }
    `;
    document.head.appendChild(style);

    // Elements
    const container = document.createElement('div');
    container.id = 'zerofill-widget-container';
    if (position === 'bottom-left') {
        container.classList.add('left');
    }

    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'zerofill-iframe-container';

    const iframe = document.createElement('iframe');
    iframe.id = 'zerofill-iframe';
    // NOTE: iframe.src is NOT set here — it's lazy-loaded on first open
    // This means zero network cost for users who never open the widget

    iframeContainer.appendChild(iframe);

    const button = document.createElement('button');
    button.id = 'zerofill-button';
    button.setAttribute('aria-label', 'Open chat');
    button.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
    `;

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
            themeInherit ? 'background:inherit' : 'background:#10B981',
            themeInherit ? 'color:inherit' : 'color:#ffffff',
            'box-shadow:0 4px 12px rgba(0,0,0,0.15)',
            'cursor:pointer',
            'font:600 12px/1.2 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif'
        ].join(';');

        launcher.onclick = function () {
            window.open(`${baseUrl}/chat/${token}/embed`, '_blank', 'noopener,noreferrer,width=420,height=700');
        };
        document.body.appendChild(launcher);
        return;
    }

    if (mode === 'inline') {
        const iframeInline = document.createElement('iframe');
        iframeInline.id = 'zerofill-inline-iframe';
        iframeInline.src = `${baseUrl}/chat/${token}/embed`;
        iframeInline.style.cssText = 'width:100%;height:700px;border:0;border-radius:12px;max-width:100%';
        iframeInline.setAttribute('loading', 'lazy');
        iframeInline.setAttribute('title', 'ZeroFill Chat');
        script?.parentNode?.insertBefore(iframeInline, script.nextSibling);
        return;
    }

    container.appendChild(iframeContainer);
    container.appendChild(button);
    document.body.appendChild(container);

    // Capture the host page context to enable AI personalization
    const pageTitle = encodeURIComponent(document.title || '');
    const pageUrl = encodeURIComponent(window.location.href || '');
    const iframeSrc = `${baseUrl}/chat/${token}/embed?pageTitle=${pageTitle}&pageUrl=${pageUrl}`;

    // Logic
    let isOpen = false;
    let iframeLoaded = false;

    function openWidget() {
        isOpen = true;
        // Lazy-load iframe on first open — no network cost until user interacts
        if (!iframeLoaded) {
            iframe.src = iframeSrc;
            iframeLoaded = true;
        }
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
            <svg viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        `;
    }

    button.onclick = () => {
        if (isOpen) closeWidget(); else openWidget();
    };

    // Auto-open: proactively reach out to the user after a delay
    if (autoOpen) {
        setTimeout(() => {
            if (!isOpen) openWidget();
        }, autoOpenDelay);
    }
})();
