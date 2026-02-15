
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking database content...');

    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    const blogs = await prisma.blog.findMany();
    console.log(`Found ${blogs.length} blogs:`);
    blogs.forEach(blog => {
        console.log(`- ID: ${blog.id}, Slug: ${blog.slug}, Title: ${blog.title}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
