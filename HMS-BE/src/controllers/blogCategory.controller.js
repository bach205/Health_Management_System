const { OK, CREATED } = require('../core/success.response');
const BlogCategoryService = require('../services/blogCategory.service');

class BlogCategoryController {
  async create(req, res) {
    const result = await BlogCategoryService.createCategory(req.body);
    return new CREATED({ message: 'Tạo category thành công', metadata: result }).send(res);
  }
  async getAll(req, res) {
    const result = await BlogCategoryService.getCategories();
    return new OK({ message: 'Lấy danh sách category thành công', metadata: result }).send(res);
  }
  async getById(req, res) {
    const result = await BlogCategoryService.getCategoryById(req.params.id);
    return new OK({ message: 'Lấy category thành công', metadata: result }).send(res);
  }
  async update(req, res) {
    const result = await BlogCategoryService.updateCategory(req.params.id, req.body);
    return new OK({ message: 'Cập nhật category thành công', metadata: result }).send(res);
  }
  async delete(req, res) {
    const result = await BlogCategoryService.deleteCategory(req.params.id);
    return new OK({ message: 'Xóa category thành công', metadata: result }).send(res);
  }
}

module.exports = new BlogCategoryController(); 