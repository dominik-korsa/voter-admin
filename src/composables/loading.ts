import {
  readonly, ref, UnwrapRef,
} from 'vue';
import { useTimeoutFn } from '@vueuse/core';

export class LoadingError {
  private readonly friendlyMessage: string;

  private readonly rawError: unknown | undefined;

  constructor(friendlyMessage: string, error?: unknown | undefined) {
    this.friendlyMessage = friendlyMessage;
    this.rawError = error;
  }
}

export type LoadingState<T> = {
  state: 'loading'
} | {
  state: 'ready',
  data: T;
  reload: () => Promise<void>;
} | {
  state: 'error',
  error: LoadingError,
}

export const useLoadingState = <T>(promise: () => Promise<T>) => {
  const state = ref<LoadingState<T>>({ state: 'loading' });

  const tryAssign = () => promise()
    .then((result) => {
      state.value = {
        state: 'ready',
        data: result as UnwrapRef<T>,
        reload: tryAssign,
      };
    });

  const retry = () => {
    tryAssign().catch((error) => {
      console.warn(error);
      if (error instanceof LoadingError) state.value = { state: 'error', error };
      else {
        state.value = {
          state: 'error',
          error: new LoadingError(
            'Wystąpił nieoczekiwany błąd podczas wczytywania',
            error,
          ),
        };
      }
      useTimeoutFn(retry, 15000);
    });
  };
  retry();
  return readonly(state);
};
