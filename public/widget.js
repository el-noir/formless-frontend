(function () {
    const script = document.currentScript;
    if (!script) return;

    let runtimeUrl;
    try {
        runtimeUrl = new URL('./widget/v1.js', script.src).toString();
    } catch {
        runtimeUrl = '/widget/v1.js';
    }

    const loader = document.createElement('script');
    loader.src = runtimeUrl;
    loader.async = true;

    Array.from(script.attributes).forEach((attr) => {
        if (attr.name.startsWith('data-zerofill-') || attr.name.startsWith('data-')) {
            loader.setAttribute(attr.name, attr.value);
        }
    });

    script.parentNode?.insertBefore(loader, script.nextSibling);
})();
