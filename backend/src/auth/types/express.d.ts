import { UserRole } from '../../users/user.entity';

declare module 'express' {
  interface Request {
    user?: {
      userId: number;
      email: string;
      role: UserRole;
    };
  }
}
