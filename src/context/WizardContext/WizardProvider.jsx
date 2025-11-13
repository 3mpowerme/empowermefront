import { useState, useEffect, useRef } from 'react';
import { storage } from '../../utils/storage';
import { privateService } from '../../services/privateService';
import { WizardContext } from './WizardContext';
import { useApp } from '../../hooks/useApp';

export function WizardProvider({
  children,
  stepsConfig = [],
  globalSubmitApi = null,
  successMessage = '',
  successButton = {},
  errorMessage = '',
  onSuccess = () => {},
  onlyCreate = false,
  loadPrefillAfterFinish = false,
  persistData = true,
}) {
  const STORAGE_KEY = `wizard_form${globalSubmitApi.url}`;

  const [steps] = useState(stepsConfig);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => storage.getItem(STORAGE_KEY) || {});
  const formDataRef = useRef(() => storage.getItem(STORAGE_KEY) || {});
  const [hasAlreadyInfo, setHasAlreadyInfo] = useState(false);
  const { isLoading, setIsLoading, setToast } = useApp();
  const loadPrefill = async () => {
    setIsLoading(true);
    try {
      const res = await privateService.get(globalSubmitApi.url);
      console.log('res', res);
      if (res) {
        setHasAlreadyInfo(Object.keys(res).length > 0);
        setFormData(res);
        formDataRef.current = { ...res };
      }
    } catch (err) {
      console.error('prefill error', err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!onlyCreate) loadPrefill();
  }, [globalSubmitApi.url]);

  useEffect(() => {
    if (persistData) storage.setItem(STORAGE_KEY, formData);
  }, [formData]);

  function updateStepData(data) {
    setFormData({ ...data });
    formDataRef.current = { ...data };
  }

  function goNext() {
    setCurrentStep((c) => Math.min(c + 1, steps.length - 1));
  }

  function goPrev() {
    setCurrentStep((c) => Math.max(c - 1, 0));
  }

  async function finish() {
    let postId = null;
    setIsLoading(true);
    console.log('formData', JSON.stringify(formData));
    console.log('formDataRef.current', JSON.stringify(formDataRef.current));

    try {
      if (globalSubmitApi) {
        if (hasAlreadyInfo && !onlyCreate) {
          await privateService.update(globalSubmitApi?.url, {
            ...formDataRef.current,
          });
        } else {
          const postResponse = await privateService.create(`${globalSubmitApi?.url}`, {
            ...formDataRef.current,
          });

          postId = postResponse?.id;
        }
      }

      if (successMessage) {
        setToast({
          show: true,
          message: successMessage,
          button: successButton,
          type: 'success',
        });
        onSuccess(postId);
        if (loadPrefillAfterFinish) {
          loadPrefill();
        }
      }

      storage.removeItem(STORAGE_KEY);
    } catch (err) {
      if (errorMessage) {
        setToast({
          show: true,
          message: errorMessage,
          type: 'error',
        });
      }
      console.error('submit error', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <WizardContext.Provider
      value={{
        steps,
        currentStep,
        setCurrentStep,
        formData,
        updateStepData,
        goNext,
        goPrev,
        finish,
        isLoading,
        hasAlreadyInfo,
        loadPrefill,
      }}>
      {children}
    </WizardContext.Provider>
  );
}
