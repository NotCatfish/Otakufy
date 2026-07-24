import { NextResponse } from 'next/server';
import { BaseApiRoute } from '@/lib/BaseApiRoute';

class ChangeEmailRoute extends BaseApiRoute {
  constructor() {
    super({
      actionName: 'change-email',
      rateLimitMax: 5,
      requireAuth: true,
      requireAdmin: false,
      verifyCsrf: true
    });
  }

  async execute(request, ctx) {
    const { user: currentUser, token, userClient: supabaseAnon } = ctx;

    const { targetEmail } = await request.json().catch(() => ({}));

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json({ success: false, error: 'Invalid target email' }, { status: 400 });
    }

    const cleanTargetEmail = targetEmail.toLowerCase().trim();

    if (currentUser.email.toLowerCase() === cleanTargetEmail) {
      return NextResponse.json({ success: false, error: 'New email must be different from current email.' }, { status: 400 });
    }

    // Securely update user email
    let updatedUser = null;
    let verificationMessage = '';

    const gotrueRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email: cleanTargetEmail })
    });

    const updatedData = await gotrueRes.json();
    if (!gotrueRes.ok) {
      throw new Error(`Email dispatch failed: ${updatedData.msg || updatedData.message || 'Unknown error'}`);
    }
    updatedUser = updatedData || currentUser;

    // Unlink any non-email identities (like Google) so the old OAuth account can't access this profile anymore
    if (currentUser.identities && Array.isArray(currentUser.identities)) {
      for (const identity of currentUser.identities) {
        if (identity.provider !== 'email') {
          const { error: unlinkError } = await supabaseAnon.auth.unlinkIdentity(identity);
          if (unlinkError) {
            console.error(`Failed to unlink identity ${identity.provider}:`, unlinkError);
          }
        }
      }
    }

    verificationMessage = `Verification Mail Sent! We've dispatched a confirmation link to ${cleanTargetEmail}. Check your primary inbox (or spam/promotions folder) to confirm your new address.`;

    return NextResponse.json({
      success: true,
      instant: false,
      message: verificationMessage,
      user: updatedUser
    });
  }
}

const route = new ChangeEmailRoute();
export const POST = (req) => route.handle(req);
