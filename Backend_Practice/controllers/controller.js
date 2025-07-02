const User = require('../models/User');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

const jwtSecretKey = process.env.JWT_SECRET;

const emailValidator  = require('../validators/email_val');
const tokenSigner = require('../validators/sign_jwt');


exports.signup = async (req,res) => {
    const {name, email, password} = req.body;
    console.log("Request received",name);
    if (emailValidator(email)&& name!='' && password!=''){
        //checking if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(409).send("user already exists");
        }
        const hashedPassword = await bcrypt.hash(password,10);    //so salt is 10 rounds here
        const user = new User({
            name,
            email,
            password: hashedPassword
        });
        await user.save();
        console.log("User saved succesfully!");
        return res.status(201).send("User added succesfully!");
    }
    return res.status(400).send("Enter valid name,email and password!");
}

exports.fetchAllUsers = async (req,res)=>{ 
    try{    
        const Users = await User.find({});
        res.status(200).send(Users);
    }catch(err){
        console.log("Error occurred during fetching all Users:\n",err);
        res.status(400).send("Error in fetching all users");
    }
}

exports.fetchByEmail = async (req,res)=> {
    try{
        // if(Object.keys(req.body).length===0){
        //     const user = req.user;
        //     console.log(user);  
        // }
        const email = req.query.email;
        const fetchedUser = await User.findOne({email:email});
        // console.log(fetchedUser);
        res.status(200).json(fetchedUser);
    }catch(err){
        console.log("Error in fetching user by email",err)
        res.status(400).send("Error occurred in fetching email");
    }
    
}

exports.login = async (req,res) => {
    try{
        const {email,password} = req.body;
        var storedUser = await User.findOne({email:email});

        if(!storedUser){
            return res.status(401).send("User not found");
        }
        var hashedStoredPassword = storedUser.password;
        bcrypt.compare(password,hashedStoredPassword,function(err,result){
            if(err){
                console.log("Error during login",err);
                return res.status(510).send("Error during login");
            }
            if(result){
                // console.log("Passwords match");
                var signedToken = tokenSigner(storedUser,jwtSecretKey);
                return res.status(200).json({
                    message: "Login Succesful",
                    token: signedToken
                });
            }else{
                console.log("Passwords don't match");
                return res.status(410).send("Credentials do not match. Try again!");
            }
        })
        
    }catch(err){
        console.log("Error occurred: ".err);
        return res.status(400).send("Error occurred while logging in");
    }
}
exports.update = async(req,res)=> {
    const userName  = req.user.name;
    const updatedObject = {};
    for (const key in req.body){
        if(req.body[key]!=='' && req.body[key]!==null && req.body[key]!==undefined){
            updatedObject[key] = req.body[key];
        }
    }
    const updatedUser = await User.findOneAndUpdate(
        {name:userName},
        {$set:updatedObject},
        {new:true}
    );
    
    res.status(200).json(updatedUser);
}