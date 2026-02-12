import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        const body = await request.json();

        const { equipment_type, equipment_name, additional_info, email } = body;

        // Validation
        if (!equipment_type) {
            return NextResponse.json(
                { error: 'Equipment type is required' },
                { status: 400 }
            );
        }

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Additional info character limit
        if (additional_info && additional_info.length > 300) {
            return NextResponse.json(
                { error: 'Additional info must be 300 characters or less' },
                { status: 400 }
            );
        }

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
