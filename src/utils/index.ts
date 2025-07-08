export const formatDate = (date: string | null | undefined): string => {
  if (!date) {
    return 'N/A';
  }
  try {
    // Create a new Date object and format it for the Indian locale.
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    // If the date string is invalid, return 'N/A' to prevent crashes.
    console.error("Failed to format date:", date, error);
    return 'N/A';
  }
};
