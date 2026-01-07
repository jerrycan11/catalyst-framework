import CatalystController from '@/backend/Http/Controllers/CatalystController';
import { NextRequest } from 'next/server';

export async function GET(_request: NextRequest) {
    return CatalystController.index();
}
