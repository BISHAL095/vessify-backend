import type { Context, Next } from 'hono';
import { auth } from '../lib/auth.js';
export type AuthVariables = {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
};
export declare function authMiddleware(c: Context<{
    Variables: AuthVariables;
}>, next: Next): Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 403, "json">) | undefined>;
//# sourceMappingURL=auth.d.ts.map