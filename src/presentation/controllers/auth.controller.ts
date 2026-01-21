// Auth Controller
import { Request, Response } from 'express';
import { authUseCases } from '../../application/auth';

export class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        const result = await authUseCases.register(req.body);
        res.status(201).json(result);
    }

    async login(req: Request, res: Response): Promise<void> {
        const result = await authUseCases.login(req.body);
        res.json(result);
    }

    async refresh(req: Request, res: Response): Promise<void> {
        const { refreshToken } = req.body;
        const tokens = await authUseCases.refresh(refreshToken);
        res.json(tokens);
    }

    async logout(req: Request, res: Response): Promise<void> {
        const { refreshToken } = req.body;
        await authUseCases.logout(refreshToken);
        res.status(204).send();
    }

    async me(req: Request, res: Response): Promise<void> {
        res.json({ user: req.user });
    }
}

export const authController = new AuthController();
