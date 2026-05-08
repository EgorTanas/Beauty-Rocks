const User = require("../models/user")
const bcrypt = require("bcryptjs")

//Create User function
exports.signUp = async(req, res)=>{
	const {username, email, password } = req.body;
	try{

		const userExist = await User.findOne({email});
		if(userExist) return res.status(400).json({message : "User exists."});

		const newUser = await User.create({
			username,
			email,
			password
		})
		res.status(201).json({message : "User created"})
	}catch(error){
		res.status(500).json({error: "Internal server error."})
	}

}