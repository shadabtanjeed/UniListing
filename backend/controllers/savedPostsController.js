const Saved_Posts = require('../models/saved_posts_model');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User_Demo = require('../models/users_demo');

const JWT_SECRET = process.env.JWT_SECRET;


const savePost = async (req, res) => {
    try {
        const { type, apartment_id, item_id } = req.body;

        if (!type || (type !== 'apartment' && type !== 'marketplace')) {
            return res.status(400).json({ message: 'Invalid post type' });
        }

        if (type === 'apartment' && !apartment_id) {
            return res.status(400).json({ message: 'Apartment ID is required' });
        }

        if (type === 'marketplace' && !item_id) {
            return res.status(400).json({ message: 'Item ID is required' });
        }

        // Get user from token
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;

        if (!username) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Get user ID from username
        const user = await User_Demo.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if post is already saved
        const existingSavedPost = await Saved_Posts.findOne({
            saved_by: user._id,
            type,
            ...(type === 'apartment' ? { apartment_id } : { item_id })
        });

        if (existingSavedPost) {
            return res.status(409).json({ message: 'Post already saved' });
        }

        // Create new saved post with random postId
        const newSavedPost = new Saved_Posts({
            postId: uuidv4(),
            saved_by: user._id,
            type,
            apartment_id: type === 'apartment' ? apartment_id : undefined,
            item_id: type === 'marketplace' ? item_id : undefined,
        });

        const savedPost = await newSavedPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const unsavePost = async (req, res) => {
    try {
        const { postId } = req.params;

        // Get user from token
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;

        if (!username) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Get user ID from username
        const user = await User_Demo.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the post to delete and verify ownership
        const savedPost = await Saved_Posts.findOne({ postId });

        if (!savedPost) {
            return res.status(404).json({ message: 'Saved post not found' });
        }

        // Check if the user is the owner of the saved post
        if (savedPost.saved_by.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Access denied: You can only unsave your own saved posts' });
        }

        // Delete the saved post
        await Saved_Posts.findOneAndDelete({ postId });

        res.status(200).json({ message: 'Post unsaved successfully' });
    } catch (error) {
        console.error('Error unsaving post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all saved posts for the authenticated user
const getSavedPosts = async (req, res) => {
    try {
        // Get user from token
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;

        if (!username) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Get user ID from username
        const user = await User_Demo.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find all saved posts for the user
        const savedPosts = await Saved_Posts.find({ saved_by: user._id })
            .sort({ dateSaved: -1 }); // Sort by date, newest first

        res.status(200).json(savedPosts);
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get saved posts by type for the authenticated user
const getSavedPostsByType = async (req, res) => {
    try {
        const { type } = req.params;

        // Validate type
        if (type !== 'apartment' && type !== 'marketplace') {
            return res.status(400).json({ message: 'Invalid post type' });
        }

        // Get user from token
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;

        if (!username) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Get user ID from username
        const user = await User_Demo.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find saved posts by type for the user
        const savedPosts = await Saved_Posts.find({
            saved_by: user._id,
            type
        }).sort({ dateSaved: -1 }); // Sort by date, newest first

        res.status(200).json(savedPosts);
    } catch (error) {
        console.error('Error fetching saved posts by type:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Check if a post is saved by the user
const checkIfSaved = async (req, res) => {
    try {
        const { type, id } = req.params;

        // Validate type
        if (type !== 'apartment' && type !== 'marketplace') {
            return res.status(400).json({ message: 'Invalid post type' });
        }

        // Get user from token
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;

        if (!username) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Get user ID from username
        const user = await User_Demo.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find if post is saved
        const savedPost = await Saved_Posts.findOne({
            saved_by: user._id,
            type,
            ...(type === 'apartment' ? { apartment_id: id } : { item_id: id })
        });

        res.status(200).json({
            isSaved: !!savedPost,
            savedPostId: savedPost ? savedPost.postId : null
        });
    } catch (error) {
        console.error('Error checking if post is saved:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    savePost,
    unsavePost,
    getSavedPosts,
    getSavedPostsByType,
    checkIfSaved
};