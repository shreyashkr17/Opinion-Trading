const User = require("../model/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const { nextTick } = require("process")
dotenv.config()

// Get All User
const all_users = async (req,res) => {
    try{
        const {name,mobile,status,community, kyc,referral} = req.query;

        // Build the filter Object based on query parameter
        const filter = {};
        if(name) {
            filter.name = name;
        }
        if(mobile) {
            filter.mobile = mobile;
        }
        if(status) {
            filter.status = status;
        }
        if(community) {
            filter.community = community;
        }
        if(kyc) {
            filter.kyc = kyc;
        }
        if(referral) {
            filter['referral.referredBy'] = referredBy;
            filter['referral.referralCount'] = referralCount;
        }

        const users = await User.find(filter);
    }catch(error){
        res.status(400).json({error: 'An error occured while fetching users'});
    }
};

// Get Single User
const getUser = async (req,res) => {
    try{
        console.log(req.params.mobile);
        const user = await User.find({mobile: req.params.mobile});
        res.status(200).json(user);
    }catch(error){
        res.status(400).json({error: error.message});
    }
}

// Add new User
const addUser = async (req,res) => {
    // console.log()
    const user = new User({
        name:req.body.name,
        password:req.body.password,
        mobile:req.body.mobile,
        revenue:req.body.revenue,
        wallet:req.body.wallet,
        portfolio:req.body.portfolio,
        status:req.body.status,
        kyc:req.body.kyc,
        community:req.body.community,
    });

    try{
        const savedUser = await user.save();
        res.send(savedUser);
    }catch(error){
        res.status(400).send(error);
    }
};


// Delete User
const delete_user = async (req,res) => {
    try{
        const removeuser = await User.deleteOne({mobile:req.params.mobile});
        res.json(removeuser);
    }catch(error){
        res.json({message:error});
    }
};



// Update User
const update_user = async (req,res) => {
    try{
        const user = {
            name:req.body.name,
            password:req.body.password,
            mobile:req.body.mobile,
            revenue:req.body.revenue,
            wallet:req.body.wallet,
            portfolio:req.body.portfolio,
            status:req.body.status,
            kyc:req.body.kyc,
            community:req.body.community
        };

        console.log(user);

        const updateUser = await User.findOneAndUpdate(
            { mobile: req.params.mobile},
            user,
        );
        res.json(user);
    }catch(error){
        res.json({message:error});
    }
};


// Sign Up User
const signup = async (req,res) => {
    try{
        const {name, mobile, community, referralCode} = req.body;

        if(!(name && mobile)){
            res.status(400).send("All input is required");
        }

        const existingUser = await User.findOne({mobile: mobile});

        if(!existingUser){
            res.status(409).json({message:"Admin Already Exist. Please Login"});
        }

        const userData = {name, mobile, community};

        if(referralCode){
            const referrer = await User.findOne({'referral.referralCode': referralCode});
            if(referrer){
                userData.referral = {referredBy:referrer.user_id};
                const referralChain = [{level:1, user_id:referrer.user_id}];

                if(referrer.referral.referralChain){
                    // referralChain.push(...referrer.referral.referralChain);
                    for(const ref of referrer.referral.referralChain){
                        // referralChain.push(ref);
                        if(ref.level < 4){
                            referralChain.push({level:ref.level+1, user_id:ref.user_id});
                        }
                    }
                }

                userData.referral.referralChain = referralChain;
                await User.updateOne(
                    {user_id:referrer.user_id},
                    {$inc: {'referral.referralCount':1}}
                );

                for(const ref of referralChain){
                    await User.updateOne(
                        {user_id: ref.user_id},
                        { $inc: {'referral.rewardsEarned':getRewardForLevel(ref.level)}}
                    );
                }
            }
        }

        const user = await User.create(userData);

        res.status(201).json({user:user});

        function getRewardForLevel(level){
            switch(level){
                case 1:
                    return 40;
                case 2:
                    return 25;
                case 3:
                    return 15;
                case 4:
                    return 10;
                default:
                    return 0;
            }
        }

        next();
    }catch(err){
        console.log(err);
        return res.status(500).json({message:err.message});
    }
};


const generateOTP = async (req,res) => {
    try{
        const { mobile } = req.body;

        if(!mobile){
            return res.status(400).send("Mobile Number is required")
        }

        const existingUser = await User.findOne({mobile:mobile});

        if(!existingUser){
            return res.status(409).json({message:"User Not Found. Please Sign Up"});
        }

        let random = Math.floor(Math.random()*900000)+100000;

        existingUser.otp = random;
        await existingUser.save();

        accountSid = '';
        authToken = '';

        const client = require('twilio')(accountSid, authToken);

        client.messages
        .create({
            body: `Your OTP is ${random}`,
            from: '+15418738806',
            to:'+91'+mobile
        })
        .then(message => console.log(message.sid))
        .catch(error => console.log(error));


        res.status(200).json({otp:random});
        next();
    }catch(err){
        console.log(err);
        return res.status(500).json({otp:"Something went Wrong"});
    }
};


// Verification Otp

const verifyOTP = async (req,res) => {
    try{
        const {mobile,otp} = req.body;

        if(!(mobile)){
            res.status(400).send("Mobile Number is required");
        }

        const existingUser = await User.findOne({mobile:mobile});

        if(!existingUser){
            return res.status(409).json({message:"User Not Found. Please Sign Up"});
        }

        if(otp === existingUser.otp){
            const token = jwt.sign(
                {mobile:existingUser.mobile, id:existingUser._id},
                process.env.TOKEN_KEY,
            );

            return res.status(201).json({user:existingUser, token:token});
        }
        return res.status(401).json({message:"Invalid Credentials"});
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Something went Wrong"});
    }
};

module.exports = {
    all_users,
    getUser,
    addUser,
    delete_user,
    update_user,
    signup,
    generateOTP,
    verifyOTP
}