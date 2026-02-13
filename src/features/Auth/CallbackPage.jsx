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
import { getBrowserCountryCode, isEmptyObject } from '../../utils/utils';
import { privateService } from '../../services/privateService';
import { useApp } from '../../hooks/useApp';

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const buildCompany = storage.getItem('buildCompany');
  const {
    step0 = {},
    step2 = {},
    step3 = {},
    step4 = {},
    step5 = {},
    step6 = {},
    step7 = {},
    step8 = {},
    step9 = {},
  } = buildCompany || {};

  const { setToast } = useApp();
  const navigate = useNavigate();
  const didRun = useRef(false);
  const [error, setError] = useState('');
  const { setAuthState } = useAuth();
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const shouldBuildCompany =
      !isEmptyObject(step0) &&
      !isEmptyObject(step2) &&
      !isEmptyObject(step3) &&
      !isEmptyObject(step4) &&
      !isEmptyObject(step5) &&
      !isEmptyObject(step6) &&
      !isEmptyObject(step6) &&
      !isEmptyObject(step7) &&
      !isEmptyObject(step8) &&
      !isEmptyObject(step9);
    console.log('shouldBuildCompany', shouldBuildCompany);
    const code = searchParams.get('code');
    if (code) {
      console.log('buildCompany', buildCompany);
      fetchTokens(code, getBrowserCountryCode())
        .then(({ tokens, googleResponse }) => {
          if (tokens && googleResponse) {
            console.log('done with api call googleResponse', googleResponse);
            console.log('done with api call tokens', tokens);
            setAuthState({
              auth: {
                accessToken: tokens.access_token,
                idToken: tokens.id_token,
                refreshToken: tokens.refresh_token,
                postLoginRedirect: googleResponse.postLoginRedirect,
                userId: googleResponse.userId,
                userType: googleResponse.userType,
              },
              status: AUTHENTICATED,
            });
            if (shouldBuildCompany) {
              const {
                step0: { companyName },
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
                company_name: companyName,
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
              const config = { headers: {} };
              config.headers.Authorization = `Bearer ${tokens.access_token}`;
              privateService
                .create('/build-company', body, config)
                .then(() => {
                  console.log('company created');
                  storage.removeItem('buildCompany');
                  setToast({ show: true, message: '¡Empresa creada!', type: 'success' });
                  window.location.href = '/dashboard/buildCompany';
                })
                .catch((e) => {
                  console.log('error creating company', e);
                });
            } else {
              // start conceptualization
              const existingConceptualization = storage.getItem('conceptualization');
              if (existingConceptualization) {
                console.log(
                  'navigating to /dashboard/conceptualization/pay withAutoContinue: true'
                );
                navigate('/dashboard/conceptualization/pay', {
                  state: { withAutoContinue: true },
                });
                return;
              }
            }
            if (googleResponse?.postLoginRedirect) {
              setTimeout(() => {
                console.log('navigating to ' + googleResponse.postLoginRedirect);
                navigate(googleResponse.postLoginRedirect, { replace: true });
              }, 1000);
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
