import { Link as LinkReactRouter } from 'react-router';

const Link = ({ children, ...props }) => {
  return (
    <LinkReactRouter {...props} className={`text-gray-400 ${props.className || ''}`}>
      {children}
    </LinkReactRouter>
  );
};

export default Link;
