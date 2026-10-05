import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminRequest } from './client';

const ownerSignatureKey = ['admin', 'settings', 'owner-signature'];

/** The representative's stored signature as PNG bytes, or null when not set yet. */
export const useOwnerSignature = () =>
  useQuery({
    queryKey: ownerSignatureKey,
    queryFn: async () => {
      try {
        return await adminRequest('admin/settings/signature', { responseType: 'bytes' });
      } catch (err) {
        if (err.status === 404) return null;
        throw err;
      }
    },
    staleTime: Infinity,
  });

export function useSaveOwnerSignature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dataUrl) =>
      adminRequest('admin/settings/signature', { method: 'PUT', json: { signature: dataUrl } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ownerSignatureKey }),
  });
}

export function useDeleteOwnerSignature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminRequest('admin/settings/signature', { method: 'DELETE' }),
    onSuccess: () => queryClient.setQueryData(ownerSignatureKey, null),
  });
}
