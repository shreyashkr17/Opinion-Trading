const router = require('express').Router();
const adminController = require('../controllers/adminController');

router.patch("/update/:mobile", adminController.updateAdmin);
router.get("/:role",adminController.all_admins);
router.get("/", adminController.single_admin);
router.post("/",adminController.add_Admin);
router.delete("/delete/:mobile",adminController.deleteAdmin);
router.post("/signup",adminController.sign_up);
router.post("/login",adminController.login);
router.post("/forgot-password",adminController.forget);
router.get("/reset-password/:id/:token",adminController.getToken);
router.post("/reset-password/:id/:token",adminController.postToken);

module.exports = router;
