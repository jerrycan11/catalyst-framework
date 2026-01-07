import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/backend/Services/Config';
import { Log } from '@/backend/Services/Logger';
import { AuthServiceProvider } from '@/backend/Providers/AuthServiceProvider';
import { Gate } from '@/backend/Services/Gate';

export class CatalystController {
    /**
     * Show the Telescope dashboard data
     */
    async index(): Promise<NextResponse> {
        // Ensure gates are defined
        AuthServiceProvider.boot();
        
        const gate = Gate.getInstance();

        if (await gate.denies('viewTelescope')) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Return system diagnostics
        return NextResponse.json({
            app: {
                name: config('app.name'),
                env: config('app.env'),
                debug: config('app.debug'),
                timezone: config('app.timezone'),
                locale: config('app.locale'),
            },
            system: {
                node_version: process.version,
                platform: process.platform,
                memory_usage: process.memoryUsage(),
                uptime: process.uptime(),
            },
            database: {
                default: config('database.default'),
            },
            logs: await Log.getLogs(100),
        });
    }
}

const catalystController = new CatalystController();
export default catalystController;
