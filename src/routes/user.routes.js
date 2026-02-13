const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyUser, verifyAdmin } = require("../middleware/authenticate");

router.post("/login", userController.login);
router.post("/signup", userController.signup);
router.post("/logout", verifyUser, userController.logout);
router.get("/users",userController.getAllUsers);
router.post("/users" ,userController.createUser);
router.get("/users/:id", userController.viewDetailUser);
router.put("/users/:id",verifyUser, verifyAdmin,userController.updateUser);
router.delete("/users/:id",verifyUser,verifyAdmin, userController.deleteUser);

module.exports = router;
