/**
 * Frontend Logging API Endpoint
 *
 * Receives log messages from the frontend and writes them to the central logger.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Log } from '@/backend/Services/Logger';
import { LogLevel } from '../../../../config/logging';

interface LogRequestBody {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const validLevels: LogLevel[] = [
  'emergency',
  'alert',
  'critical',
  'error',
  'warning',
  'notice',
  'info',
  'debug',
];

export async function POST(request: NextRequest) {
  try {
    const body: LogRequestBody = await request.json();
    const { level, message, context = {}, error } = body;

    // Validate required fields
    if (!level || !message) {
      return NextResponse.json(
        { message: 'Missing required fields: level, message' },
        { status: 400 }
      );
    }

    // Validate log level
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { message: `Invalid log level. Must be one of: ${validLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Convert error object back to Error instance if present
    let errorInstance: Error | undefined;
    if (error) {
      errorInstance = new Error(error.message);
      errorInstance.name = error.name;
      errorInstance.stack = error.stack;
    }

    // Add request metadata to context
    const enrichedContext = {
      ...context,
      userAgent: request.headers.get('user-agent') || 'unknown',
      url: request.headers.get('referer') || 'unknown',
    };

    // Log using the central logger
    Log.fromFrontend(level, message, enrichedContext, errorInstance);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Logging API error:', err);
    return NextResponse.json(
      { message: 'Failed to process log request' },
      { status: 500 }
    );
  }
}
