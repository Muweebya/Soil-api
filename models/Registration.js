//defining our schema
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const registrationSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
        
    },

    role:{
        type:String,
        trim:true,
        required:true,
        enum: ['farmer', 'admin'],

    },
   

    
    emailaddress:{
        type:String,
        trim:true,
        required:true,
        

    },
    
    
    

    
    

    
});
registrationSchema.plugin(passportLocalMongoose,{
    usernameField: 'emailaddress'
    
})
module.exports = mongoose.model('registration', registrationSchema);