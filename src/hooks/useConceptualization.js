import { useContext } from 'react';
import { ConceptualizationContext } from '../context/Conceptualization/ConceptualizationContext';

export function useConceptualization() {
  return useContext(ConceptualizationContext);
}
