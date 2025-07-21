const prisma = require('../config/prisma');
const { BadRequestError } = require('../core/error.response');

class BlogService {
  // Tạo bài viết mới kèm tagIds
  async createBlog(data) {
    const { tagIds = [], ...rest } = data;

    return prisma.blog.create({
      data: {
        ...rest,
        tags: {
          connect: tagIds.map((id) => ({ id: Number(id) })),
        },
      },
      include: {
        tags: true,
      },
    });
  }

  // Lấy danh sách bài viết (có thể phân trang, lọc theo published, author...)
  async getBlogs(params = {}) {
    const where = params.where || {};

    if (params.keyword) {
      where.title = {
        contains: params.keyword.toLowerCase(),
      };
    }

    return prisma.blog.findMany({
      where,
      orderBy: params.orderBy || { created_at: 'desc' },
      skip: params.skip || 0,
      take: params.take || undefined,
      include: {
        tags: true,
        category: true, // thêm nếu muốn trả về category luôn
      },
    });
  }

  async getAllTags() {
    return prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // Lấy chi tiết 1 bài viết
  async getBlogById(id) {
    const blog = await prisma.blog.findUnique({ where: { id: Number(id) }, include: { tags: true }, });
    console.log(blog)
    if (!blog) throw new BadRequestError('Không tìm thấy bài viết');
    return blog;
  }

  // Cập nhật bài viết
  async updateBlog(id, data) {
    const { tagIds = [], ...rest } = data;
    return prisma.blog.update({
      where: { id: Number(id) },
      data: {
        ...rest,
        tags: {
          set: tagIds.map((id) => ({ id: Number(id) })), // cập nhật lại toàn bộ tag
        },
      },
    });
  }

  // Xóa bài viết
  async deleteBlog(id) {
    return prisma.blog.delete({ where: { id: Number(id) } });
  }

}

module.exports = new BlogService(); 