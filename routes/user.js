const router = require("express").Router();
const userController = require('../controllers/userController');

router.patch("/update/:mobile",userController.update_user);
router.get("/", userController.all_users);
router.get("/:mobile", userController.getUser);
router.post("/", userController.addUser);
router.delete("/:mobile", userController.delete_user);
router.post("/signup", userController.signup);
router.post("/generate", userController.generateOTP);
router.post("/verify", userController.verifyOTP);

module.exports = router;