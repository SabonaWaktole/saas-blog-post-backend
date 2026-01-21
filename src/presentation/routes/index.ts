// Route definitions
import { Router } from 'express';
import multer from 'multer';
import {
    authController,
    blogController,
    postController,
    taxonomyController,
    interactionController,
    analyticsController,
    uploadController,
    authorController,
} from '../controllers';
import {
    authMiddleware,
    optionalAuthMiddleware,
    validate,
    asyncHandler,
} from '../middlewares';
import {
    registerSchema,
    loginSchema,
    refreshSchema,
    createBlogSchema,
    updateBlogSchema,
    createPostSchema,
    updatePostSchema,
    bulkStatusSchema,
    createCategorySchema,
    updateCategorySchema,
    createTagSchema,
    trackReadTimeSchema,
} from '../validators';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// ============== Health Check ==============
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============== Auth Routes ==============
router.post('/auth/register', validate(registerSchema), asyncHandler(authController.register.bind(authController)));
router.post('/auth/login', validate(loginSchema), asyncHandler(authController.login.bind(authController)));
router.post('/auth/refresh', validate(refreshSchema), asyncHandler(authController.refresh.bind(authController)));
router.post('/auth/logout', asyncHandler(authController.logout.bind(authController)));
router.get('/auth/me', authMiddleware, asyncHandler(authController.me.bind(authController)));

// ============== Blog Routes ==============
router.post('/blogs', authMiddleware, validate(createBlogSchema), asyncHandler(blogController.create.bind(blogController)));
router.get('/blogs/my', authMiddleware, asyncHandler(blogController.listMy.bind(blogController)));
router.get('/blogs/:slug', asyncHandler(blogController.getBySlug.bind(blogController)));
router.put('/blogs/:id', authMiddleware, validate(updateBlogSchema), asyncHandler(blogController.update.bind(blogController)));
router.delete('/blogs/:id', authMiddleware, asyncHandler(blogController.delete.bind(blogController)));

// ============== Post Routes ==============
// Author routes (require auth)
router.post('/blogs/:blogId/posts', authMiddleware, validate(createPostSchema), asyncHandler(postController.create.bind(postController)));
router.get('/blogs/:blogId/posts', authMiddleware, asyncHandler(postController.listByBlog.bind(postController)));
router.put('/posts/:id', authMiddleware, validate(updatePostSchema), asyncHandler(postController.update.bind(postController)));
router.patch('/posts/:id/publish', authMiddleware, asyncHandler(postController.publish.bind(postController)));
router.patch('/posts/:id/archive', authMiddleware, asyncHandler(postController.archive.bind(postController)));
router.patch('/posts/:id/unpublish', authMiddleware, asyncHandler(postController.unpublish.bind(postController)));
router.post('/posts/bulk-status', authMiddleware, validate(bulkStatusSchema), asyncHandler(postController.bulkUpdateStatus.bind(postController)));
router.delete('/posts/:id', authMiddleware, asyncHandler(postController.delete.bind(postController)));
router.get('/posts/:id/related', asyncHandler(postController.getRelated.bind(postController)));

// Public routes
router.get('/public/blogs/:blogSlug/posts', asyncHandler(postController.listPublished.bind(postController)));
router.get('/public/blogs/:blogSlug/posts/:postSlug', asyncHandler(postController.getBySlug.bind(postController)));

// ============== Category Routes ==============
router.post('/blogs/:blogId/categories', authMiddleware, validate(createCategorySchema), asyncHandler(taxonomyController.createCategory.bind(taxonomyController)));
router.get('/blogs/:blogId/categories', asyncHandler(taxonomyController.getCategoriesByBlog.bind(taxonomyController)));
router.get('/blogs/:blogId/categories/hierarchy', asyncHandler(taxonomyController.getCategoriesHierarchy.bind(taxonomyController)));
router.put('/categories/:id', authMiddleware, validate(updateCategorySchema), asyncHandler(taxonomyController.updateCategory.bind(taxonomyController)));
router.delete('/categories/:id', authMiddleware, asyncHandler(taxonomyController.deleteCategory.bind(taxonomyController)));

