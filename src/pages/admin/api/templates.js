import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminRequest } from './client';

const templatesKey = ['admin', 'templates'];

export const useTemplates = () =>
  useQuery({
    queryKey: templatesKey,
    queryFn: () => adminRequest('admin/templates'),
    staleTime: 0,
  });

export const useTemplatePdf = (id) =>
  useQuery({
    queryKey: [...templatesKey, id, 'pdf'],
    queryFn: () => adminRequest(`admin/templates/${id}/pdf`, { responseType: 'bytes' }),
    enabled: Boolean(id),
    staleTime: Infinity,
  });

export function useUploadTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, file, presetId }) => {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('file', file);
      if (presetId) formData.append('preset', presetId);
      return adminRequest('admin/templates', { method: 'POST', formData });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: templatesKey }),
  });
}

export function useSaveTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, fields }) =>
      adminRequest(`admin/templates/${id}`, { method: 'PUT', json: { name, fields } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: templatesKey }),
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminRequest(`admin/templates/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: templatesKey }),
  });
}
