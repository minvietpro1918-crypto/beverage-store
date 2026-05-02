const User = require('../models/User');

// ─── GET /api/users (Admin) ───────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

// ─── GET /api/users/:id (Admin) ──────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user.' });
  }
};

// ─── PUT /api/users/:id (Admin) ──────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    // Prevent password update through this route
    const { password, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User updated.', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user.' });
  }
};

// ─── DELETE /api/users/:id (Admin) ───────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user.' });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
