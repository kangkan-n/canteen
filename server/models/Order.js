const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'placed'
  },
  expectedDeliveryTime: {
    type: Date
  },
  orderNumber: {
    type: String,
    unique: true
  },
  cancellationReason: {
    type: String
  },
  cancelledAt: {
    type: Date
  },
  specialInstructions: {
    type: String,
    maxlength: [300, 'Special instructions cannot exceed 300 characters']
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Generate unique order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${dateStr}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
