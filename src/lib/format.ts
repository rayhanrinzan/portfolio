const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-08" -> "Aug 2026" */
export function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** Missing content is kept as a visible "TODO(rinzan): ..." string. */
export function isTodo(text: string | undefined): boolean {
  return (text ?? '').trimStart().startsWith('TODO(rinzan)');
}
