import { useState, useRef, useEffect } from 'react';

export default function CreatableSelect({
  label,
  options: initialOptions = [],
  value,
  onChange,
  placeholder = 'Selecciona...',
  onNewOptionAdded = () => {},
  enableAddItem = true,
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(initialOptions);
  const [newOption, setNewOption] = useState('');
  const selectRef = useRef(null);

  useEffect(() => {
    setOptions((prev) => {
      const existingCustom = prev.filter(
        (opt) => !initialOptions.some((io) => io.value === opt.value)
      );
      return [...initialOptions, ...existingCustom];
    });
  }, [initialOptions]);

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

  const handleAddOption = () => {
    if (newOption.trim() === '') return;
    const trimmed = newOption.trim();
    const newItem = { value: trimmed, label: trimmed };
    setOptions([...options, newItem]);
    onChange(newItem.value);
    setNewOption('');
    setOpen(false);
    onNewOptionAdded(newItem.label);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={selectRef}>
      {label && <label className="block mb-2 text-black">{label}</label>}

      <div
        onClick={() => setOpen((prev) => !prev)}
        className="w-full cursor-pointer shadow-md hover:shadow-xl rounded-lg px-4 py-2 flex justify-between items-center bg-white">
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
        <ul className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="px-4 py-2 cursor-pointer hover:bg-primary">
              {opt.label}
            </li>
          ))}
          {enableAddItem && (
            <li className="px-4 py-2">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Agregar nueva opción"
                  className="flex-1 border rounded-lg p-4 border-secondary focus:outline-none focus:border-2 focus:border-primary text-secondary"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddOption();
                  }}
                />
                <button
                  onClick={handleAddOption}
                  className="w-8 h-8 bg-transparent text-primary rounded-full hover:bg-primary hover:text-white">
                  +
                </button>
              </div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
