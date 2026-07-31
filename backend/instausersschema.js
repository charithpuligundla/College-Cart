const mongoose =require('mongoose');

const instaschema=new mongoose.Schema({
    userName:String,
    password:String,
});

module.exports=mongoose.model('instauser',instaschema);