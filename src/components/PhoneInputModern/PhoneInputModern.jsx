import React, { useState, useEffect } from 'react';
import { useCountry } from '../../hooks/useCountry';

const PhoneInputModern = ({ label, error, defaultCountryCode, className, onChange }) => {
  const { country: countries } = useCountry();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(defaultCountryCode || countries[0]?.code || '');
  console.log('countries', countries);
  const selectedCountry = countries.find((c) => c.code === countryCode);
  console.log('selectedCountry', selectedCountry);
  const phoneMax = selectedCountry?.phone_length_max || 15;
  console.log('phoneMax', phoneMax);
  const prefix = selectedCountry?.phone_code || '';

  useEffect(() => {
    if (countries[0]) setCountryCode(countries[0]?.code);
  }, [countries.length]);

  useEffect(() => {
    if (onChange) {
      onChange({ countryCode, phone, phone_code: prefix });
    }
  }, [countryCode, phone]);

  const handlePhoneChange = (e) => {
    console.log('e', e);
    const digits = e.target.value.replace(/\D/g, '');
    setPhone(digits.slice(0, phoneMax));
  };

  return (
    <div className="flex flex-col w-full">
      {label && <label className="mb-2 text-sm font-medium text-gray-700">{label}</label>}

      <div className="flex items-center bg-white shadow-md hover:shadow-xl border border-gray-200 px-3 py-2">
        <div className="flex items-center pr-3 border-r border-gray-300">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="bg-transparent text-gray-700 text-sm focus:outline-none cursor-pointer">
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>

        {prefix && <span className="px-3 text-gray-500 text-sm">{prefix}</span>}

        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          className={`flex-1 bg-transparent focus:outline-none text-gray-900 text-base ${className}`}
          placeholder="Número de teléfono"
        />
      </div>

      {error && <span className="text-red-700 mt-2">{error}</span>}
    </div>
  );
};

export default PhoneInputModern;
