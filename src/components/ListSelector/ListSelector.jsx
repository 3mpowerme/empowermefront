import classNames from 'classnames';
import { useEffect, useState } from 'react';

export default function ListSelector({
  items,
  onChange,
  columns = 1,
  multiple = false,
  initialValues,
}) {
  const className = classNames(
    'grid',
    {
      'grid-cols-1': columns === 1,
    },
    'gap-4',
    'w-full'
  );
  const [cardSelected, setCardSelected] = useState([]);

  const getClassNameByCardSelected = (cardId, index) => {
    const cardClassName = classNames(
      'flex border border-opaque flex-col rounded-xl hover:shadow-xl transition-transform transform hover:-translate-y-1 bg-transparent overflow-hidden  h-26 hover:text-primary',
      {
        'border-primary border-4': cardSelected.includes(cardId),
        'min-w-60 w-full px-10 h-full': columns === 1,
      }
    );
    return cardClassName;
  };

  const handleCardChange = (cardId) => {
    if (multiple) {
      if (cardSelected.includes(cardId)) {
        const newCardSelected = cardSelected.filter((el) => el !== cardId);
        setCardSelected([...newCardSelected]);
        onChange([...newCardSelected]);
      } else {
        setCardSelected([...cardSelected, cardId]);
        onChange([...cardSelected, cardId]);
      }
    } else {
      setCardSelected([cardId]);
      onChange([cardId]);
    }
  };

  useEffect(() => {
    if (Array.isArray(initialValues) && initialValues.length > 0) {
      setCardSelected([...initialValues]);
      onChange([...initialValues]);
    }
  }, []);

  return (
    <div className={className}>
      {items.map(({ id, image, name, icon: Icon, description }, index) => (
        <button
          type="button"
          onClick={() => {
            handleCardChange(id);
          }}
          key={id}
          className={getClassNameByCardSelected(id, index)}>
          <div className="flex flex-row space-x-2">
            {image && (
              <img
                src={image}
                alt={name}
                className={classNames({
                  'w-18 h-18 m-auto': columns != 1,
                  'h-7': columns === 1,
                  'w-38 h-38': columns === 3,
                })}
              />
            )}
            {Icon && (
              <div className="flex items-center content-end text-primary">
                <Icon size={16} />
              </div>
            )}
            <p className={classNames('text-sm my-2  ')}>{name}</p>
          </div>

          <div className="m-auto w-full">
            {description && (
              <p
                className={classNames({
                  'text-start text-sm mb-2 text-black': columns === 1,
                })}>
                {description}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
