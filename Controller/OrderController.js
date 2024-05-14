const Order = require('../Model/OrderModel');
const User = require('../Model/UserModel'); // Assuming you have a User model
const Product = require('../Model/ProductModel'); // Assuming you have a Product model
const DeliveryAddress = require('../Model/DeliveryAddress'); // Assuming you have a DeliveryAddress model

// Controller method to add a new order
exports.addOrder = async (req, res) => {
    try {
        // Extract necessary information from the request body
        const { userId, productIds, quantities } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate product IDs and quantities
        if (productIds.length !== quantities.length) {
            return res.status(400).json({ message: 'Product IDs and quantities must have the same length' });
        }

        // Find the user's existing order
        let existingOrder = await Order.findOne({ user: userId });

        // If no existing order, create a new one
        if (!existingOrder) {
            // Create an array of items for the order
            const items = [];

            // Calculate total price based on product prices and quantities
            let totalPrice = 0;
            for (let i = 0; i < productIds.length; i++) {
                const product = await Product.findById(productIds[i]);
                if (!product) {
                    return res.status(404).json({ message: `Product not found for ID: ${productIds[i]}` });
                }
                const itemPrice = product.price * quantities[i];
                items.push({ product: productIds[i], quantity: quantities[i], price: itemPrice });
                totalPrice += itemPrice;
            }

            // Create a new order document
            existingOrder = new Order({
                user: userId,
                items,
                totalPrice
            });

            // Save the new order to the database
            await existingOrder.save();
        } else {
            // Add new items to the existing order
            for (let i = 0; i < productIds.length; i++) {
                const product = await Product.findById(productIds[i]);
                if (!product) {
                    return res.status(404).json({ message: `Product not found for ID: ${productIds[i]}` });
                }
                const itemPrice = product.price * quantities[i];
                const existingItemIndex = existingOrder.items.findIndex(item => item.product.equals(productIds[i]));
                if (existingItemIndex !== -1) {
                    existingOrder.items[existingItemIndex].quantity += quantities[i];
                    existingOrder.items[existingItemIndex].price += itemPrice;
                } else {
                    existingOrder.items.push({ product: productIds[i], quantity: quantities[i], price: itemPrice });
                }
                existingOrder.totalPrice += itemPrice;
            }

            // Save the updated order
            await existingOrder.save();
        }

        res.status(201).json({ message: 'Order updated successfully', order: existingOrder });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getUserOrder = async (req, res) => {
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
        const order = await Order.findOne({ user: userId }).populate('items.product');

        // Check if the cart exists
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.listOrder = (req, res) => {
    Order.find().populate('items.product').populate('deliveryAddress')
    .then((orders) => {
        return res.status(200).json(orders); // Sending JSON response containing users
    })
    .catch((err) => {
        return res.status(500).json({ error: err.message }); // Sending JSON response for errors
    });
};