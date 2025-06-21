import mongoose from "mongoose";
import projectModel from "../models/project.model.js";

export const createProject = async ({
    name,
    userId
}) => {
    if(!name) {
        throw new Error('Name is required')
    }
    if(!userId){
        throw new Error('UserId required')
    }

    const project = await projectModel.create({
        name,
        users: [ userId ]
    })

    return project;
}

export const getAllProjectByUserId = async ({ userId }) => {
    if(!userId){
        throw new Error('UserId is required')
    }

    const allUserProjects = await projectModel.find({
        users: userId
    })
    return allUserProjects
}

export const addUsersToProject = async ({ projectId, users, userId }) => {
    if(!projectId) {
        throw new Error("ProjectId required")
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if(!users) {
        throw new Error("Users are required")
    }

    if(!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId in users array")
    }

    if(!userId){
        throw new Error("UserId is required")
    }

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new Error("Invalid UserId")
    }

    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })

    if(!project){
        throw new Error("User do not belong to this project")
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    },{
        $addToSet:{
            users:{
                $each: users
            }
        }
    },{
        new: true
    })

    return updatedProject
}

export const getProjectById = async ({ projectId }) => {
    if(!projectId){
        throw new Error("ProjectId is required")
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("Invalid ProjectId")
    }

    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users')
    return project
}

export const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!fileTree) {
        throw new Error("fileTree is required")
    }

    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })
    return project;
}