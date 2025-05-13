
/**
 * Helper functions for common operations
 */

/**
 * Format a date for display
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    ...(options || {})
  };
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calculate the time difference between now and a date
 */
export function getTimeRemaining(targetDate: string | Date): string {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - now.getTime();
  
  if (diffTime <= 0) {
    return 'Expired';
  }
  
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) {
    return `${diffDays} days`;
  } else if (diffDays === 1) {
    return '1 day';
  } else {
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours > 1) {
      return `${diffHours} hours`;
    } else if (diffHours === 1) {
      return '1 hour';
    } else {
      const diffMinutes = Math.ceil(diffTime / (1000 * 60));
      return `${diffMinutes} minutes`;
    }
  }
}

/**
 * Truncate text to a certain length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2);
}

/**
 * Prevent browser autocomplete on forms
 */
export function preventAutocomplete(formElement: HTMLFormElement | null): void {
  if (!formElement) return;
  
  formElement.setAttribute('autocomplete', 'off');
  
  const inputs = formElement.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.setAttribute('autocomplete', 'off');
    
    if (input.getAttribute('type') === 'password') {
      input.setAttribute('autocomplete', 'new-password');
    }
  });
}
