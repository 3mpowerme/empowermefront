import { motion } from 'framer-motion';
import classNames from 'classnames';

function CardSection({ title, children, className = '', background = 'white' }) {
  let bg = `bg-${background} border-body/20 border-1`;
  if (background === 'overlay') {
    bg = 'bg-white/5 border-white/20 border-1';
  }
  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ scale: 1.01 }}
      className={classNames(
        bg,
        'rounded-3xl shadow-md p-5 break-inside-avoid no-rounded-print no-shadow-print',
        className
      )}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>}
      {children}
    </motion.section>
  );
}

export default CardSection;
