export const formatDate = (date: string | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    return 'Invalid Date';
  }
};