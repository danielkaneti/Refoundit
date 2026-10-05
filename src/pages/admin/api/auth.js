import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminRequest } from './client';

export const sessionKey = ['admin', 'session'];

export const useSession = () =>
  useQuery({
    queryKey: sessionKey,
    queryFn: () => adminRequest('auth/session'),
    staleTime: 0,
  });

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (password) => adminRequest('auth/login', { method: 'POST', json: { password } }),
    onSuccess: (data) => queryClient.setQueryData(sessionKey, data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminRequest('auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['admin'] });
      queryClient.setQueryData(sessionKey, { authenticated: false });
    },
  });
}
