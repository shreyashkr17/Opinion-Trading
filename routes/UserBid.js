const router = require("express").Router();
const userBidController = require('../controllers/userBidController');

router.patch("/update_bid/:mobile/:opinion_id",userBidController.update_bid);
router.get("/", userBidController.allBids);
router.get("/:mobile", userBidController.get_bid);
router.post("/",userBidController.add_bid);
router.delete("/:mobile/:opinion_id", userBidController.delete_bid);

module.exports = router;