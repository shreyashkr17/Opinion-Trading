const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const { error } = require("console");
const CounterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('adminCounter', CounterSchema);

const adminSchema = new mongoose.Schema({
    status:{
        type:String,
    },
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true
    },
    password:{
        type:String,
    },
    company:{
        type:String,
    },
    mobile:{
        type:Number,
        required:true,
        trim:true,
        unique:true,
    },
    access:{
        type:String,
    },
    kyc:{
        type:String,
    },
    money:{
        winning_commision:{
            type:Number,
        },
        tradin_fee:{
            type:Number,
        }
    },
    role:{
        type:String,
    },
    u_id:{
        type:String,
        unique:true
    }
});

adminSchema.pre('save', function(next) {
    const doc = this;
    Counter.findByIdAndUpdate(
        {_id:'adminId'},
        {$inc:{seq:1}},
        {new:true,upsert:true}
    )
    .then((counter) => {
        doc.u_id = counter.seq;
        next();
    })
    .catch((error) => {
        next(error);
    });
})

adminSchema.pre('save', async function(next) {
    let salt = await bcrypt.genSalt(10);
    let hashedString = await bcrypt.hash(this.password, salt);
    this.password = hashedString;
    console.log(this.password);
})

const Admin = mongoose.model("Admin",adminSchema);
module.exports = Admin;