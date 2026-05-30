const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isDateOnlyValue(value: string): boolean {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isMaintenanceBlockDateRangeValid(
  startDate: string,
  endDate: string,
): boolean {
  return isDateOnlyValue(startDate) && isDateOnlyValue(endDate) && startDate < endDate;
}

const maintenanceBlockDateRange = {
  isDateOnlyValue,
  isMaintenanceBlockDateRangeValid,
} as const;

export default maintenanceBlockDateRange;
