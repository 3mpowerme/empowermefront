import { useEffect, useRef } from 'react';

export const useCustomEvent = (eventName, handler) => {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event) => savedHandler.current(event.detail);
    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }, [eventName]);
};
