const router = require('express').Router();
const opinionController = require('../controllers/opinionController');

router.post("/", opinionController.add_opinion);
router.get("/", opinionController.all_opinion);
router.get("/:opinion_id", opinionController.get_opinion);
router.patch("/update/:opinon_id",opinionController.update_opinion);
router.get("/getStatus/:status", opinionController.get_status);
router.delete("/delete/:opinion_id",opinionController.delete_opinion);

module.exports = router;