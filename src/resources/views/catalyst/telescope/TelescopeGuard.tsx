import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default function TelescopeGuard({ children }: { children: ReactNode }) {
    // Only allow in local environment (development or test)
    const isLocal = process.env.NODE_ENV !== 'production';

    if (!isLocal) {
        redirect('/');
    }

    return <>{children}</>;
}
