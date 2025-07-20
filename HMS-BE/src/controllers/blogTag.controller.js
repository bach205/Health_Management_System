const { OK, CREATED } = require('../core/success.response');
const BlogTagService = require('../services/blogTag.service');

class BlogTagController {
  async create(req, res) {
    const result = await BlogTagService.createTag(req.body);
    return new CREATED({ message: 'Tạo tag thành công', metadata: result }).send(res);
  }
  async getAll(req, res) {
    const result = await BlogTagService.getTags();
    return new OK({ message: 'Lấy danh sách tag thành công', metadata: result }).send(res);
  }
  async getById(req, res) {
    const result = await BlogTagService.getTagById(req.params.id);
    return new OK({ message: 'Lấy tag thành công', metadata: result }).send(res);
  }
  async update(req, res) {
    const result = await BlogTagService.updateTag(req.params.id, req.body);
    return new OK({ message: 'Cập nhật tag thành công', metadata: result }).send(res);
  }
  async delete(req, res) {
    const result = await BlogTagService.deleteTag(req.params.id);
    return new OK({ message: 'Xóa tag thành công', metadata: result }).send(res);
  }

  // Gán tag cho bài viết
  async addTagsToBlog(req, res) {
    const { blogId, tagIds } = req.body;
    const result = await BlogTagService.addTagsToBlog(blogId, tagIds);
    return new OK({ message: 'Gán tag cho blog thành công', metadata: result }).send(res);
  }
}

module.exports = new BlogTagController(); 