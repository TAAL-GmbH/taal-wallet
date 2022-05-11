import { ErrorCodeEnum } from 'src/types';
import { ApiError } from '@/utils/errors/apiError';

type Fetcher = {
  url: string;
  fetchOptions?: RequestInit;
};

// TODO: add return type based on request method
// something like ReturnType<Fetcher['fetchOptions']['method'], T, P>

// return type is based on request method
// type ReturnType<M, T, P> = M extends 'get'
//   ? QueryFunction<T>
//   : MutationFunction<T, P>;

export const fetcher = <T, P = undefined>({
  url,
  fetchOptions = {},
}: Fetcher) => {
  return async (payload?: P): Promise<T> => {
    const method = fetchOptions?.method || 'get';
    const noBody = method === 'get' || method === 'head';

    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    });

    const response = await fetch(url, {
      body: noBody ? undefined : JSON.stringify(payload),
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      throw new ApiError({
        errorCode: ErrorCodeEnum.UNAUTHORIZED,
        statusCode: response.status,
        message: response.statusText,
        url,
      });
    }

    return response.json();
  };
};
