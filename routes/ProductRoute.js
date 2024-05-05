const express = require("express")
const router = express.Router()

const ProductController = require("../Controller/ProductController")
const UserController = require("../Controller/UserController")
const CartController = require("../Controller/CartController")
const WishController = require("../Controller/WishController")

router.post("/product/insert", ProductController.insert)
router.get("/product", ProductController.list)
router.put("/product/:id", ProductController.update)
router.delete('/product/:id', ProductController.delete);
router.get('/product/:categoryname', ProductController.listByCategory);

router.post("/user/insert", UserController.insert)
router.get("/user/list", UserController.list)
router.post("/user/login", UserController.check)
router.get("/user/checkEmail/:email", UserController.checkemail)
router.delete("/user/:id", UserController.delete)
router.put("/user/:id", UserController.update)
router.get("/user/:userId", UserController.address)

router.post("/cart/add", CartController.addToCart)
router.get("/cart/:userId",  CartController.getUserCart)
router.delete("/cart/:userId/:productId", CartController.delete)
router.post("/checkout", CartController.deleteCartItems)

router.post("/wish/add", WishController.addToWish)
router.get("/wish/:userId", WishController.getUserWish)
router.delete("/wish/:userId/:productId", WishController.delete)


module.exports = router