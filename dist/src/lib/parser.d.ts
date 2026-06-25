import { Prisma } from '@prisma/client';
type ParsedTransaction = {
    description: string;
    amount: Prisma.Decimal;
    date: Date;
    confidence: number;
};
export declare function parseTransaction(text: string): ParsedTransaction;
export {};
//# sourceMappingURL=parser.d.ts.map