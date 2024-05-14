const Cart = require("../Model/CartModel")
const { body, sanitizeBody, validationResult } = require("express-validator")
const User = require("../Model/UserModel")
const Product = require("../Model/ProductModel")

// Controller to handle adding items to the cart
exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

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

        // Calculate total price based on product price and quantity
        const totalPrice = product.price * quantity;

        // Check if the user already has a cart
        let cart = await Cart.findOne({ user: userId });

        // If the user doesn't have a cart, create a new one
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if the product already exists in the cart
        const existingItem = cart.items.find(item => item.product.equals(productId));

        // If the product already exists in the cart, update its quantity
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.price += totalPrice;
        } else { // Otherwise, add a new item to the cart
            cart.items.push({ product: productId, quantity, price: totalPrice });
        }

        // Save the cart
        await cart.save();

        res.status(200).json({ message: 'Item added to cart successfully', cart });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Controller to get user's cart
exports.getUserCart = async (req, res) => {
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
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        // Check if the cart exists
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Calculate the count of products in the cart
        const productCount = cart.items.reduce((total, item) => total + item.quantity, 0);

        // Send the cart data along with the count of products
        res.status(200).json({ cart, productCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const userId = req.params.userId;
        const productId = req.params.productId;

        // Find the cart associated with the user
        const userCart = await Cart.findOne({ user: userId });

        if (!userCart) {
            return res.status(404).send('User cart not found');
        }

        // Find the index of the product to be deleted
        const productIndex = userCart.items.findIndex(item => item.product.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).send('Product not found in the cart');
        }

        // Retrieve the product from the cart
        const product = userCart.items[productIndex];

        // If the quantity is greater than 1, decrement the quantity
        if (product.quantity > 1) {
            product.quantity -= 1;
        } else {
            // If the quantity is 1, remove the product from the cart
            userCart.items.splice(productIndex, 1);
        }

        // Recalculate the total price of the cart
        // // Recalculate the total price of the cart
let totalPrice = 0;
for (const item of userCart.items) {
    // Fetch the product details using the product ID
    const product = await Product.findById(item.product); // Assuming you're using MongoDB and Mongoose for database operations

    // Calculate the price for the current item
    const itemPrice = product.price * item.quantity;

    // Add the item price to the total price
    totalPrice += itemPrice;

    // Update the price of the current item
    item.price = itemPrice;
}


        // Save the updated cart
        await userCart.save();

        res.status(200).send('Product deleted successfully');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Internal server error');
    }
}


exports.deleteCartItems = async (req, res) => {
    try {
      const userId = req.params.userId;
      // Find the user's cart and delete its items
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
      cart.items = [];
      await cart.save();
      res.status(200).json({ message: 'Cart items deleted successfully' });
    } catch (error) {
      console.error('Error deleting cart items:', error);
      res.status(500).json({ error: 'Failed to delete cart items' });
    }
  };
// Other controllers like updating cart item quantity, removing items from the cart, etc., can be added similarly

