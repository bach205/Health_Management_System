const prisma = require('../config/prisma');
const { BadRequestError } = require('../core/error.response');

class BlogTagService {
  async createTag(data) {
    return prisma.blogTag.create({ data });
  }
  async getTags() {
    return prisma.blogTag.findMany({ orderBy: { name: 'asc' } });
  }
  async getTagById(id) {
    const tag = await prisma.blogTag.findUnique({ where: { id: Number(id) } });
    if (!tag) throw new BadRequestError('Không tìm thấy tag');
    return tag;
  }
  async updateTag(id, data) {
    return prisma.blogTag.update({ where: { id: Number(id) }, data });
  }
  async deleteTag(id) {
    return prisma.blogTag.delete({ where: { id: Number(id) } });
  }
}

module.exports = new BlogTagService(); 