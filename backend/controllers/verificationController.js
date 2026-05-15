const User = require('../models/User');

// @desc    Get pending (unverified) students
// @route   GET /api/verification/pending
// @access  Private (canteenOwner)
const getPendingStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student', isVerified: false })
      .select('image name email rollNumber department phone verificationToken createdAt');

    res.status(200).json({ success: true, count: students.length, data: { students } });
  } catch (error) { next(error); }
};

// @desc    Get all students
// @route   GET /api/verification/students
// @access  Private (canteenOwner)
const getAllStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('image name email rollNumber department phone isVerified createdAt');

    res.status(200).json({ success: true, count: students.length, data: { students } });
  } catch (error) { next(error); }
};

module.exports = { getPendingStudents, getAllStudents };
