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

export const calculateGrade = (percentage: number): string => {
  if (percentage >= 95) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 75) return 'B+';
  if (percentage >= 65) return 'B';
  if (percentage >= 55) return 'C+';
  if (percentage >= 45) return 'C';
  if (percentage >= 35) return 'D';
  return 'F';
};

export const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'bg-green-100 text-green-800';
    case 'B+':
    case 'B':
      return 'bg-blue-100 text-blue-800';
    case 'C+':
    case 'C':
      return 'bg-yellow-100 text-yellow-800';
    case 'D':
      return 'bg-orange-100 text-orange-800';
    case 'F':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};