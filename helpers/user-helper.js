var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const async = require("hbs/lib/async");
var objectId = require('mongodb').ObjectId
const collections = require('../config/collections');
const { response } = require('../app');
const Razorpay = require('razorpay');
const { ObjectId } = require('mongodb');
const res = require('express/lib/response');
const { reject, promise } = require('bcrypt/promises');
const { isSafeFromPollution } = require('express-fileupload/lib/utilities');
const { DefaultsList } = require('twilio/lib/rest/autopilot/v1/assistant/defaults');

var instance = new Razorpay({
    key_id: 'rzp_test_LzENomul3uevEZ',
    key_secret: 'XR8HpjEDW4U4yk01pct2rnkA',
  });


module.exports = {


    addProduct: (product, callback) => {
        console.log(product);
        db.get().collection('product').insertOne(product).then((data) => {

            callback(data)
        })
    },

    doSignup: (userData) => {
        userData.address = []
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
                },
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
            console.log(cartItems)
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


    Addres: (body, userId) => {
        new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) });
            console.log(user);
            if (user.address) {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                    {
                        $push: { address: body }
                    }).then(() => {
                        resolve(response)
                    })
            } else {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                    $set: { address: body }
                }).then(() => {
                    resolve(response)
                })
            }
        });


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
                // usename: objectId(order.username),
                paymentMethord: order['payment-method'],
                products: products,
                totalAmount: total,
                date: new Date(),
                status: status
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })
             resolve(response)

            })
           

        })


    },

    getCartProductsList: (userId) => {
        return new Promise( async(resolve, reject) => {
          await  db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) }).then((cart) => {
                // console.log(cart);
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
            // let data = await db.get().collection(collection.CART_COLLECTION).find({ user: objectId(userId) }).toArray()
            // console.log(data);

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
                // {
                //     $unwind: '$product'
                // },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {

                        item: 1, quantity: 1, product: 1, total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }

                }

            ]).toArray()
            console.log(producttotal)
            if (producttotal) {
                resolve(producttotal)
            } else {
                resolve()
            }
        })

    },



    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()
            console.log(orders);
            resolve(orders)
        })
    },




    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',


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
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            // console.log(orderItems);
            resolve(orderItems)

        })
    },


    cancelOrderList:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(id)},{$set:{status:false}}).then((cancel) => {
                resolve(cancel)
                console.log(cancel);
            })

        })
    },


    changePassword: (data,id) => {
        console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
        console.log(data);
 console.log(data.oldpass);
                console.log(data.newpass);
        return new Promise(async (resolve, reject) => {
            console.log('change password000000000000000000000000000000');
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id:objectId(id) })
            console.log(user);
            if (user) {
               
                bcrypt.compare(data.oldpass, user.password).then(async (status) => {
                    console.log(data);
                    if (status) {
                        let password = await bcrypt.hash(data.newpass, 10)
                        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(id) }, {
                            $set: {
                                password: password
                            }
                        }).then(() => {
                            resolve({ status: true })
                        })  
                        console.log('password');
                    } else {
                        console.log('failed 1');
                        resolve({ status: false })
                    }
                }) 
            } else {
                console.log('failed');
                resolve({ status: false })

            }
        })
    },


    generateRazorpay:(orderId,total)=>{
        console.log(orderId);
        return new Promise((resolve,reject)=>{
            var options = {
              amount:total*100,
              currency:"INR",
              receipt:""+orderId.insertedId
            }
            instance.orders.create(options,function(err,order){
                if(err){
                    console.log(err);
                }else{
             console.log("New Order :", order);
             resolve(order)
                }
            })

        })
    },

    

    verifyPayment:(details)=>{
       return new Promise((resolve,reject)=>{
        const crypto =require('crypto')
        let hmac = crypto.createHmac('sha256','XR8HpjEDW4U4yk01pct2rnkA')

        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
        hmac=hmac.dihest('hex')
        if(hmac==details['payment[razorpay_signature]']) {
            resolve()
        } else{
            reject()
        }
    })
    },

    changePaymentStatus:(orderId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({_id:objectId(orderId)},
        {
            $set:{
                     status:'placed'
            }
        }
        ).then(()=>{
            resolve()
        })
    })
    }


}


