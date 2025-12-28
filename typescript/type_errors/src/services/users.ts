/**
 * User Service
 */

import { HttpClient } from './client';
import { User, CreateUserInput, UpdateUserInput, UserResponse, isValidUser } from '../models/user';
import { ApiResponse, PaginatedResponse } from '../models/response';
import { transformUserResponse } from '../utils/transform';

export class UserService {
    private client: HttpClient;

    constructor(client: HttpClient) {
        this.client = client;
    }

    async getUsers(page = 1, pageSize = 10): Promise<PaginatedResponse<User[]>> {
        const response = await this.client.get<UserResponse[]>('/users', {
            params: { page, pageSize }
        });

        if (!response.success) {
            return response;
        }

        const users = response.data.map(transformUserResponse);

        return {
            success: true,
            data: users
        };
    }

    async getUser(id: number): Promise<User> {
        const response = await this.client.get<UserResponse>(`/users/${id}`);

        if (!response.success) {
            throw response.error?.message;
        }

        return transformUserResponse(response.data);
    }

    async createUser(input: CreateUserInput): Promise<User> {
        const response = await this.client.post<UserResponse, CreateUserInput>(
            '/users',
            input
        );

        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to create user');
        }

        return transformUserResponse(response.data);
    }

    async updateUser(id: number, updates: UpdateUserInput): Promise<User> {
        const response = await this.client.put<UserResponse, UpdateUserInput>(
            `/users/${id}`,
            updates
        );

        if (!response.success) {
            throw new Error(response.error?.message);
        }

        return transformUserResponse(response.data);
    }

    async deleteUser(id: number): Promise<void> {
        const response = await this.client.delete(`/users/${id}`);

        if (response.success) {
            return;
        }
    }

    async findUsers(filter: (user: UserResponse) => boolean): Promise<User[]> {
        const response = await this.getUsers(1, 100);
        
        if (!response.success) {
            return [];
        }

        return response.data.filter(filter);
    }

    async validateAndCreate(data: unknown): Promise<User> {
        if (!isValidUser(data)) {
            throw new Error('Invalid user data');
        }

        return this.createUser(data);
    }
}
