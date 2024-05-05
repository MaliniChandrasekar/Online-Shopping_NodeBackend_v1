const Product = require("../Model/ProductModel");
const { body, sanitizeBody, validationResult } = require("express-validator");
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/data/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploader = multer({ storage: storage });

exports.insert = [
    uploader.single('image'), // Middleware for uploading single file
    body("productname")
        .trim()
        .isAlphanumeric()
        .withMessage("Productname can contain only letters")
        .isLength({ min: 1 })
        .withMessage("Productname cannot be empty")
        .custom((value) => {
            return Product.findOne({ productname: value }).then((product) => {
                if (product) return Promise.reject("Productname already exists");
            });
        }),
    body("description")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Description must be at least 3 characters long"),
    body("price")
        .isNumeric({ min: 1 })
        .withMessage("Enter a valid price"),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // If file is uploaded, its information is available in req.file
        const product = new Product({
            productname: req.body.productname,
            description: req.body.description,
            price: req.body.price,
            image: req.file ? req.file.filename : null, 
            categoryname: req.body.categoryname
        });

        product.save()
            .then((product) => {
                return res.status(200).send(product);
            })
            .catch((err) => {
                return res.status(500).send(err.message);
            });
    }
];

exports.update = [
    uploader.single('image'), // Middleware for uploading single file (image)
    (req, res) => {
        // If file is uploaded, its information is available in req.file
        // Update book record with the new data, including the image filename if it has been uploaded
        const updateData = {
            productname: req.body.productname,
            description: req.body.description,
            price: req.body.price,
            categoryname: req.body.categoryname
        };
        if (req.file) {
            // If an image was uploaded, update the image field in the book record
            updateData.image = req.file.filename;
        }
        Product.updateOne({_id: req.params.id}, {$set: updateData})
            .then((product) => {
                return res.status(200).send(product);
            })
            .catch((err) => {
                return res.status(500).send(err.message);
            });
    }
];

exports.delete = [(req, res) => {
    const productId = req.params.id; 

    Product.findByIdAndDelete(productId)
    .then((deletedProduct) => {
        return res.status(200).send("Product deleted successfully");
    })
    .catch((err) => {
        return res.status(200).send(err.message); 
    });
}]

exports.listByCategory = (req, res) => {
    const { categoryname } = req.params; // Assuming categoryname is passed as a route parameter
    
    Product.find({ categoryname }) // Find all products with the given categoryname
        .then((products) => {
            return res.status(200).json(products); // Sending JSON response containing products
        })
        .catch((err) => {
            return res.status(500).json({ error: err.message }); // Sending JSON response for errors
        });
};

exports.list = (req, res) => {
    Product.find()
    .then((products) => {
        return res.status(200).json(products); // Sending JSON response containing users
    })
    .catch((err) => {
        return res.status(500).json({ error: err.message }); // Sending JSON response for errors
    });
};


// exports.list = (req, res) => {
//     // define page and limit per page
//     let page = parseInt(req.query.page) || 1;
//     const limit = 3;

//     // calculate skip based on page
//     const skip = (page - 1) * limit;

//     Product.find().sort("title").skip(skip).limit(limit * page)
//     .then((products) => {
//         return res.status(200).send(products);
//     })
//     .catch((err) => {
//         return res.status(500).send(err.message);
//     });
// };
