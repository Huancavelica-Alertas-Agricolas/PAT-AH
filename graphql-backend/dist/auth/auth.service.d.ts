import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    constructor(usersService: UsersService);
    register(data: any): Promise<{
        token: string;
        user: any;
    }>;
    login(phone: string, password: string): Promise<{
        token: string;
        user: any;
    }>;
    signToken(userId: string): string;
}
