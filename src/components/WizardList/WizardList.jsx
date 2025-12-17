import classNames from 'classnames';
import Button from '../Button/Button';
import { CalendarDays, Check, CircleCheck } from 'lucide-react';
import { Link } from 'react-router';

export default function WizardList({ wizards, columns = 3, services }) {
  const defineWizardLink = (link) => link.replace('_wizard', '');
  return (
    <div
      className={classNames('grid w-full gap-4 content-start', 'grid-cols-1 sm:grid-cols-2', {
        'lg:grid-cols-1': columns === 1,
        'lg:grid-cols-2': columns === 2,
        'lg:grid-cols-3': columns === 3,
        'lg:grid-cols-4': columns === 4,
      })}>
      {wizards.map((wizard) => {
        const wizard_key = defineWizardLink(wizard.link);
        const alreadyRegistered = services?.registeredServices?.[wizard_key];
        const needsDocuments = services?.needsDocuments?.[wizard_key];
        const alreadyPaid = services?.paidServices?.[wizard_key];
        const shouldShowStartButton = !alreadyPaid;
        const shouldShowLinkToService = alreadyPaid;
        const buttonLabel = alreadyRegistered ? 'Continuar' : 'Empezar';
        return (
          <div
            id={wizard.name}
            key={`${wizard.name}-${wizard.id}`}
            className={classNames(
              'flex box bg-white overflow-auto w-full',
              'flex-col md:flex-row',
              'p-4 md:p-5 gap-4 md:gap-5 md:h-61',
              'rounded-xl shadow-sm'
            )}>
            <div className="bg-primary-opaque flex items-center justify-center rounded-lg md:rounded-none md:rounded-l-lg w-full md:w-auto md:min-w-30 md:max-w-40">
              {wizard.image && (
                <img
                  src={wizard.image}
                  alt={wizard.name}
                  className="w-24 h-24 md:w-26 md:h-26 mt-2 object-contain"
                  loading="lazy"
                />
              )}
            </div>

            <div className="flex flex-col w-full">
              <h3
                className={classNames(
                  'font-semibold text-slate-900',
                  'text-base sm:text-lg',
                  'mb-1',
                  { 'text-start md:pl-5': columns === 1 }
                )}>
                {shouldShowLinkToService ? (
                  <Link
                    to={defineWizardLink(wizard.link)}
                    className={classNames({ 'underline hover:text-primary': alreadyPaid })}>
                    {wizard.name}
                  </Link>
                ) : (
                  wizard.name
                )}
              </h3>

              {wizard.description && (
                <p className="text-xs text-slate-600 leading-6 line-clamp-3 sm:line-clamp-none">
                  {alreadyPaid ? (
                    <div className="flex flex-row flex-wrap items-center mt-5">
                      <CircleCheck className="text-green-400 " size={20} />
                      <span className="ml-2 font-bold text-sm">Contratado</span>
                    </div>
                  ) : (
                    wizard.description
                  )}
                </p>
              )}

              <div
                className={classNames(
                  'flex w-full',
                  'justify-start md:justify-center items-end',
                  wizard.description ? 'mt-3 md:mt-auto' : 'mt-0'
                )}>
                {wizard.buttonType === 'scheduled' ? (
                  <span
                    onClick={wizard.buttonCb}
                    role="button"
                    tabIndex={0}
                    className="text-black font-semibold cursor-pointer bg-green-400/90 hover:bg-green-400 py-2 px-3 rounded-xl inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <CalendarDays className="size-4" />
                    {wizard?.buttonLabel}
                  </span>
                ) : wizard.buttonType === 'to-schedule' ? (
                  <span
                    onClick={wizard.buttonCb}
                    role="button"
                    tabIndex={0}
                    className="text-black font-semibold cursor-pointer bg-orange-strong/90 hover:bg-orange-strong py-2 px-3 rounded-xl inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <CalendarDays className="size-4" />
                    Agendar
                  </span>
                ) : (
                  shouldShowStartButton && (
                    <Button
                      onClick={() => wizard.onClick(wizard.link, alreadyRegistered, needsDocuments)}
                      variant="wizard"
                      className="mt-3 md:mb-5">
                      {buttonLabel}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
