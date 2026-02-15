
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create User
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
        data: {
            email: 'user@example.com',
            passwordHash: hashedPassword,
            role: 'OWNER',
        },
    });
    console.log(`✅ Created User: ${user.email} (Password: password123)`);

    // 2. Create Blog
    const blog = await prisma.blog.create({
        data: {
            slug: 'default-blog',
            title: 'My Default Blog',
            description: 'This is a sample blog created for testing.',
            ownerId: user.id,
        },
    });
    console.log(`✅ Created Blog: ${blog.title} (Slug: ${blog.slug})`);

    // 3. Create a Post
    const post = await prisma.post.create({
        data: {
            title: 'Hello World',
            slug: 'hello-world',
            content: '## Welcome to your new blog!\n\nThis is a sample post.',
            status: 'PUBLISHED',
            publishedAt: new Date(),
            authorId: user.id,
            blogId: blog.id,
            readTimeMinutes: 1,
        },
    });
    console.log(`✅ Created Post: ${post.title} (Slug: ${post.slug})`);

    console.log('\n🎉 Database seeded successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
