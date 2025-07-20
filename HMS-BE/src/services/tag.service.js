const prisma = require("../config/prisma");

class TagService {
  async create(name) {
    return await prisma.tag.create({ data: { name } }); // ✅
  }

  async getAll() {
    return await prisma.tag.findMany({ orderBy: { id: 'asc' } }); // ✅
  }

  async update(id, name) {
    return await prisma.tag.update({
      where: { id: Number(id) },
      data: { name },
    });
  }

  async delete(id) {
    return await prisma.tag.delete({ where: { id: Number(id) } });
  }
}

module.exports = new TagService();
