const prisma = require('../config/prisma');
const { BadRequestError } = require('../core/error.response');

class BlogService {
  // Tạo bài viết mới
  async createBlog(data) {
    return prisma.blog.create({ data });
  }

  // Lấy danh sách bài viết (có thể phân trang, lọc theo published, author...)
  async getBlogs(params = {}) {
    return prisma.blog.findMany({
      where: params.where || {},
      orderBy: params.orderBy || { created_at: 'desc' },
      skip: params.skip || 0,
      take: params.take || undefined,
    });
  }

  // Lấy chi tiết 1 bài viết
  async getBlogById(id) {
    const blog = await prisma.blog.findUnique({ where: { id: Number(id) } });
    console.log(blog)
    if (!blog) throw new BadRequestError('Không tìm thấy bài viết');
    return blog;
  }

  // Cập nhật bài viết
  async updateBlog(id, data) {
    return prisma.blog.update({ where: { id: Number(id) }, data });
  }

  // Xóa bài viết
  async deleteBlog(id) {
    return prisma.blog.delete({ where: { id: Number(id) } });
  }
}

module.exports = new BlogService(); 