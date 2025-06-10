import userModel from "../models/user.model";

export const createUser = async({
    email, password
}) => { 
    if(!email || !password){
        throw new Error('Email or password are req..')
    }

    const hashedPassword = await userModel.hashPassword(password)
    const user = await userModel.create({
        email,
        password: hashedPassword
    })
    return user;
}