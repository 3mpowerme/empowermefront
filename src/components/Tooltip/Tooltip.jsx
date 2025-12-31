import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

export default function Tooltip({
  content,
  children,
  className,
  panelClassName,
  align = 'right',
  widthClassName = 'md:w-96',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  console.log('HERE open', open);
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const alignClass = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div ref={ref} className={classNames('relative group', className)}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="cursor-pointer">
        {children}
      </button>

      <div
        className={classNames(
          `absolute ${alignClass} mt-2 ${widthClassName} w-60 rounded-md bg-white p-4 text-xs leading-relaxed text-gray-700 shadow-lg z-20`,
          'md:hidden md:group-hover:block',
          open ? 'block' : 'hidden',
          panelClassName
        )}>
        {content}
      </div>
    </div>
  );
}
