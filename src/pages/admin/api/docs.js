import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminRequest } from './client';

const docsKey = ['admin', 'docs'];

export const useDocs = () =>
  useQuery({
    queryKey: docsKey,
    queryFn: () => adminRequest('admin/docs'),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

export const fetchDocPdf = (token) =>
  adminRequest(`admin/docs/${token}/pdf`, { responseType: 'bytes' });

export function useCreateDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pdfBytes, templateId, clientName, signatureFields, signDateFields = [] }) => {
      const formData = new FormData();
      formData.append('file', new Blob([pdfBytes], { type: 'application/pdf' }), 'prepared.pdf');
      formData.append('meta', JSON.stringify({ templateId, clientName, signatureFields, signDateFields }));
      return adminRequest('admin/docs', { method: 'POST', formData });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: docsKey }),
  });
}

export function useDeleteDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token) => adminRequest(`admin/docs/${token}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: docsKey }),
  });
}

export function useResendDocEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token) => adminRequest(`admin/docs/${token}/resend`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: docsKey }),
  });
}

export const signUrl = (token) => `${window.location.origin}/sign/${token}`;
