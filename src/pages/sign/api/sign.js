import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@utils/api';

const signKey = (token) => ['sign', token];

const noRetryOnClientError = (count, err) => !(err.status >= 400 && err.status < 500) && count < 2;

export const useSignDocument = (token) =>
  useQuery({
    queryKey: signKey(token),
    queryFn: () => apiRequest(`sign/${token}`),
    enabled: Boolean(token),
    retry: noRetryOnClientError,
    staleTime: 0,
  });

export const useSignPdf = (token, status) =>
  useQuery({
    queryKey: [...signKey(token), 'pdf', status],
    queryFn: () => apiRequest(`sign/${token}/pdf`, { responseType: 'bytes' }),
    enabled: Boolean(token && status),
    retry: noRetryOnClientError,
    staleTime: Infinity,
  });

export function useSubmitSignature(token) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ signature }) =>
      apiRequest(`sign/${token}`, { method: 'POST', json: { signature, consent: true } }),
    onSuccess: (data) => queryClient.setQueryData(signKey(token), data),
  });
}
