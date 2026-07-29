import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import { NextResponse } from "next/server";

const GEAR_TYPES = ["rig", "pedal", "multifx"] as const;
type GearType = (typeof GEAR_TYPES)[number];

// Postgres/PostgREST codes for "column doesn't exist" — surfaced when
// scripts/sql/add_gear_types.sql hasn't been run against the database yet
const MISSING_COLUMN_CODES = ["42703", "PGRST204"];

function isMissingColumn(error: { code?: string; message?: string } | null) {
    if (!error) return false;
    return MISSING_COLUMN_CODES.includes(error.code || "") ||
        /column .* does not exist/i.test(error.message || "");
}

function trim(v: unknown, max: number): string {
    return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const typeFilter = new URL(req.url).searchParams.get("type");

        let query = getSupabaseAdmin()
            .from('user_equipment')
            .select('*')
            .eq('user_id', userId);

        if (typeFilter && (GEAR_TYPES as readonly string[]).includes(typeFilter)) {
            query = query.eq('type', typeFilter);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // Rows written before the gear-type migration have no `type`; they are rigs.
        return NextResponse.json((data || []).map((row: Record<string, unknown>) => ({
            ...row,
            type: row.type || "rig",
        })));
    } catch (error) {
        console.error("Error fetching equipment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const type: GearType = (GEAR_TYPES as readonly string[]).includes(body?.type)
            ? body.type
            : "rig";

        const name = trim(body?.name, 120);
        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // user_equipment.user_id references profiles(id)
        if (!await ensureProfile(userId)) {
            return NextResponse.json({ error: "Could not set up your account" }, { status: 500 });
        }

        const row: Record<string, unknown> = { user_id: userId, name, type };

        if (type === "rig") {
            row.guitar_model = trim(body?.guitar_model, 120);
            row.amp_model = trim(body?.amp_model, 120);
            row.pickup_type = trim(body?.pickup_type, 80);
        } else {
            row.brand = trim(body?.brand, 80);
            row.notes = trim(body?.notes, 300);
            if (type === "pedal") row.category = trim(body?.category, 40);
        }

        const { data, error } = await getSupabaseAdmin()
            .from('user_equipment')
            .insert(row)
            .select()
            .single();

        if (error) {
            if (isMissingColumn(error)) {
                console.error("user_equipment is missing the gear-type columns:", error);
                return NextResponse.json(
                    { error: "Gear storage isn't migrated yet. Run scripts/sql/add_gear_types.sql in Supabase." },
                    { status: 503 }
                );
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error adding equipment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
