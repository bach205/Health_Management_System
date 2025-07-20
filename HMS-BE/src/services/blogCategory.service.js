const prisma = require('../config/prisma');
const { BadRequestError } = require('../core/error.response');

class BlogCategoryService {
  async createCategory(data) {
    return prisma.blogCategory.create({ data });
  }
  async getCategoriesPagination({ page = 1, pageSize = 8, order = 'asc' } = {}) {
    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);
    const orderBy = { name: order === 'desc' ? 'desc' : 'asc' };
    const [data, total] = await Promise.all([
      prisma.blogCategory.findMany({
        orderBy,
        skip,
        take,
      }),
      prisma.blogCategory.count(),
    ]);
    return { data, total, page: Number(page), pageSize: Number(pageSize) };
  }
  async getAllCategories() {
    return prisma.blogCategory.findMany({ orderBy: { name: 'asc' } });
  }
  async getCategoryById(id) {
    const category = await prisma.blogCategory.findUnique({ where: { id: Number(id) } });
    if (!category) throw new BadRequestError('Không tìm thấy category');
    return category;
  }
  async updateCategory(id, data) {
    return prisma.blogCategory.update({ where: { id: Number(id) }, data });
  }
  async deleteCategory(id) {
    return prisma.blogCategory.delete({ where: { id: Number(id) } });
  }
}

module.exports = new BlogCategoryService(); 