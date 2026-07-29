import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { gearRequestSchema } from '@/lib/validations/gear';
import { checkRateLimit, callerIp } from '@/lib/rate-limit';
import { ensureProfile } from '@/lib/profile';

// The form is open to signed-out visitors on purpose, so the only thing
// standing between it and a scripted flood is this counter.
const REQUESTS_PER_HOUR = 5;

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        const { allowed } = await checkRateLimit(
            'gear-requests',
            userId || callerIp(request),
            REQUESTS_PER_HOUR,
            60 * 60
        );
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();

        // Validation with Zod
        const result = gearRequestSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { equipment_type, equipment_name, additional_info, email } = result.data;

        // gear_requests.user_id references profiles(id); signed-out visitors
        // store null there, which the foreign key allows.
        const requestUserId = userId && await ensureProfile(userId) ? userId : null;

        // Insert into Supabase
        const { data, error } = await getSupabaseAdmin()
            .from('gear_requests')
            .insert({
                user_id: requestUserId,
                equipment_type,
                equipment_name: equipment_name || null,
                additional_info: additional_info || null,
                email,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { error: 'Failed to submit request' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Your gear request has been submitted successfully!',
            data
        });

    } catch (error) {
        console.error('Gear request error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user's gear requests
        const { data, error } = await getSupabaseAdmin()
            .from('gear_requests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch requests' },
                { status: 500 }
            );
        }

        return NextResponse.json({ requests: data });

    } catch (error) {
        console.error('Gear request fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
