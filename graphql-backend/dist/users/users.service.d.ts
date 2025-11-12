import { PrismaService } from '../prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<any>;
    findByPhone(phone: string): Promise<any>;
    findAll(): Promise<any>;
}