// ============== Tag Routes ==============
router.post('/blogs/:blogId/tags', authMiddleware, validate(createTagSchema), asyncHandler(taxonomyController.createTag.bind(taxonomyController)));
router.get('/blogs/:blogId/tags', asyncHandler(taxonomyController.getTagsByBlog.bind(taxonomyController)));
router.delete('/tags/:id', authMiddleware, asyncHandler(taxonomyController.deleteTag.bind(taxonomyController)));

// ============== Interaction Routes ==============
// Likes (optional auth for guests)
router.post('/posts/:postId/like', optionalAuthMiddleware, asyncHandler(interactionController.likePost.bind(interactionController)));
router.delete('/posts/:postId/like', optionalAuthMiddleware, asyncHandler(interactionController.unlikePost.bind(interactionController)));
router.get('/posts/:postId/like', optionalAuthMiddleware, asyncHandler(interactionController.getLikeStatus.bind(interactionController)));

// Bookmarks (require auth)
router.post('/posts/:postId/bookmark', authMiddleware, asyncHandler(interactionController.bookmarkPost.bind(interactionController)));
router.delete('/posts/:postId/bookmark', authMiddleware, asyncHandler(interactionController.removeBookmark.bind(interactionController)));
router.get('/posts/:postId/bookmark', authMiddleware, asyncHandler(interactionController.getBookmarkStatus.bind(interactionController)));
router.get('/bookmarks', authMiddleware, asyncHandler(interactionController.getMyBookmarks.bind(interactionController)));

// Follows (require auth)
router.post('/authors/:authorId/follow', authMiddleware, asyncHandler(interactionController.followAuthor.bind(interactionController)));
router.delete('/authors/:authorId/follow', authMiddleware, asyncHandler(interactionController.unfollowAuthor.bind(interactionController)));
router.get('/authors/:authorId/follow', authMiddleware, asyncHandler(interactionController.getFollowStatus.bind(interactionController)));
router.get('/followers', authMiddleware, asyncHandler(interactionController.getFollowers.bind(interactionController)));
router.get('/following', authMiddleware, asyncHandler(interactionController.getFollowing.bind(interactionController)));

// ============== Analytics Routes ==============
router.post('/analytics/read-time', optionalAuthMiddleware, validate(trackReadTimeSchema), asyncHandler(analyticsController.trackReadTime.bind(analyticsController)));
router.get('/analytics/posts/:postId', authMiddleware, asyncHandler(analyticsController.getPostAnalytics.bind(analyticsController)));
router.get('/analytics/blogs/:blogId', authMiddleware, asyncHandler(analyticsController.getBlogAnalytics.bind(analyticsController)));
router.get('/analytics/dashboard', authMiddleware, asyncHandler(analyticsController.getDashboard.bind(analyticsController)));

// ============== Upload Routes ==============
router.post('/blogs/:blogId/logo', authMiddleware, upload.single('file'), asyncHandler(uploadController.uploadBlogLogo.bind(uploadController)));
router.post('/blogs/:blogId/covers', authMiddleware, upload.single('file'), asyncHandler(uploadController.uploadPostCover.bind(uploadController)));
router.post('/avatar', authMiddleware, upload.single('file'), asyncHandler(uploadController.uploadAvatar.bind(uploadController)));

// ============== Author Routes ==============
router.get('/authors/:authorId/profile', asyncHandler(authorController.getPublicProfile.bind(authorController)));
router.get('/profile', authMiddleware, asyncHandler(authorController.getMyProfile.bind(authorController)));
router.put('/profile', authMiddleware, asyncHandler(authorController.updateProfile.bind(authorController)));

export default router;
