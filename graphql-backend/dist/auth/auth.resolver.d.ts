import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
export declare class AuthResolver {
    private authService;
    constructor(authService: AuthService);
    register(input: RegisterInput): Promise<{
        token: string;
        user: any;
    }>;
    login(phone: string, password: string): Promise<{
        token: string;
        user: any;
    }>;
}
