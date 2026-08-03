type ClassValue = string | number | null | undefined | false;

/** Минимален class-name joiner — не си заслужава зависимост. */
export function clsx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
