import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export class BaseApiRoute {
    constructor({ 
        actionName = 'api-action', 
        rateLimitMax = 30, 
        rateLimitWindow = 60_000, 
        requireAuth = false,
        requireAdmin = false,
        verifyCsrf = true
    } = {}) {
        this.actionName = actionName;
        this.rateLimitMax = rateLimitMax;
        this.rateLimitWindow = rateLimitWindow;
        this.requireAuth = requireAuth;
        this.requireAdmin = requireAdmin;
        this.shouldVerifyCsrf = verifyCsrf;
    }

    verifyCsrf(req) {
        if (!this.shouldVerifyCsrf) return null;
        
        const xRequestedWith = req.headers.get('x-requested-with');
        const xClientInfo = req.headers.get('x-client-info');
        const authorization = req.headers.get('authorization');
        
        // Anti-CSRF: Require a custom header that cannot be set by simple cross-origin forms
        if (!xRequestedWith && !xClientInfo && !authorization) {
            return NextResponse.json({ 
                success: false, 
                error: 'Forbidden: Missing custom client headers required for Anti-CSRF protection.' 
            }, { status: 403 });
        }
        
        return null;
    }

    applyRateLimit(req) {
        if (this.rateLimitMax <= 0) return null; // 0 means no limit

        const ip = getClientIp(req);
        const { allowed } = rateLimit(`${this.actionName}:${ip}`, this.rateLimitMax, this.rateLimitWindow);
        if (!allowed) {
            return NextResponse.json(
                { success: false, error: 'Too many requests. Please wait a moment.' },
                { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
            );
        }
        return null;
    }

    getSupabaseAdmin() {
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );
    }

    getSupabaseAnon() {
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
    }

    async authenticate(req) {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { errorResponse: NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 }) };
        }

        const token = authHeader.replace('Bearer ', '');
        const supabaseAnon = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            { global: { headers: { Authorization: `Bearer ${token}` } } }
        );

        const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
        if (error || !user) {
            return { errorResponse: NextResponse.json({ success: false, error: 'Invalid session or user token' }, { status: 401 }) };
        }

        return { user, token, supabaseAnon };
    }

    /**
     * Abstract method. Subclasses must implement this.
     * @param {Request} request 
     * @param {Object} ctx Context payload containing supabase clients, user info, etc.
     */
    async execute(request, ctx) {
        throw new Error('execute() must be implemented by subclass');
    }

    /**
     * Primary handler to wrap the route logic in security middleware.
     * @param {Request} req 
     */
    async handle(req) {
        try {
            const csrfError = this.verifyCsrf(req);
            if (csrfError) return csrfError;

            const rateLimitError = this.applyRateLimit(req);
            if (rateLimitError) return rateLimitError;

            const ctx = {
                anonClient: this.getSupabaseAnon()
            };

            if (this.requireAuth || this.requireAdmin) {
                const authResult = await this.authenticate(req);
                if (authResult.errorResponse) return authResult.errorResponse;
                
                ctx.user = authResult.user;
                ctx.token = authResult.token;
                ctx.userClient = authResult.supabaseAnon;
            }

            if (this.requireAdmin) {
                if (ctx.user.id !== process.env.ADMIN_USER_UUID) {
                    return NextResponse.json({ success: false, error: 'Forbidden: Admin access required.' }, { status: 403 });
                }
                ctx.adminClient = this.getSupabaseAdmin();
            } else {
                ctx.adminClient = null;
            }

            return await this.execute(req, ctx);
        } catch (error) {
            console.error(`Error in ${this.actionName} route:`, error);
            return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
        }
    }
}
