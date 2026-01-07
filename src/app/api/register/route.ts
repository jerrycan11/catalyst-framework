
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database';
import { users } from '@/database/schema';
import { hashPassword } from '@/backend/Services/Auth';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await db()
            .select()
            .from(users)
            .where(eq(users.email, email))
            .get();

        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 409 }
            );
        }

        // Create new user
        const newUser = {
            id: nanoid(),
            name,
            email,
            password: hashPassword(password),
            created_at: new Date(),
            updated_at: new Date(),
        };

        await db().insert(users).values(newUser);

        return NextResponse.json(
            { message: 'User registered successfully', user: { id: newUser.id, name: newUser.name, email: newUser.email } },
            { status: 201 }
        );

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
