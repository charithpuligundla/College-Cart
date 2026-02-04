const mongoose =require('mongoose');

const UserSchema=new mongoose.Schema({
    userName:String,
    email:{type:String,unique:true},
    password:String,
    degree:String,
    branch:String,
    year:Number,
    no_requests:{
        type:Number,
        default:0
    },
    no_accepted:{
        type:Number,
        default:0
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    status: {
          type: String,
          enum: ["out","in"],
          default: "in"
        },
});

module.exports=mongoose.model('User',UserSchema);