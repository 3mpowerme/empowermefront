import { useEffect, useMemo, useRef, useState } from 'react';

function getJwtExp(token) {
  try {
    const [, payload] = token.split('.');
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp === 'number' ? json.exp : null;
  } catch {
    return null;
  }
}

export function useTokenExpiryWatcher({ accessToken, advanceSeconds = 60, tickMs = 1000 }) {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [isAboutToExpire, setIsAboutToExpire] = useState(false);
  const expRef = useRef(null);

  const exp = useMemo(() => (accessToken ? getJwtExp(accessToken) : null), [accessToken]);

  useEffect(() => {
    expRef.current = exp;
    if (!exp) {
      setSecondsLeft(null);
      setIsAboutToExpire(false);
      return;
    }

    let raf;
    const interval = setInterval(() => {
      const msLeft = expRef.current * 1000 - Date.now();
      const secs = Math.max(0, Math.floor(msLeft / 1000));
      setSecondsLeft(secs);
      setIsAboutToExpire(secs > 0 && secs <= advanceSeconds);
    }, tickMs);

    return () => {
      clearInterval(interval);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [exp, advanceSeconds, tickMs]);

  return { secondsLeft, isAboutToExpire };
}
