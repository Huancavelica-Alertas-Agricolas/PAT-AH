import { AuthService } from '../auth/auth.service';
export declare class RestController {
    private authService;
    constructor(authService: AuthService);
    login(body: {
        phone: string;
        password: string;
    }): Promise<{
        success: boolean;
        message: string;
        token?: undefined;
        user?: undefined;
    } | {
        success: boolean;
        token: string;
        user: any;
        message?: undefined;
    }>;
    createUser(body: any): Promise<{
        success: boolean;
        message: string;
        user?: undefined;
    } | {
        success: boolean;
        user: any;
        message?: undefined;
    }>;
}
