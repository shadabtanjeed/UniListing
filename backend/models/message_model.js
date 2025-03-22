const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  receiver: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create compound index for efficient querying of conversations
MessageSchema.index({ conversationId: 1, timestamp: 1 });
MessageSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model('Message', MessageSchema);