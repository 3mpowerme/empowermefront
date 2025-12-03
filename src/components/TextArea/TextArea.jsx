import { useState } from 'react';

export default function TextArea({ label, maxLength = 500, ...props }) {
  const [value, setValue] = useState(props.value || '');

  const handleChange = (e) => {
    setValue(e.target.value);
    props.onChange?.(e);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={props.id} className="block mb-2 text-black ">
          {label}
        </label>
      )}

      <textarea
        {...props}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        className={`w-full rounded-lg px-3 py-2 resize-none bg-white shadow-md hover:shadow-xl focus:outline-none focus:border-2 focus:border-primary ${
          props.className || ''
        }`}
        rows={props.rows || 4}
      />
      <div
        className={`text-right text-sm mt-1 ${
          value.length >= maxLength ? 'text-red-500' : 'text-gray-500'
        }`}>
        ({value.length}/{maxLength})
      </div>
    </div>
  );
}
