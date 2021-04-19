import { of, OperatorFunction } from 'rxjs';
import { concatMap } from 'rxjs/operators';

export function tapWhen<T>(tapFn: (t: T) => void, index: number): OperatorFunction<T, T> {
  return (source$) =>
    source$.pipe(
      concatMap((value, i) => {
        if (i === index) {
          tapFn(value);
        }
        return of(value);
      }),
    );
}
