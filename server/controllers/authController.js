const User = require('../models/User');
const { generateJWT, generateVerificationToken } = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, rollNumber, department, canteenName, canteenLocation, role, photoBase64 } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Allow student and canteen owner registration
    let userRole = 'student';
    if (role === 'canteenOwner') {
      const ownerExists = await User.findOne({ role: 'canteenOwner' });
      
      if (ownerExists) {
        return res.status(403).json({
          success: false,
          message: 'Canteen owner account already exists. Contact the existing owner.'
        });
      }
      userRole = role;
    }

    // Validate role-specific required fields
    if (userRole === 'student' && (!rollNumber || !department)) {
      return res.status(400).json({
        success: false,
        message: 'Roll Number and Department are required for students'
      });
    }

    if (userRole === 'student' && !photoBase64) {
      return res.status(400).json({
        success: false,
        message: 'Verification photo is required for students'
      });
    }

    if (userRole === 'canteenOwner' && (!canteenName || !canteenLocation)) {
      return res.status(400).json({
        success: false,
        message: 'Canteen Name and Location are required for canteen owners'
      });
    }

    // Generate verification token for students
    let verificationToken = null;
    let isVerified = false;

    if (userRole === 'student') {
      verificationToken = generateVerificationToken();
    } else {
      // Canteen owners are verified by default
      isVerified = true;
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      rollNumber: userRole === 'student' ? rollNumber : undefined,
      department: userRole === 'student' ? department : undefined,
      canteenName: userRole === 'canteenOwner' ? canteenName : undefined,
      canteenLocation: userRole === 'canteenOwner' ? canteenLocation : undefined,
      role: userRole,
      verificationToken,
      isVerified,
      profileImage: userRole === 'student' ? photoBase64 : ''
    });

    // Generate JWT
    const token = generateJWT(user._id);

    res.status(201).json({
      success: true,
      message: userRole === 'student'
        ? 'Registration successful! Visit the canteen to get your verification token from the owner.'
        : 'Account created successfully!',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          rollNumber: user.rollNumber,
          department: user.department,
          canteenName: user.canteenName,
          canteenLocation: user.canteenLocation,
          phone: user.phone,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateJWT(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          rollNumber: user.rollNumber,
          department: user.department,
          phone: user.phone,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify student account with token
// @route   POST /api/auth/verify
// @access  Private (student only)
const verifyAccount = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the verification token'
      });
    }

    const user = await User.findById(userId);

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified'
      });
    }

    if (user.verificationToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account verified successfully! You can now place orders.',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: true
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (department) updateFields.department = department;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, verifyAccount, getMe, updateProfile };
