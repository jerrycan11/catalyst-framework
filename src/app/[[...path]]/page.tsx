import { notFound } from 'next/navigation';
import { ElementType } from 'react';
import routes from '@/resources/routes/web';
import { requireAuth, requireGuest } from '@/backend/Http/Middleware/AuthMiddleware';

type Props = {
    params: Promise<{ path?: string[] }>;
};

export default async function CatchAllRoute({ params }: Props) {
    const resolvedParams = await params;
    
    // Construct the path (e.g., /dashboard, /login)
    // If undefined calls (home), default to '/'
    const pathSegments = resolvedParams.path || [];
    const currentPath = pathSegments.length === 0 ? '/' : `/${pathSegments.join('/')}`;

    const route = routes[currentPath];

    if (!route) {
        notFound();
    }

    // Apply Middleware
    if (route.middleware) {
        if (route.middleware.includes('auth')) {
            await requireAuth();
        }
        if (route.middleware.includes('guest')) {
            await requireGuest();
        }
    }

    // Render Component
    const Component = route.component as ElementType;
    let content = <Component params={resolvedParams} />;

    // Wrap in Layout if exists
    if (route.layout) {
        const Layout = route.layout as ElementType;
        content = <Layout>{content}</Layout>;
    }

    return content;
}

// Generate Metadata (Optional but recommended)
export async function generateMetadata({ params }: Props) {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const currentPath = pathSegments.length === 0 ? '/' : `/${pathSegments.join('/')}`;

    // Basic metadata mapping (expand as needed)
    const titleMap: Record<string, string> = {
        '/': 'Home',
        '/login': 'Login',
        '/register': 'Register',
        '/dashboard': 'Dashboard',
        '/docs': 'Documentation',
    };

    return {
        title: titleMap[currentPath] ? `${titleMap[currentPath]} | Catalyst` : 'Catalyst',
    };
}
