const UserService = require('../services/user.service');

class UserController {
    // Tìm kiếm staff
    async searchStaff(req, res) {
        try {
            const { query } = req.query;
            const users = await UserService.searchStaff(query);
            res.json({ data: users });
        } catch (err) {
            console.log(err.message)
            res.status(500).json({ message: err.message || 'Error searching staff' });
        }
    }
}

module.exports = new UserController(); 