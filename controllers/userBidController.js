// const User = require("../model/User");
const User = require("../model/User");
const UserBid = require("../model/UserBid");

const allBids = async (req,res) => {
    try{
        const {bid_option, optionId, mobile} = req.query;

        const filter = {};
        if(bidOption) {
            filter.bid_option = bid_option;
        }
        if(optionId) {
            filter.opinion_id = optionId;
        }
        if(mobile) {
            filter.mobile = mobile;
        }

        console.log(filter);

        const users = await UserBid.aggregate([
            {
                $match: 
                    filter
            },
            {
                $lookup: {
                    from: "users",
                    localField: "mobile",
                    foreignField: "mobile",
                    as: "user"
                }
            },
            {
                $project: {
                    mobile:1,
                    opinion_id:1,
                    bid_option:1,
                    amount:1,
                    timestamp:1,
                    transaction_detail:1,
                    settlement_status:1,
                    no_of_share:1,
                    'opinion_title':1,
                    'opinion_status':1,
                    'opinions.final_result':1,
                    'opinion_trade_volume':1,
                }
            }
        ]);
        res.json(users);
    }catch(err){
        res.status(500).json({message: err.message});
    }
};


// Get single User
const get_bid = async (req,res) => {
    // console.log
    try{
        console.log(req.params.mobile);
        const user = await UserBid.find({mobile: req.params.mobile});
        console.log(user);
        res.json(user);
    }catch(err){
        res.json({message: err.message});
    }
}

// Add new user
const add_bid = async (req,res) => {
    try{
        const {mobile,opinion_id,bid_option,amount,no_of_share} = req.body;

        // Validate user input
        if(!(opinion_id && mobile && bid_option == true || bid_option == false && amount && no_of_share)){
            return res.json(400).send("All input is required");
        }

        // Check if the user is already in the database
        const existingUser = await User.findOne({mobile:mobile, opinion_id:opinion_id});

        if(existingUser){
            return res.status(409).json({message:"Bid Already Exist. Please Login"});
        }


        const user = new UserBid({
            mobile:req.body.mobile,
            opinion_id:req.body.opinion_id,
            bid_option:req.body.bid_option,
            amount:req.body.amount,
            timestamp:req.body.timestamp,
            transaction_detail:req.body.transaction_detail,
            settlement_status:req.body.settlement_status,
            no_of_share:req.body.no_of_share,
        });
        try{
            const savedUser = await user.save();
            res.json(savedUser);
        }catch(err){
            // console.log(err);
            return res.status(400).send(err);
        }
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Something Went Wrong"});
    }
};


// Delete User
const delete_bid = async (req,res) => {
    try{
        const removeuser = await UserBid.deleteOne({opinion_id:req.params.opinion_id,mobile:req.params.mobile});
        res.json(removeuser);
    }catch(error){
        res.json({message:error})
    }
}

// Update Bid
const update_bid = async (req, res) => {
    try {
        const user = {
          mobile: req.body.mobile,
          opinion_id: req.body.opinion_id,
          bid_option: req.body.bid_option,
          amount: req.body.amount,
          timestamp: req.body.timestamp,
          transaction_detail: req.body.transaction_detail,
          settlement_status: req.body.settlement_status,
          no_of_share: req.body.no_of_share
        };

        console.log(user);
    
        const updateduser = await User.findOneAndUpdate(
          { opinion_id: req.params.opinion_id, mobile:req.params.mobile },
          user
        );
        res.json(user);
      } catch (error) {
        res.json({ message: error });
      }
};

module.exports = {
    allBids,
    get_bid,
    add_bid,
    delete_bid,
    update_bid
}


