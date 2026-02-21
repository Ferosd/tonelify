import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { gearRequestSchema } from '@/lib/validations/gear';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
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

        // Insert into Supabase
        const { data, error } = await getSupabaseAdmin()
            .from('gear_requests')
            .insert({
                user_id: userId || null,
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
