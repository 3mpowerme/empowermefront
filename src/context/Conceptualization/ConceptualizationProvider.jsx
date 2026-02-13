import { useEffect, useState } from 'react';
import { storage } from '../../utils/storage';
import { ConceptualizationContext } from './ConceptualizationContext';
import { privateService } from '../../services/privateService';
import { useApp } from '../../hooks/useApp';
import { useAuth } from '../../hooks/useAuth';

export function ConceptualizationProvider({ children }) {
  const conceptualizationFromStorage = storage.getItem('conceptualization');
  const {
    step0,
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    brandBookOptions: brandBookOptionsFromStorage,
  } = conceptualizationFromStorage || {};
  const initialState = {
    step0: step0 ?? {},
    step1: step1 ?? {},
    step2: step2 ?? {},
    step3: step3 ?? {},
    step4: step4 ?? {},
    step5: step5 ?? {},
    step6: step6 ?? {},
    marketAnalysis: {},
    brandBookOptions: brandBookOptionsFromStorage ?? {},
    conceptualizations: [],
    isLoading: false,
  };

  const { isAuthenticated } = useAuth();
  const { setIsLoading } = useApp();
  const [state, setState] = useState(initialState);

  const setStepState = (stepNumber, newState = {}) => {
    setState((prevState) => {
      storage.setItem('conceptualization', {
        ...prevState,
        [`step${stepNumber}`]: { ...newState },
      });
      return {
        ...prevState,
        [`step${stepNumber}`]: { ...newState },
      };
    });
  };

  const setMarketAnalysis = (newState = {}) => {
    setState((prevState) => {
      storage.setItem('conceptualization', {
        ...prevState,
        marketAnalysis: { ...newState },
      });
      return {
        ...prevState,
        marketAnalysis: { ...newState },
      };
    });
  };

  const setBrandBookOptions = (newState = {}) => {
    setState((prevState) => {
      storage.setItem('conceptualization', {
        ...prevState,
        brandBookOptions: { ...newState },
      });
      return {
        ...prevState,
        brandBookOptions: { ...newState },
      };
    });
  };

  const setLogos = (newState = []) => {
    setState((prevState) => {
      storage.setItem('conceptualization', {
        ...prevState,
        logos: [...newState],
      });
      return {
        ...prevState,
        logos: [...newState],
      };
    });
  };

  const setConceptualizations = (newState = []) => {
    setState((prevState) => {
      return {
        ...prevState,
        conceptualizations: [...newState],
      };
    });
  };

  const setIsMarketAnalysisLoading = (newState = false) => {
    setState((prevState) => {
      return {
        ...prevState,
        isLoading: newState,
      };
    });
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await privateService.get('/conceptualization');
      const parsedData = data.map((it) => {
        it.market_analysis_raw_result = JSON.parse(it.market_analysis_raw_result);
        return it;
      });
      setConceptualizations(parsedData);
    } catch (err) {
      console.error('Error loading company-shareholder', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  console.log('ConceptualizationProvider state:', state);

  return (
    <ConceptualizationContext.Provider
      value={{
        state,
        setStepState,
        setMarketAnalysis,
        refetch: fetchData,
        setIsMarketAnalysisLoading,
        setLogos,
        setBrandBookOptions,
      }}>
      {children}
    </ConceptualizationContext.Provider>
  );
}
