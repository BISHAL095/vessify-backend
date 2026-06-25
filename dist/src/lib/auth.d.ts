export declare const auth: import("better-auth").Auth<{
    database: (options: import("better-auth").BetterAuthOptions) => import("better-auth").DBAdapter<import("better-auth").BetterAuthOptions>;
    trustedOrigins: string[];
    baseURL: string;
    emailAndPassword: {
        enabled: true;
    };
    user: {
        additionalFields: {
            orgId: {
                type: "string";
                required: false;
            };
        };
    };
}>;
export type AuthVariables = {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
};
//# sourceMappingURL=auth.d.ts.map