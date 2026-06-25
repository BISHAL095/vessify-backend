import { defineConfig } from 'prisma/config';
import * as fs from 'fs';
import * as path from 'path';
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
        const [key, ...rest] = line.split('=');
        if (key && rest.length) {
            process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
        }
    }
}
loadEnv();
export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: process.env.DATABASE_URL, // single URL for everything
    },
});
//# sourceMappingURL=prisma.config.js.map