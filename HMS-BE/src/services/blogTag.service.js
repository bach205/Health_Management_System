const prisma = require('../config/prisma');
const { BadRequestError } = require('../core/error.response');

class BlogTagService {
  async createTag(data) {
    return prisma.tag.create({ data });
  }

  async getTags() {
    return prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }

  async getTagById(id) {
    const tag = await prisma.tag.findUnique({ where: { id: Number(id) } });
    if (!tag) throw new BadRequestError('Không tìm thấy tag');
    return tag;
  }

  async updateTag(id, data) {
    return prisma.tag.update({ where: { id: Number(id) }, data });
  }

  async deleteTag(id) {
    return prisma.tag.delete({ where: { id: Number(id) } });
  }

  // ✅ Gán danh sách tag vào blog
  async addTagsToBlog(blogId, tagIds = []) {
    return prisma.blog.update({
      where: { id: Number(blogId) },
      data: {
        tags: {
          set: [], // xoá tất cả các tag hiện có trước đó
          connect: tagIds.map((id) => ({ id: Number(id) })),
        },
      },
      include: {
        tags: true,
      },
    });
  }
}

module.exports = new BlogTagService();
