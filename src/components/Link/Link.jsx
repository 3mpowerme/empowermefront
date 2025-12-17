import { Link as LinkReactRouter } from 'react-router';

const Link = ({ children, ...props }) => {
  return (
    <LinkReactRouter
      {...props}
      className={`text-blue-400 text-lg underline hover:text-blue-500 hover:scale-105 ${props.className || ''}`}>
      {children}
    </LinkReactRouter>
  );
};

export default Link;
