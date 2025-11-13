import { useContext } from 'react';
import { ShareholderContext } from '../context/ShareholderContext/ShareholderContext';

export function useShareholder() {
  return useContext(ShareholderContext);
}
