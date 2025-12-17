import { useEffect, useMemo, useState } from 'react';
import { AccountContext } from './AccountContext';
import { privateService } from '../../services/privateService';
import { storage } from '../../utils/storage';

export function AccountProvider({ children }) {
  const activeCompanyFromStorage = storage.getItem('activeCompany');
  const initialState = {
    account: {},
    activeCompany: activeCompanyFromStorage,
    isReady: false,
  };
  const [state, setState] = useState(initialState);

  const { account, activeCompany } = state;

  const setAccount = (account) => {
    setState((prevState) => {
      return {
        ...prevState,
        account: { ...account },
      };
    });
  };

  useEffect(() => {
    privateService
      .get('/account')
      .then((accountResponse) => {
        console.log('accountResponse', accountResponse);
        setAccount(accountResponse);
      })
      .catch((error) => {
        console.error('Error getting account', error);
      })
      .finally(() => {
        setState((prevState) => {
          return {
            ...prevState,
            isReady: true,
          };
        });
      });
  }, []);

  const setActiveCompany = (companyId) => {
    storage.setItem('activeCompany', companyId);
    setState((prevState) => {
      return {
        ...prevState,
        activeCompany: companyId,
      };
    });
  };

  useEffect(() => {
    if (!activeCompany && account?.companies?.length > 0) {
      setActiveCompany(account?.companies[0]?.companyId);
    }
  }, [account?.companies?.length]);

  console.log('AccountProvider state:', state);

  const activeCompanyInfo = useMemo(() => {
    if (!account?.companies || !activeCompany) return {};
    return account.companies.find((c) => c.companyId === activeCompany);
  }, [account?.companies, activeCompany]);

  return (
    <AccountContext.Provider
      value={{
        account,
        setAccount,
        setActiveCompany,
        activeCompany,
        activeCompanyInfo,
        isReady: state.isReady,
      }}>
      {children}
    </AccountContext.Provider>
  );
}
