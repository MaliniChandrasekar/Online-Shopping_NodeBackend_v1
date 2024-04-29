const User = require("../Model/UserModel")
const {body, sanitizeBody, validationResult} = require("express-validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.insert = [
    body("firstname").trim().isAlphanumeric().withMessage("Firstname can contain only letters"),
    body("lastname").trim().isAlphanumeric().withMessage("Lastname can contain only letters"),
    body("city").trim().isAlphanumeric().withMessage("City can contain only letters"),
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
                    city: req.body.city,
                    password: hashedPassword,
                    email: req.body.email
                });

                const savedUser = await user.save();
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
    User.find()
    .then((users) => {
        return res.status(200).json(users); // Sending JSON response containing users
    })
    .catch((err) => {
        return res.status(500).json({ error: err.message }); // Sending JSON response for errors
    });
};

exports.update = [
    body("firstname").trim().isAlphanumeric().withMessage("Firstname can contain only letters"),
    body("lastname").trim().isAlphanumeric().withMessage("Lastname can contain only letters"),
    body("city").trim().isAlphanumeric().withMessage("City can contain only letters"),
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
        // If file is uploaded, its information is available in req.file
        // Update book record with the new data, including the image filename if it has been uploaded
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
                const userData ={
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    city: req.body.city,
                    password: hashedPassword,
                    email: req.body.email
                };

        User.updateOne({_id: req.params.id}, {$set: userData})
            .then((user) => {
                return res.status(200).send(user);
            })
            .catch((err) => {
                return res.status(500).send(err.message);
            });
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

