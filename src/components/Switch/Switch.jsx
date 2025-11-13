import React from 'react';

const Switch = ({ value, children, defaultChild }) => {
  if (!children) return <></>;
  const child = [].concat(children).find((_child) => _child?.props?.case === value);
  return child ?? defaultChild;
};

Switch.Item = ({ children }) => {
  return children;
};

export default Switch;
