import { useEffect, useState } from 'react';

export default function FullScreenSpinner({
  message = '',
  showProgress = false,
  duration = 5000, //miliseconds
  maxProgress = 99,
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showProgress) return;

    const timeInterval = duration / maxProgress;
    let interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < maxProgress) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, timeInterval);

    return () => clearInterval(interval);
  }, [showProgress, duration, maxProgress]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-secondary bg-opacity-50 z-30 gap-5">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      {message && <p className="font-bold text-xl">{message}</p>}
      {showProgress && <p className="font-bold text-xl">{progress}%</p>}
    </div>
  );
}
