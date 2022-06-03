var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const async = require("hbs/lib/async");
var objectId = require('mongodb').ObjectId
const collections = require('../config/collections');
const { response } = require('../app');
const { ObjectId } = require('mongodb');
const res = require('express/lib/response');


module.exports = {


        addProduct:(product,callback)=>{ 
        console.log(product);
        db.get().collection('product').insertOne(product).then((data)=>{
           
          callback(data)
        })
    },

    doSignup: (userData) => {

        return new Promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 10)
            console.log(userData.password);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
               console.log(userData);
                resolve(data)
            })


        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            // let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                console.log(user)
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login sucess");
                        response.user = user;
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({ status: false })
                        console.log("login failed")

                    }
                })
            } else {
                console.log("login failed due to ");
                resolve({ status: false })

            }

        })
    },



    getAllUser: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    },

    deleteUser: (userId) => {
        return new Promise((res, rej) => {
            db.get().collection(collections.USER_COLLECTION).remove({ _id: objectId(userId) }).then((response) => {
                console.log(response);
                res(response)
            })
        })
    },

    getuserdetails: (userId) => {
        return new Promise((res, rej) => {
            db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(userId) }).then((user) => {
                res(user)
            })
        })
    },


    updateUser: (userId, userDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION)
                .updateOne({ _id: objectId(userId)}, {
                    $set:{
                        name:userDetails.name,
                        email:userDetails.email
                       
                }
                }).then((response)=>{
                    resolve()
                })
        })
    },

    checkUser:(userData)=>{
        return new Promise(async(resolve)=>{
            let response=[]
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){ 
                response.status=true
                response.user=user
                resolve(response)
               
    
            
            }else{
                resolve(response)
            }
    
        })
    }

    }