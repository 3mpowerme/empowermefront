import { useEffect, useState } from 'react';

export const MOBILE_WIDTH = 768;

const getSize = () => {
  if (typeof window === 'undefined') return { width: 1024, height: 768 };
  return { width: window.innerWidth, height: window.innerHeight };
};

export function useViewPort() {
  const [size, setSize] = useState(getSize);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let raf = 0;

    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setSize(getSize());
      });
    };

    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return size.width;
}
