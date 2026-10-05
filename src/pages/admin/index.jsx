import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sessionKey, useSession } from './api/auth';
import { UNAUTHORIZED_EVENT } from './api/client';
import AdminShell from './components/AdminShell';
import DocsView from './components/DocsView';
import LoginForm from './components/LoginForm';
import NewDocView from './components/NewDocView';
import TemplateEditor from './components/TemplateEditor';
import TemplatesView from './components/TemplatesView';
import SettingsView from './components/SettingsView';
import { Muted } from './components/styles';

/**
 * Single-user admin portal at /admin.
 * view: 'docs' | 'newDoc' | 'templates' | 'editTemplate' | 'settings'
 */
export default function AdminApp() {
  const queryClient = useQueryClient();
  const session = useSession();
  const [view, setView] = useState({ name: 'docs' });

  useEffect(() => {
    document.title = 'פורטל ניהול | REFOUNDIT';
    const handleUnauthorized = () => queryClient.invalidateQueries({ queryKey: sessionKey });
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [queryClient]);

  const showDocs = useCallback(() => setView({ name: 'docs' }), []);
  const showNewDoc = useCallback(() => setView({ name: 'newDoc' }), []);
  const showTemplates = useCallback(() => setView({ name: 'templates' }), []);
  const editTemplate = useCallback((templateId) => setView({ name: 'editTemplate', templateId }), []);
  const handleTabChange = useCallback((tab) => setView({ name: tab }), []);

  if (session.isLoading) return <Muted role="status">טוען…</Muted>;
  if (!session.data?.authenticated) return <LoginForm />;

  const activeTab =
    view.name === 'editTemplate' ? 'templates' : view.name === 'newDoc' ? 'docs' : view.name;

  return (
    <AdminShell activeTab={activeTab} onTabChange={handleTabChange}>
      {view.name === 'docs' && <DocsView onNew={showNewDoc} />}
      {view.name === 'newDoc' && <NewDocView onDone={showDocs} />}
      {view.name === 'templates' && <TemplatesView onEdit={editTemplate} />}
      {view.name === 'editTemplate' && <TemplateEditor templateId={view.templateId} onBack={showTemplates} />}
      {view.name === 'settings' && <SettingsView />}
    </AdminShell>
  );
}
