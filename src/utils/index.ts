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

export const getCurrentAcademicSession = (): string => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0 = January, 3 = April

  // The new academic session starts in April (month index 3).
  // If the current month is April or later, the session has already started.
  if (currentMonth >= 3) {
    // e.g., If it's May 2025, the session is 2025-26
    const nextYear = (currentYear + 1).toString().slice(-2);
    return `${currentYear}-${nextYear}`;
  } else {
    // e.g., If it's February 2026, the session is still 2025-26
    const lastYear = currentYear - 1;
    const thisYearShort = currentYear.toString().slice(-2);
    return `${lastYear}-${thisYearShort}`;
  }
};