import { useCallback, useEffect, useRef, useState } from 'react';

export type View = 'landing' | 'register';

const REGISTER_HASH = '#register';

function readView(): View {
  return window.location.hash === REGISTER_HASH ? 'register' : 'landing';
}

/**
 * Landing page or registration screen, kept in the URL hash so the browser
 * Back button works and #register can be linked or put in a QR code.
 * Every switch starts the new view at the top.
 */
export function useHashView(): { view: View; openRegister: () => void; openLanding: () => void } {
  const [view, setView] = useState<View>(readView);
  // True when this tab pushed the #register entry, so Back can return to the page.
  const pushedRegister = useRef(false);

  useEffect(() => {
    const sync = () => setView(readView());
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const openRegister = useCallback(() => {
    if (readView() !== 'register') {
      window.history.pushState({ view: 'register' }, '', REGISTER_HASH);
      pushedRegister.current = true;
    }
    setView('register');
  }, []);

  const openLanding = useCallback(() => {
    if (readView() === 'landing') {
      setView('landing');
      return;
    }
    if (pushedRegister.current) {
      pushedRegister.current = false;
      window.history.back();
      return;
    }
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setView('landing');
  }, []);

  return { view, openRegister, openLanding };
}
