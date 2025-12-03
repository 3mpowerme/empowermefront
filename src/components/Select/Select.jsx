import { useState, useRef, useEffect } from 'react';

export default function Select({
  options = [],
  value,
  onChange,
  placeholder = 'Selecciona...',
  label,
}) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={selectRef}>
      {label && <label className="block mb-2 text-black">{label}</label>}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="w-full cursor-pointer rounded-lg px-4 py-2 flex justify-between items-center bg-white shadow-md hover:shadow-xl focus:outline-none focus:border-primary">
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-white">
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
