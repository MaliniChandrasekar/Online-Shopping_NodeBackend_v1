const User = require("../Model/UserModel")
const Address = require("../Model/AddressModel")
const { body, sanitizeBody, validationResult } = require("express-validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.insert = [
    body("firstname").trim().isAlphanumeric().withMessage("Firstname can contain only letters"),
    body("lastname").trim().isAlphanumeric().withMessage("Lastname can contain only letters"),
    body("password").isLength({ min: 5 }).withMessage("Cannot be less than 5 characters"),
    body("email").isEmail().withMessage("Email cannot be empty")
        .custom((value) => {
            return User.findOne({ email: value })
                .then((user) => {
                    if (user)
                        return Promise.reject("Email already exists")
                })
        }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else {
            try {
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                const user = new User({
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    password: hashedPassword,
                    email: req.body.email,
                    addressData : req.body.addressData
                });

                const savedUser = await user.save();

                // Create new address
                const address = new Address({ ...req.body.addressData, user: user._id });
                await address.save();

                // Associate the address with the user
                user.address = address._id;
                await user.save();

                return res.status(201).json(savedUser);
            } catch (err) {
                return res.status(500).json({ message: err.message });
            }
        }
    }
];

exports.checkemail = async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email });

        if (user) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.check = [
    body("email").isEmail().withMessage("Enter a valid email format"),
    body("password").isLength({ min: 5 }).withMessage("Password must contain at least five characters"),
    async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            const token = jwt.sign({ userId: user._id }, '16', {
                expiresIn: '1h',
            });
            res.status(200).json({ token, user });
        } catch (error) {
            console.error(error); // Log the error for debugging
            res.status(500).json({ error: 'Login Failed' });
        }
    }
];


exports.list = (req, res) => {
    User.find().populate('address')
        .then((users) => {
            return res.status(200).json(users); // Sending JSON response containing users with populated address
        })
        .catch((err) => {
            return res.status(500).json({ error: err.message }); // Sending JSON response for errors
        });
};

exports.update = [
    body("firstname").trim().isAlphanumeric().withMessage("Firstname can contain only letters"),
    body("lastname").trim().isAlphanumeric().withMessage("Lastname can contain only letters"),
    body("password").isLength({ min: 5 }).withMessage("Cannot be less than 5 characters"),
    body("email").isEmail().withMessage("Email cannot be empty")
        .custom((value, { req }) => {
            return User.findOne({ email: value, _id: { $ne: req.params.id } })
                .then((user) => {
                    if (user)
                        return Promise.reject("Email already exists");
                });
        }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const userData = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                password: hashedPassword,
                email: req.body.email
            };

            // Update user information
            const updatedUser = await User.findOneAndUpdate({ _id: req.params.id }, userData, { new: true });

            // Check if address data is provided
            if (req.body.street || req.body.city || req.body.state || req.body.postalCode || req.body.country) {
                // Check if user already has an address
                if (updatedUser.address) {
                    // Update existing address
                    const updatedAddress = await Address.findByIdAndUpdate(
                        updatedUser.address,
                        { ...req.body },
                        { new: true }
                    );
                    if (!updatedAddress) {
                        return res.status(404).json({ error: 'Address not found' });
                    }
                } else {
                    // Create new address and associate it with the user
                    const address = new Address({ ...req.body, user: updatedUser._id });
                    const savedAddress = await address.save();
                    if (!savedAddress) {
                        return res.status(500).json({ error: 'Error creating address' });
                    }
                    // Associate the address with the user
                    updatedUser.address = savedAddress._id;
                    await updatedUser.save();
                }
            }

            return res.status(200).json(updatedUser);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
];


exports.delete = [(req, res) => {
    const userId = req.params.id;

    User.findByIdAndDelete(userId)
        .then((deletedUser) => {
            return res.status(200).send("User deleted successfully");
        })
        .catch((err) => {
            return res.status(200).send(err.message);
        });
}]

exports.address = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log("UserId", userId)
        const user = await User.findById(userId).populate('address'); // Assuming you have a User model and use MongoDB/Mongoose
        console.log("User",user)
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
};