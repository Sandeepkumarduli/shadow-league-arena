
import { useEffect } from 'react';

/**
 * Hook to prevent browser autocomplete suggestions on forms
 */
export function usePreventAutocomplete() {
  useEffect(() => {
    // Find all input elements
    const inputs = document.querySelectorAll('input, select, textarea');
    
    // Set autocomplete attributes to off
    inputs.forEach(input => {
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autoComplete', 'off');
      
      // For password fields, we need extra protection
      if (input.getAttribute('type') === 'password') {
        input.setAttribute('autocomplete', 'new-password');
      }
    });
    
    return () => {
      // Cleanup (optional)
      inputs.forEach(input => {
        input.removeAttribute('autocomplete');
      });
    };
  }, []);
}

export default usePreventAutocomplete;
