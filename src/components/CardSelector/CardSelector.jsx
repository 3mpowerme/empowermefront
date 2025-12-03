import classNames from 'classnames';
import { useEffect, useState } from 'react';

export default function CardSelector({
  cards,
  onCardChange,
  columns = 2,
  multiple = false,
  initialValues,
  disabled = false,
}) {
  const className = classNames('grid w-full gap-4', 'grid-cols-1', {
    'sm:grid-cols-2': columns === 2,
    'sm:grid-cols-1': columns === 1,
    'md:grid-cols-3': columns === 3,
    'md:grid-cols-4': columns === 4,
  });

  const [cardSelected, setCardSelected] = useState([]);

  const getClassNameByCardSelected = (cardId, index) => {
    return classNames(
      'flex rounded-xl shadow-xs hover:shadow-xl transition-transform transform hover:-translate-y-1 bg-white overflow-hidden h-26',
      {
        'border-primary border-4': cardSelected.includes(cardId),

        'sm:min-w-60 sm:w-1/2 sm:px-10': columns === 2,
        'md:min-w-50 md:min-h-50 md:flex-col md:px-2': columns === 3,
        'min-w-60 w-full px-10 h-full': columns === 1,

        'sm:justify-self-end': columns < 3 && index % 2 === 0,
        'sm:justify-self-start': columns < 3 && index % 2 !== 0,
      }
    );
  };

  const handleCardChange = (cardId) => {
    if (multiple) {
      if (cardSelected.includes(cardId)) {
        const newCardSelected = cardSelected.filter((el) => el !== cardId);
        setCardSelected([...newCardSelected]);
        onCardChange([...newCardSelected]);
      } else {
        setCardSelected([...cardSelected, cardId]);
        onCardChange([...cardSelected, cardId]);
      }
    } else {
      setCardSelected([cardId]);
      onCardChange([cardId]);
    }
  };

  useEffect(() => {
    if (Array.isArray(initialValues) && initialValues.length > 0) {
      setCardSelected([...initialValues]);
      onCardChange([...initialValues]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      {cards.map((card, index) => (
        <button
          disabled={disabled}
          type="button"
          onClick={() => handleCardChange(card.id)}
          key={card.id}
          className={getClassNameByCardSelected(card.id, index)}>
          {card.image && (
            <img
              src={card.image}
              alt={card.name}
              className={classNames({
                'sm:w-18 sm:h-18 sm:m-auto': columns !== 1,
                'h-20': columns === 1,
                'md:w-38 md:h-38': columns === 3,
              })}
            />
          )}

          <div className="m-auto w-full">
            <h3
              className={classNames('text-xl font-semibold mb-2 text-black', {
                'text-start pl-5': columns === 1,
              })}>
              {card.name}
            </h3>
            {card.description && (
              <p
                className={classNames({
                  'text-start pl-5': columns === 1,
                })}>
                {card.description}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
