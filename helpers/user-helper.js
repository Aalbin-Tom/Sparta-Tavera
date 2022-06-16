var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const async = require("hbs/lib/async");
var objectId = require('mongodb').ObjectId
const collections = require('../config/collections');
const { response } = require('../app');
const { ObjectId } = require('mongodb');
const res = require('express/lib/response');
const { reject, promise } = require('bcrypt/promises');
const { isSafeFromPollution } = require('express-fileupload/lib/utilities');
const { DefaultsList } = require('twilio/lib/rest/autopilot/v1/assistant/defaults');


module.exports = {


    addProduct: (product, callback) => {
        console.log(product);
        db.get().collection('product').insertOne(product).then((data) => {

            callback(data)
        })
    },

    doSignup: (userData) => {

        return new Promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 10)
            console.log(userData.password);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                // db.get().collection(collection.USER_COLLECTION).updateOne({email:userData.email},{$set:{status:true}})
                console.log(userData);
                resolve(data)
            })


        })

    },

    signUp: (email) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let emails = await db.get().collection(collection.USER_COLLECTION).findOne({ email: email.email });
            if (emails) {
                response.status = true
                resolve(response)

            } else {
                resolve({ status: false })
            }
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
                .updateOne({ _id: objectId(userId) }, {
                    $set: {
                        name: userDetails.name,
                        email: userDetails.email

                    }
                }).then((response) => {
                    resolve()
                })
        })
    },

    checkUser: (userData) => {
        return new Promise(async (resolve) => {
            let response = []
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                response.status = true
                response.user = user
                resolve(response)



            } else {
                resolve(response)
            }

        })
    },
    addToCart: (productId, userId) => {
        let productObj = {
            item: objectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {

                let proExist = userCart.product.findIndex(products => products.item == productId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId), 'product.item': objectId(productId) },
                        {
                            $inc: { 'product.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()
                    })

                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { product: productObj }

                        }).then((res) => {
                            resolve()
                        })
                }

            } else {
                let cartObj = {
                    user: objectId(userId),
                    product: [productObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })

            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {

            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
                // { 
                //     $lookup: {
                //         from: collection.PRODUCT_COLLECTION,
                //         let: { prodList: '$product' },
                //         pipeline: [
                //             {
                //                 $match: {
                //                     $expr: {
                //                         $in:['$_id',"$$prodList"]
                //                     }
                //                 }
                //             }
                //         ],
                //         as: 'cartItems'
                //    }
                // }

            ]).toArray()
            // console.log(cartItems)
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            console.log(cart);
            if (cart) {
                count = cart.product.length
                resolve(count)
            } else {
                resolve(count)
            }

        })
    },

    changeproductquantity: (details) => {
        details.count = parseInt(details.count)
        console.log(details.count);
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {

                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart) },
                    {
                        $pull: { product: { item: ObjectId(details.product) } }
                    }).then((response) => {
                        // response.removedItem = true
                        resolve({ removeProduct: true })

                    })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'product.item': objectId(details.product) },
                        {
                            $inc: { 'product.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })
            }
        })
    },

    removeCartProduct: (details) => {
        // details.count = parseInt(details.count)
        // console.log(details.count);
        return new Promise((resolve, reject) => {


            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart) },
                {
                    $pull: { product: { item: ObjectId(details.product) } }
                }).then((response) => {
                    resolve({ removeProduct: true })

                })

        })
    },


    Addres: (Addres) => {

        return new Promise(async (resolve, reject) => {
            console.log('datakitii');
            db.get().collection(collection.ADDRES_COLLECTION).insertOne(Addres).then((data) => {
                console.log(data);
                resolve(data)
            })


        })

    },

    getAddresdetails: (userId) => {
        return new Promise((res, rej) => {
            db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(userId) }).then((user) => {
                res(user)
            })
        })
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }

                }

            ]).toArray()
            console.log(total)
            if (total[0]) {


                resolve(total[0].total)
            } else {
                resolve([0])
            }
        })

    },

    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            console.log(order, products, total);
            let status = order['payment-method'] === 'COD' ? 'Plced' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    name: order.name,
                    address: order.address,
                    pincode: order.pincode,
                    mobile: order.number,
                    email: order.email,
                },
                userId: objectId(order.userId),
                paymentMethord: order['payment-method'],
                products: products,
                totalAmount: total,
                status: status
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })


            })
            resolve(response)

        })


    },

    getCartProductsList: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) }).then((cart) => {
                console.log(cart);
                resolve(cart.product)
            })

        })
    },
    getCatName: (name) => {
        return new Promise(async (resolve, reject) => {
            let pro = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: name }).toArray()
            resolve(pro)
            console.log(pro + "zzzzzzzzzzzzzzzzzzzzzx");
        })


    },

    singleProductAmount: (userId) => {
        return new Promise(async (resolve, reject) => {

            let producttotal = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {

                        item:1, quantity:1,product:1, total: { $multiply: ['$quantity', '$product.price'] }
                    }

                }

            ])
            console.log(producttotal+'nvhvhhvhvvhvhvhvhvhvhvhvhvhh')
            if (producttotal) {
                resolve(producttotal.total)
            } else {
                resolve()
            }
        })

    },
    // deleteCart:(userId)=>{
    //     return new promise((reolve,reject)=>{
    //             resolve()
    //         })

    //     })

    // },

}


