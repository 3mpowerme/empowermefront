import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { fetchTokens } from '../../utils/auth';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';
import ErrorScreen from '../../components/ErrorScreen/ErrorScreen';
import { storage } from '../../utils/storage';
import { genericService } from '../../services/genericService';
import globalConstants from '../../constants/global';
import { useAuth } from '../../hooks/useAuth';
import { AUTHENTICATED } from '../../context/AuthContext/AuthProvider';

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const buildCompany = storage.getItem('buildCompany');
  const navigate = useNavigate();
  const didRun = useRef(false);
  const [error, setError] = useState('');
  const { setAuthState } = useAuth();
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const code = searchParams.get('code');
    if (code) {
      console.log('buildCompany', buildCompany);
      fetchTokens(
        code,
        buildCompany?.step0?.companyName,
        buildCompany?.step0?.countryCode ?? globalConstants.countryCode
      )
        .then(({ tokens, googleResponse }) => {
          if (tokens && googleResponse) {
            console.log('done with api call googleResponse', googleResponse);
            console.log('done with api call tokens', tokens);
            setAuthState({
              auth: {
                accessToken: tokens.access_token,
                idToken: tokens.id_token,
                refreshToken: tokens.refresh_token,
                todayFocus: googleResponse.todayFocus,
                todayFocusFeatureId: googleResponse.todayFocusFeatureId,
                todayFocusUrl: googleResponse.todayFocusUrl,
                userId: googleResponse.userId,
              },
              status: AUTHENTICATED,
            });
            if (buildCompany) {
              const {
                step2: { todayFocus: today_focus } = {},
                step3: {
                  companyOffering: company_offering,
                  customerServiceChannel: customer_service_channel,
                } = {},
                step4: { business_sectors, business_sector_other, about } = {},
                step5: { phone_number, region_id, zip_code, street } = {},
                step6: { hasEmployees } = {},
                step7: { isRegisteredCompany } = {},
                step8: { hasStartedActivities } = {},
                step9: { marketingSource: marketing_source } = {},
              } = buildCompany;

              const parsedId = Number(business_sectors?.[0]);
              const isNumericId = !Number.isNaN(parsedId);

              const body = {
                company_id: googleResponse.companyId,
                today_focus,
                company_offering,
                marketing_source,
                business_sector_id: isNumericId ? parsedId : 11,
                business_sector_other: business_sector_other || '',
                customer_service_channel,
                phone_number,
                is_registered_company: isRegisteredCompany?.[0],
                hasStartedActivities: hasStartedActivities?.[0],
                has_employees: hasEmployees?.[0],
                region_id,
                zip_code,
                about,
                street,
              };
              genericService.create('/build-company', body).then((r) => {
                console.log('r', r);
                storage.removeItem('buildCompany');
                if (r?.todayFocusUrl) {
                  setTimeout(() => {
                    console.log('vamos a navegar');
                    navigate(r.todayFocusUrl, { replace: true });
                  }, 100);
                }
              });
            } else {
              if (googleResponse?.todayFocusUrl) {
                setTimeout(() => {
                  console.log('vamos a navegar');
                  navigate(googleResponse.todayFocusUrl, { replace: true });
                }, 1000);
              }
            }
          }
        })
        .catch((error) => {
          setError(error.message);
        });
    }
  }, [searchParams]);

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return <FullScreenSpinner />;
}
