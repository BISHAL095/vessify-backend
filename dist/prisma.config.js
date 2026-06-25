import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
config({ override: false });
export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: process.env.DATABASE_URL, // single URL for everything
    },
});
//# sourceMappingURL=prisma.config.js.map