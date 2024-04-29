const express = require("express")
const router = express.Router()

const ProductController = require("../Controller/ProductController")
const UserController = require("../Controller/UserController")

router.post("/product/insert", ProductController.insert)
router.get("/product/list", ProductController.list)
router.put("/product/:id", ProductController.update)
router.delete('/product/:id', ProductController.delete);
router.get('/product/:categoryname', ProductController.listByCategory);

router.post("/user/insert", UserController.insert)
router.get("/user/list", UserController.list)
router.post("/user/login", UserController.check)
router.get("/user/checkEmail/:email", UserController.checkemail)
router.delete("/user/:id", UserController.delete)
router.put("/user/:id", UserController.update)

module.exports = router