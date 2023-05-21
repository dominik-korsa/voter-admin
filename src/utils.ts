export function firstDefined<TResult, TArray>(
  array: TArray[],
  callback: (item: TArray, index: number) => TResult | null | undefined,
): TResult | null {
  for (let i = 0; i < array.length; i += 1) {
    const result = callback(array[i], i);
    if (result !== null && result !== undefined) return result;
  }
  return null;
}

export const firstError = (
  ...checks: (() => string | undefined | null)[]
) => firstDefined(checks, (check) => check());

export function mapWithPrev<Src, Target>(
  src: Src[],
  callback: (item: Src, index: number, prev: Target | undefined) => Target,
) {
  let prevResult: Target | undefined;
  return src.map((item, index) => {
    prevResult = callback(item, index, prevResult);
    return prevResult;
  });
}
