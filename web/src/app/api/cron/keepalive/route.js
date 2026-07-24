import { NextResponse } from 'next/server';
import { BaseApiRoute } from '@/lib/BaseApiRoute';

/**
 * Automated Keep-Alive & Database Health Check Endpoint (`/api/cron/keepalive`)
 * 
 * Purpose:
 * Prevents Supabase Free-Tier projects from automatically pausing after 7 days of inactivity
 * by executing a lightweight query against the database on a daily schedule.
 * 
 * Security:
 * Protected by `CRON_SECRET` env variable (automatically passed by Vercel Cron engine or GitHub Actions).
 */
class KeepAliveRoute extends BaseApiRoute {
  constructor() {
    super({
      actionName: 'keepalive',
      rateLimitMax: 0, // No rate limit needed for cron
      requireAuth: false,
      requireAdmin: false,
      verifyCsrf: false // Cron jobs don't have origin headers
    });
  }

  async execute(request, ctx) {
    const authHeader = request.headers.get('authorization');
    const urlSecret = request.nextUrl.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    // Verify secret if CRON_SECRET is configured in environment
    if (cronSecret) {
      const isHeaderValid = authHeader === `Bearer ${cronSecret}`;
      const isParamValid = urlSecret === cronSecret;
      if (!isHeaderValid && !isParamValid) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or missing CRON_SECRET.' }, { status: 401 });
      }
    }

    const { anonClient: supabase } = ctx;

    // Execute ultra-lightweight ping query (fetches 1 profile ID just to keep PostgreSQL active)
    const start = Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    const durationMs = Date.now() - start;

    if (error) {
      console.error("Keep-alive ping database error:", error.message);
      return NextResponse.json({ success: false, error: error.message, duration_ms: durationMs }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase keep-alive ping executed successfully. Project active.',
      timestamp: new Date().toISOString(),
      duration_ms: durationMs,
      rows_checked: data?.length || 0
    });
  }
}

const route = new KeepAliveRoute();
export const GET = (req) => route.handle(req);
