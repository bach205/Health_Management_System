const prisma = require('../config/prisma');
const { BadRequestError } = require('../core/error.response');

class BlogCategoryService {
  async createCategory(data) {
    return prisma.blogCategory.create({ data });
  }
  async getCategories() {
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