import React, { forwardRef, useState } from 'react';
import { PopupModal, useCalendlyEventListener } from 'react-calendly';

const CalendlyPopup = forwardRef(
  ({ url, user, onEventScheduled = () => {}, onClose = () => {} }, ref) => {
    const [open, setOpen] = useState(true);
    const handleClose = () => {
      setOpen(false);
      onClose();
    };
    const utm = {
      utmCampaign: `so_${ref?.current?.serviceOrderId}`,
      utmContent: `so_${ref?.current?.serviceOrderId}`,
      utmMedium: `so_${ref?.current?.serviceOrderId}`,
      utmSource: `so_${ref?.current?.serviceOrderId}`,
      utmTerm: `so_${ref?.current?.serviceOrderId}`,
    };

    const pageSettings = {
      hideLandingPageDetails: true,
      hideEventTypeDetails: true,
      backgroundColor: 'FFFFFF',
      textColor: '6C6B71',
      primaryColor: '8347CC',
      hideGdprBanner: true,
    };

    useCalendlyEventListener({
      onProfilePageViewed: () => console.log('onProfilePageViewed'),
      onDateAndTimeSelected: () => console.log('onDateAndTimeSelected'),
      onEventTypeViewed: () => console.log('onEventTypeViewed'),
      onEventScheduled: onEventScheduled,
      onPageHeightResize: (e) => console.log(e.data.payload.height),
    });

    return (
      <PopupModal
        prefill={{
          name: user?.name,
          email: user?.email,
        }}
        url={url}
        utm={utm}
        pageSettings={pageSettings}
        rootElement={document.getElementById('root')}
        onModalClose={handleClose}
        open={open}
      />
    );
  }
);

export default CalendlyPopup;
