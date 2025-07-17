const { OK, CREATED } = require('../core/success.response');
const BlogService = require('../services/blog.service');

class BlogController {
  // Tạo bài viết mới
  async create(req, res) {
    const result = await BlogService.createBlog(req.body);
    return new CREATED({ message: 'Tạo bài viết thành công', metadata: result }).send(res);
  }

  // Lấy danh sách bài viết
  // GET /api/v1/blog?page=1&pageSize=10&published=true&category_id=1&keyword=abc
  async getAll(req, res) {
    console.log(1)
    const { page = 1, pageSize = 8, ...filters } = req.query;

    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);
    const where = {};

    if (filters.published !== undefined) {
      where.published = filters.published === 'true';
    }
    if (filters.category_id) {
      where.category_id = Number(filters.category_id);
    }
    const result = await BlogService.getBlogs({
      where,
      skip,
      take,
      keyword: filters.keyword || '',
    });


    return new OK({ message: 'Lấy danh sách bài viết thành công', metadata: result }).send(res);
  }


  // Lấy chi tiết 1 bài viết
  async getById(req, res) {
    const result = await BlogService.getBlogById(req.params.id);
    return new OK({ message: 'Lấy bài viết thành công', metadata: result }).send(res);
  }

  // Cập nhật bài viết
  async update(req, res) {
    const result = await BlogService.updateBlog(req.params.id, req.body);
    return new OK({ message: 'Cập nhật bài viết thành công', metadata: result }).send(res);
  }

  // Xóa bài viết
  async delete(req, res) {
    const result = await BlogService.deleteBlog(req.params.id);
    return new OK({ message: 'Xóa bài viết thành công', metadata: result }).send(res);
  }
}

module.exports = new BlogController(); 