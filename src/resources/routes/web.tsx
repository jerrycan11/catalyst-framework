import { ReactNode } from 'react';

// Import Pages
import LandingPage from '@/resources/views/LandingPage';
import LoginPage from '@/resources/views/auth/LoginPage';
import RegisterPage from '@/resources/views/auth/RegisterPage';
import ForgotPasswordPage from '@/resources/views/auth/ForgotPasswordPage';
import DashboardPage from '@/resources/views/dashboard/DashboardPage';
import SettingsPage from '@/resources/views/dashboard/SettingsPage';
import NotificationsPage from '@/resources/views/dashboard/NotificationsPage';
import DocsPage from '@/resources/views/DocsPage';
import TermsPage from '@/resources/views/legal/TermsPage';
import PrivacyPage from '@/resources/views/legal/PrivacyPage';
import TelescopePage from '@/resources/views/catalyst/telescope/index';
import TelescopeGuard from '@/resources/views/catalyst/telescope/TelescopeGuard';

// Import Layouts
import DashboardLayout from '@/resources/views/layouts/DashboardLayout';

type RouteConfig = {
    component: () => ReactNode | Promise<ReactNode>;
    layout?: ({ children }: { children: ReactNode }) => ReactNode | Promise<ReactNode>;
    middleware?: string[];
};

// Route Definitions
const routes: Record<string, RouteConfig> = {
    '/': { component: LandingPage },
    '/login': { component: LoginPage },
    '/register': { component: RegisterPage },
    '/forgot-password': { component: ForgotPasswordPage },
    '/dashboard': { component: DashboardPage, layout: DashboardLayout, middleware: ['auth'] },
    '/dashboard/settings': { component: SettingsPage, layout: DashboardLayout, middleware: ['auth'] },
    '/dashboard/notifications': { component: NotificationsPage, layout: DashboardLayout, middleware: ['auth'] },
    '/docs': { component: DocsPage },
    '/terms': { component: TermsPage },
    '/privacy': { component: PrivacyPage },
    '/_catalyst': { component: TelescopePage, layout: TelescopeGuard },
};

export default routes;
