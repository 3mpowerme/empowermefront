import React, { useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';

const Input = ({ label, error, type = 'text', inputMode, maxLength, onChange, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  const handleChange = (e) => {
    let value = e.target.value;

    if (inputMode === 'numeric') {
      value = value.replace(/\D/g, '');
      if (maxLength) {
        value = value.slice(0, maxLength);
      }
      e.target.value = value;
    }

    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="flex flex-col w-full relative">
      {label && (
        <label className="pb-2.5" htmlFor={props.id || props.name}>
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          {...props}
          type={inputType}
          inputMode={inputMode}
          maxLength={maxLength}
          onChange={handleChange}
          className={`bg-white shadow-md hover:shadow-xl px-5 py-3 p-2 rounded w-full focus:outline-none focus:border-2 focus:border-primary ${error ? 'border-b-red-700' : ''} ${props.className || ''} pr-12`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && <span className="text-red-700 mt-2">{error}</span>}
    </div>
  );
};

export default Input;
