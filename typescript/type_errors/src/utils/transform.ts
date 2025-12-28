/**
 * Data Transformation Utilities
 */

import { User, UserResponse, UserRole } from '../models/user';

export function transformUserResponse(response: UserResponse): User {
    return {
        id: response.user_id,
        name: response.username,
        email: response.email,
        role: response.role as UserRole,
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at)
    };
}

export function formatUserName(user: User): string {
    if (user.profile.avatar) {
        return `${user.name} (${user.profile.avatar})`;
    }
    return user.name;
}

export function transformArray<T, R>(
    items: T[],
    transformer: (item: T) => R
): R[] {
    return items.map(transformer);
}

export function mergeUserUpdates(user: User, updates: Partial<User>): User {
    return {
        ...user,
        ...updates,
        updatedAt: new Date()
    };
}

export function isUserRole(value: string): value is UserRole {
    return ['admin', 'user', 'guest', 'moderator'].includes(value);
}

export function normalizeRole(role: string): UserRole;
export function normalizeRole(role: undefined): undefined;
export function normalizeRole(role: string | undefined): UserRole | undefined {
    if (!role) {
        return 'guest';
    }
    
    const normalized = role.toLowerCase();
    
    if (isUserRole(normalized)) {
        return normalized;
    }
    
    return 'user';
}

type UserTransformer = (user: User) => User;

export function applyTransformers(
    user: User,
    transformers: UserTransformer[]
): User {
    return transformers.reduce(
        (result, transformer) => transformer(result),
        user
    );
}

type UserSummary = Pick<User, 'id' | 'name' | 'email' | 'avatar'>;

export function toUserSummary(user: User): UserSummary {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.profile?.avatar
    };
}
