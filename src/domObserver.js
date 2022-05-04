function trackMutation(){
    if (typeof observeDOM === undefined) {
        const observeDOM = (function () {
            window.sessionStorage.removeItem('dom_snapshot');
    
            return function () {
                if (window.MutationObserver) {
                    const mutationObserver = new window.MutationObserver(() => {
                        window.sessionStorage.removeItem('dom_snapshot');
                    });
                    mutationObserver.observe(document.documentElement, {childList: true, subtree: true});
                    window.sessionStorage.setItem('allow_snapshot', 'true');
                    return mutationObserver
                }
                else {
                    window.sessionStorage.setItem('allow_snapshot', 'false');
                }
            }
        })()
    }
}

export {domObserver};