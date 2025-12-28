/**
 * User Type Definitions
 */

export interface User {
    id: number;
    name: string;
    email: string;  // Required
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    profile?: UserProfile;
}

export interface UserProfile {
    avatar: string;
    bio: string;
    location?: string;
    website?: string;
}

export type UserRole = 'admin' | 'user' | 'guest';

// but email is required in User but optional here (mismatch)
export interface CreateUserInput {
    name: string;
    email?: string;
    role?: UserRole;
    profile?: Partial<UserProfile>;
}

export interface UpdateUserInput extends Partial<User> {
    // This allows setting id and createdAt which shouldn't be allowed
}

export interface UserResponse {
    user_id: number;
    username: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
}

export function createDefaultUser(): UserResponse {
    return {
        user_id: 0,
        username: 'Guest',
        email: 'guest@example.com',
        role: 'guest',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
}

export function isValidUser(obj: unknown): obj is User {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'name' in obj &&
        'email' in obj
    );
}
