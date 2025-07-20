const { OK, CREATED } = require('../core/success.response');
const TagService = require('../services/tag.service');

class TagController {
  async create(req, res) {
    const result = await TagService.create(req.body.name);
    return new CREATED({ message: 'Tạo tag thành công', metadata: result }).send(res);
  }

  async getAll(req, res) {
    const result = await TagService.getAll();
    return new OK({ message: 'Lấy danh sách tag thành công', metadata: result }).send(res);
  }

  async update(req, res) {
    const result = await TagService.update(req.params.id, req.body.name);
    return new OK({ message: 'Cập nhật tag thành công', metadata: result }).send(res);
  }

  async delete(req, res) {
    const result = await TagService.delete(req.params.id);
    return new OK({ message: 'Xoá tag thành công', metadata: result }).send(res);
  }
}

module.exports = new TagController();
