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

const officeSettingsKey = ['admin', 'settings', 'office'];

/** Defaults for the bundle cover letter until the office details are saved. */
export const OFFICE_DEFAULTS = {
  officeName: 'מתן אלקבץ',
  contactName: 'מתן אלקבץ',
  contactTitle: 'רו"ח',
  tagline: 'רואה חשבון בגישה חדשנית',
  phone: '050-993-6301',
  email: 'info@refoundit.co.il',
  address: '',
  bodyText: 'מצ"ב חבילת המסמכים המוגשת לצורך בדיקת והגשת הדוח השנתי.',
  closingText: 'בכבוד רב,',
  primaryColor: '#1e3a5f',
};

export const useOfficeSettings = () =>
  useQuery({
    queryKey: officeSettingsKey,
    queryFn: async () => ({ ...OFFICE_DEFAULTS, ...(await adminRequest('admin/settings/office')) }),
    staleTime: Infinity,
  });

export function useSaveOfficeSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings) => adminRequest('admin/settings/office', { method: 'PUT', json: settings }),
    onSuccess: (data) => queryClient.setQueryData(officeSettingsKey, { ...OFFICE_DEFAULTS, ...data }),
  });
}
