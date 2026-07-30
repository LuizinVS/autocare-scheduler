export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

export function toTimeInputValue(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value.slice(11, 16);
}

export function composeLocalDateTime(dateValue: string, timeValue: string): string {
  return `${dateValue}T${timeValue}:00`;
}

export function formatLocalDateTime(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'short', timeStyle: 'short' }
): string {
  if (!value) {
    return '';
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) {
    return value;
  }

  const [, year, month, day, hour, minute, second = '0'] = match;
  const localDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
  return new Intl.DateTimeFormat('pt-BR', options).format(localDate);
}
