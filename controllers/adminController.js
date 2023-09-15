const Admin = require('../model/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv")
const nodemailer = require('nodemailer');

// Get all the Admins
const all_admins = async (req,res) => {
    try{
        const admins = await Admin.find({role:req.params.role});
        console.log(admins);
        res.json(admins)
    }catch(error){
        res.json({message:error});
    }
}


// Get Single Admin
const single_admin = async (req,res) => {
    try{
        const {status,role,mobile,company,access,kyc} = req.query;

        const filter = {};
        if(status){
            filter.status = status;
        }
        if(role){
            filter.role = role;
        }
        if(mobile){
            filter.mobile = mobile;
        }
        if(company){
            filter.company = company;
        }
        if(access){
            filter.access = access;
        }
        if(kyc){
            filter.kyc = kyc;
        }
    }catch(error){
        res.status(500).json({error:'An error occured while fetching admins'})
    }
};



// Sign up admins
const sign_up = async (req,res) => {
    try {
        const {name, password,mobile,email,role,company,status} = req.body;

        // Validate user input
        if(!(name && password && mobile && email)){
            res.status(400).send('All input is required');
        }

        // check if user already exist
        // Validate if user exist in out database
        const existingUser = await Admin.findOne({mobile:mobile});

        if(existingUser){
            return res.status(409).json({message:"Admin Already exist. Please Login"});
        }

        // encrypt user password
        let salt = await bcrypt.genSalt();
        const hashedString = await bcrypt.hash(password,salt);

        // create user in our database
        const user = await Admin.create({
            name:name,
            mobile:mobile,
            email:email.toLowerCase(),
            password:hashedString,
            role:role,
            company:company,
            status:status
        })

        // create token
        const token = jwt.sign(
            {mobile:user.mobile, id:user._id},
            process.env.TOKEN_KEY,
        )

        // save user token
        res.cookie('jwtToken',token, {maxAge:24*60*60*1000, httpOnly:true}); //maxAge of token is 2 hours

        return res.status(201).json({user:user,token:token});
    } catch (error) {
        console.log(err);
        return res.status(500).json({error:error.message});
    }
}


// login function
const login = async (req,res) => {
    try {
        const {mobile, password} = req.body;


        // validate user input
        if(!(mobile && password)){
            res.status(400).send('All input is required');
        }

        // validate is user exis in our database
        const existingUser = await Admin.findOne({mobile:mobile});

        if(!(existingUser)){
            return res.status(409).json({message: "User Not Found. Please sign Up"})
        }

        const matchPassword = await bcrypt.compare(password,existingUser.password);

        // create token
        if(matchPassword){
            const token = jwt.sign(
                {mobile:existingUser.mobile, id:existingUser._id},
                process.env.TOKEN_KEY,
            );

            res.cookie('jwtToken',token,{maxAge:24*60*60*1000, httpOnly:true}); //maxAge:2 hours

            // save user token
            return res.status(201).json({user:existingUser,token:token});
        }

        return res.status(400).json({message:"Invalid Credentials"});
    } catch (error) {
        console.log(err);
        return res.status(500).json({user:existingUser,token:token});
    }
};

// Add new Admin
const add_Admin = async (req,res) => {
    const {email,password} = req.body;
    console.log(email);
    console.log(password);
    console.log("Inside Post")
    const admin = new Admin({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        mobile:req.body.mobile,
        status:req.body.status,
        company:req.body.company,
        access:req.body.access,
        money:req.body.money,
        role:req.body.role,
        kyc:req.body.kyc
    });

    try{
        const saveAdmin = await admin.save();
        res.send(saveAdmin);

        // var transporter  = nodemailer.createTransport({

        // })
    }catch(err){
        res.status(400).send(err);
    }
}


// Delete Post
const deleteAdmin = async (req,res) => {
    try{
        console.log(req.params.mobile)
        const removeAdmin = await Admin.deleteOne({mobile:req.params.mobile});
        res.json(removeAdmin);
    }catch(err){
        res.json({message:err});
    }
}

// Updating Admin
const updateAdmin = async (req,res) => {
    try{
        const admin = {
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            mobile:req.body.mobile,
            status:req.body.status,
            company:req.body.company,
            access:req.body.access,
            money:req.body.money,
            role:req.body.role,
            kyc:req.body.kyc,
        };

        console.log(admin);

        const updateAdmin = await Admin.findOneAndUpdate(
            {mobile:req.params.mobile},
            admin
        );

        res.json(admin);
    }catch(err){
        res.json({message:error});
    }
};


const forget = async (req,res) => {
    const {email} = req.body;
    console.log(email);

    try{
        const oldUser = await Admin.findOne({email:email});

        if(!oldUser){
            return res.json({status:"User Not Exist !"});
        }

        const secret = process.env.TOKEN_KEY+oldUser.password;
        const token = jwt.sign({email: oldUser.email, id:oldUser._id}, secret, {
            expiresIn:"15m",
        });

        const link =  `http://localhost:8080/api/admins/reset-password/${oldUser._id}/${token}`;

        console.log("Shreyash")

        var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "",
              pass: "",
            },
        });

        var mailOption = {
            from:"",
            to:"",
            subject:"",
            text:``
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
              res.send(info.response);
            }
        });
        console.log(link);
    }catch(err){
        console.log(err);
    }
};


const getToken = async (req,res) => {
    const {id,token} = req.params;
    console.log(req.params);
    const oldUser = await Admin.findOne({_id:id});

    if(!oldUser){
        return res.json({status:"User not Exists"});
    }
    const secret = process.env.TOKEN_KEY+oldUser.password;
    try{
        const verify = jwt.verify(token,secret);
        res.send("Verified")
    }catch(err){
        console.log(error);
        res.send("Not Verified");
    }
}


const postToken = async (req,res) => {
    const {id, token} = req.params;
    const {password} = req.body;

    const oldUser = await Admin.findOne({_id:id});
    if(!oldUser){
        return res.json({status: "User Not Exist"});
    }

    const secret = process.env.TOKEN_KEY+oldUser.password;
    try{
        const verify = jwt.verify(token,secret);
        let salt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(password,salt);
        await Admin.updateOne(
            {
                _id:id,
            },
            {
                $set:{
                    password:encryptedPassword,
                },
            }
        );

        res.send("Password is cahnged");
    }catch(err){
        console.log(err);
        res.json({status:"Something went Wrong"});
    }
};



module.exports = {all_admins,single_admin,sign_up,login,add_Admin,deleteAdmin,updateAdmin,forget,getToken,postToken};
