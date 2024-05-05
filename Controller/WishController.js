const Wish = require("../Model/WishModel")
const {body, sanitizeBody, validationResult} = require("express-validator")
const User = require("../Model/UserModel")
const Product = require("../Model/ProductModel")

// Controller to handle adding items to the wish
exports.addToWish = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if the user already has a wishlist
        let wish = await Wish.findOne({ user: userId });

        // If the user doesn't have a wishlist, create a new one
        if (!wish) {
            wish = new Wish({ user: userId, items: [] });
        }

        // Check if the product already exists in the wishlist
        const existingItemIndex = wish.items.findIndex(item => item.product.equals(productId));

        // If the product already exists in the wishlist, send a message
        if (existingItemIndex !== -1) {
            return res.status(400).json({ message: 'Product already exists in wishlist' });
        }

        // Add a new item to the wishlist
        wish.items.push({ product: productId });

        // Save the wishlist
        await wish.save();

        res.status(200).json({ message: 'Item added to wishlist successfully', wish });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Controller to get user's cart
exports.getUserWish = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Check if the user ID provided in the URL is valid
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get the user's cart
        const wish = await Wish.findOne({ user: userId }).populate('items.product');

        // Check if the cart exists
        if (!wish) {
            return res.status(404).json({ error: 'wishlist not found' });
        }

        res.status(200).json(wish);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const userId = req.params.userId;
        const productId = req.params.productId;
        
        console.log('UserId:', userId);
        console.log('ProductId:', productId);

        // Find the cart item associated with the user
        const userWish = await Wish.findOne({ user: userId });
        
        console.log('UserCart:', userWish);

        if (!userWish) {
            return res.status(404).send('User Wish not found');
        }

        // Find the index of the product to be deleted
        const productIndex = userWish.items.findIndex(item => item.product.toString() === productId);

        console.log('ProductIndex:', productIndex);

        if (productIndex === -1) {
            return res.status(404).send('Product not found in the wishlist');
        }

        // Remove the product from the items array
        userWish.items.splice(productIndex, 1);

        console.log('Updated UserWish:', userWish);

        // Save the updated cart
        await userWish.save();

        res.status(200).send('Product deleted successfully');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Internal server error');
    }
}

// Other controllers like updating cart item quantity, removing items from the cart, etc., can be added similarly

