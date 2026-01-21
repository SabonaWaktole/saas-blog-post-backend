// JWT Authentication Service
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from '../../config';

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export class JwtService {
    private readonly accessSecret: string;
    private readonly refreshSecret: string;
    private readonly accessExpiresIn: string;
    private readonly refreshExpiresIn: string;

    constructor() {
        this.accessSecret = config.jwt.secret;
        this.refreshSecret = config.jwt.refreshSecret;
        this.accessExpiresIn = config.jwt.accessExpiresIn;
        this.refreshExpiresIn = config.jwt.refreshExpiresIn;
    }

    generateTokens(payload: TokenPayload): AuthTokens {
        const accessToken = jwt.sign(payload, this.accessSecret, {
            expiresIn: this.accessExpiresIn,
        } as SignOptions);

        const refreshToken = jwt.sign(payload, this.refreshSecret, {
            expiresIn: this.refreshExpiresIn,
        } as SignOptions);

        return { accessToken, refreshToken };
    }

    verifyAccessToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, this.accessSecret) as JwtPayload & TokenPayload;
            return {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            };
        } catch {
            return null;
        }
    }

    verifyRefreshToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, this.refreshSecret) as JwtPayload & TokenPayload;
            return {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            };
        } catch {
            return null;
        }
    }

    decodeToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.decode(token) as JwtPayload & TokenPayload;
            if (!decoded) return null;
            return {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            };
        } catch {
            return null;
        }
    }

    getRefreshTokenExpiry(): Date {
        // Parse the refresh token expiry string (e.g., "7d" -> 7 days)
        const match = this.refreshExpiresIn.match(/^(\d+)([dhms])$/);
        if (!match) {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
        }

        const value = parseInt(match[1], 10);
        const unit = match[2];

        let ms: number;
        switch (unit) {
            case 'd': ms = value * 24 * 60 * 60 * 1000; break;
            case 'h': ms = value * 60 * 60 * 1000; break;
            case 'm': ms = value * 60 * 1000; break;
            case 's': ms = value * 1000; break;
            default: ms = 7 * 24 * 60 * 60 * 1000;
        }

        return new Date(Date.now() + ms);
    }
}

export const jwtService = new JwtService();
