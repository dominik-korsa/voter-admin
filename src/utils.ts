export function firstNotNull<TResult, TArray>(
  array: TArray[],
  callback: (item: TArray, index: number) => TResult | null,
): TResult | null {
  for (let i = 0; i < array.length; i += 1) {
    const result = callback(array[i], i);
    if (result !== null) return result;
  }
  return null;
}
