// Auth Use Cases
import { userRepository } from '../../infrastructure/repositories';
import { refreshTokenRepository } from '../../infrastructure/repositories';
import { jwtService, passwordService, AuthTokens, TokenPayload } from '../../infrastructure/auth';
import { UserWithoutPassword, toUserWithoutPassword } from '../../domain/entities/User';

export interface RegisterInput {
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResult {
    user: UserWithoutPassword;
    tokens: AuthTokens;
}

export class AuthUseCases {
    async register(input: RegisterInput): Promise<AuthResult> {
        // Check if user exists
        const existing = await userRepository.findByEmail(input.email);
        if (existing) {
            throw new Error('Email already registered');
        }

        // Hash password and create user
        const passwordHash = await passwordService.hash(input.password);
        const user = await userRepository.create({
            email: input.email,
            passwordHash,
            role: 'OWNER',
        });

        // Generate tokens
        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const tokens = jwtService.generateTokens(payload);

        // Store refresh token
        await refreshTokenRepository.create(
            user.id,
            tokens.refreshToken,
            jwtService.getRefreshTokenExpiry()
        );

        return {
            user: toUserWithoutPassword(user),
            tokens,
        };
    }

    async login(input: LoginInput): Promise<AuthResult> {
        // Find user
        const user = await userRepository.findByEmail(input.email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValid = await passwordService.verify(input.password, user.passwordHash);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        // Generate tokens
        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const tokens = jwtService.generateTokens(payload);

        // Store refresh token
        await refreshTokenRepository.create(
            user.id,
            tokens.refreshToken,
            jwtService.getRefreshTokenExpiry()
        );

        return {
            user: toUserWithoutPassword(user),
            tokens,
        };
    }

    async refresh(refreshToken: string): Promise<AuthTokens> {
        // Verify token
        const payload = jwtService.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new Error('Invalid refresh token');
        }

        // Check if token exists in DB
        const storedToken = await refreshTokenRepository.findByToken(refreshToken);
        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new Error('Refresh token expired or revoked');
        }

        // Get fresh user data
        const user = await userRepository.findById(payload.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Delete old token
        await refreshTokenRepository.deleteByToken(refreshToken);

        // Generate new tokens
        const newPayload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const tokens = jwtService.generateTokens(newPayload);

        // Store new refresh token
        await refreshTokenRepository.create(
            user.id,
            tokens.refreshToken,
            jwtService.getRefreshTokenExpiry()
        );

        return tokens;
    }

    async logout(refreshToken: string): Promise<void> {
        await refreshTokenRepository.deleteByToken(refreshToken);
    }

    async logoutAll(userId: string): Promise<void> {
        await refreshTokenRepository.deleteAllForUser(userId);
    }
}

export const authUseCases = new AuthUseCases();
