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
const { log } = require('console');

var instance = new Razorpay({
    key_id: 'rzp_test_LzENomul3uevEZ',
    key_secret: 'XR8HpjEDW4U4yk01pct2rnkA',
});
const paypal = require('paypal-rest-sdk');
const { get } = require('express/lib/response');
const { resolve } = require('path');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AfP1rKhgP7oDwDO8RMHIA2Hyj39G8qyKOsN2G87VruR0gIh3yvwiLwDPlCk-6QyJfUgCt3vw0Ppkd0TH',
    'client_secret': 'EAhmOUwpXxN16sZx5JmaIzNS1HDM-DDE2LxqhZD3tkjpsqq9q-wi5xegDC13-r0bKE0bUlR4PDtcJy9o'
});

module.exports = {


    addProduct: (product, callback) => {
        db.get().collection('product').insertOne(product).then((data) => {

            callback(data)
        })
    },

    doSignup: (userData) => {
        userData.address = []
        return new Promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {


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
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        response.user = user;
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({ status: false })
                      

                    }
                })
            } else {
                
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
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId), 'product.item': objectId(productId) },
                        {
                            $inc: { 'product.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve({ proexist: true })
                    })

                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { product: productObj }

                        }).then((res) => {
                            resolve({ status: true })
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


            ]).toArray()
                resolve(cartItems)   

        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
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
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {

                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart) },
                    {
                        $pull: { product: { item: ObjectId(details.product) } }
                    }).then((response) => {
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

    getAddresdetails: (userId,id) => {
        let ids =id.index
        ids=parseInt(ids)

        return new Promise((res, rej) => {
            db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(userId) }).then((user) => {
                res(user.address[ids])
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
            if (total[0]) {

                resolve(total[0].total)

            } else {

                resolve([0])
            }
        })

    },


    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            let status = order['payment-method'] === 'COD' ? 'Placed' : 'pending'
            var date = new Date()
            var month = date.getUTCMonth() + 1
            var day = date.getUTCDate()
            var year = date.getUTCFullYear()

            let orderObj = {
                deliveryDetails: {

                    name: order.name,
                    address: order.address,
                    pincode: order.pincode,
                    mobile: order.number,
                    email: order.email,
                    city:order.city
                },
                userId: objectId(order.userId),
                paymentMethord: order['payment-method'],
                products: products,
                totalAmount: total,
                total_amount:order.total_amount,
                coupon_amount:order.coupon_amount,
                date: year + "/" + month + "/" + day, 
                time: new Date(),
                status: status
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })
                resolve(response)
            })


        })


    },

    getCartProductsList: (userId) => {
        return new Promise( (resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) }).then((cart) => {
               
                if(cart){
                      resolve(cart.product)
                }
            else{
                resolve(false)
            }
              
            })

        }) 
    },



    getCatName: (name) => {
        return new Promise(async (resolve, reject) => {
            let pro = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: name }).toArray()
            resolve(pro)
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

                        item: 1, quantity: 1, product: 1, total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }

                }

            ]).toArray()
            if (producttotal) {
                resolve(producttotal)
            } else {
                resolve()
            }
        })

    },



    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) })
                .sort({ time: -1 })
                .toArray()
            resolve(orders)
        })
    },

    getUserOrder: (id) => {
        return new Promise(async (resolve, reject) => {
            
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: objectId(id),}).toArray()
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
            resolve(orderItems)

        })
    },


    cancelOrderList: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(id) }, { $set: { status: false } }).then((cancel) => {
                resolve(cancel)

            })

        })
    },


    changePassword: (data, id) => {

        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(id) })
            if (user) {

                bcrypt.compare(data.oldpass, user.password).then(async (status) => {
                    if (status) {
                        let password = await bcrypt.hash(data.newpass, 10)
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                            $set: {
                                password: password
                            }
                        }).then((response) => {
                            response.status = true
                            resolve(response)
                        })
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })

            }
        })
    },


    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId.insertedId
            }
            instance.orders.create(options, function (err, order) {
                if (err) {
                } else {
                    resolve(order)
                }
            }) 

        })
    },



    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'XR8HpjEDW4U4yk01pct2rnkA')

            hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
            hmac = hmac.digest('hex')
            if (hmac == details.payment.razorpay_signature) {
                resolve()
            } else {
                reject()
            }
        })
    },

    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            status: 'Placed'
                        }
                    }
                ).then(() => {
                    resolve()
                })
        })
    },

    addToWhishlist: (productId, userId) => {
        let proObj = {
            item: objectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.WISH_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.product.findIndex(products => products.item == productId)

                if (proExist != -1) {
                    db.get().collection(collection.WISH_COLLECTION).updateOne({ user: objectId(userId), 'product.item': objectId(productId) },
                        {
                            $inc: { 'product.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()

                    })

                } else {
                    db.get().collection(collection.WISH_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { product: proObj }
                        }


                    ).then((data) => {
                        resolve(data);
                    })
                }

            } else {
                let cartObj = {
                    user: objectId(userId),
                    product: [proObj]
                }
                db.get().collection(collection.WISH_COLLECTION).insertOne(cartObj).then((data) => {
                    resolve(data)

                })
            }

        })
    },

    getWishList: (userId) => {
       
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.WISH_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },

                {
                    $project: {
                        item: '$product.item',

                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        item: 1, product: { $arrayElemAt: ['$products', 0] }
                    }
                }
            ]).toArray()

            resolve(cartItems)
        })
    },

    generatePaypal: (orderId, total) => {
        return new Promise((resolve, reject) => {

            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/success",
                    "cancel_url": "http://localhost:3000/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "Red Sox Hat",
                            "sku": "001",
                            "price": total,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": total
                    },
                    "description": "Hat for the best team ever"
                }]
            };
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {

                    resolve(payment)
                }
            });

        })
    },


    getTotal: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) }).then((response) => {
                resolve(response)
            })
        })
    },

    returnedstatus: (Orderid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(Orderid) },
                {
                    $set: { status: 'Returned-request' }
                }).then(() => {
                    resolve()
                })
        })
    },

    getCoupon: (name, userid) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ Couponname: name })
            if (coupon) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userid) }, {
                    $set: {
                        couponname: coupon.Couponname,
                        couponoffer: coupon.Couponoffer
                    }
                })
                resolve({ status: true })
            } else {
                resolve({ status: false })
            }


        })
    },

    getCoupons: (userid) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userid) })

            if (coupon) {
                resolve(coupon)
            } else {
                resolve(false)
            }

        })
    },
    Coupon: (userid) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userid) })

            if (coupon.couponoffer) {
                resolve(coupon)
            } else {
                resolve(false)
            }

        })
    },


    getReferal: (body) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ referalcode: body.referal }).then((user) => {
                if (user.referalAmount) {
                    resolve(user.referalAmount)
                } else {
                    resolve(false)
                }


            })

        })

    },


    getallAddress: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(id) }).then((user) => {

                resolve(user)

            })
        })

    },
    //very important address-updation
    getaddress: (id, userId, body) => {
        return new Promise((resolve, reject) => {


            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    "address.$[elem].name": body.name,
                    "address.$[elem].email": body.email,
                    "address.$[elem].address": body.address,
                    "address.$[elem].city": body.city,
                    "address.$[elem].pincode": body.pincode,
                    "address.$[elem].phone": body.phone
                },
            }, { arrayFilters: [{ "elem.addressId": id }] }).then((s) => {

            })
        })
    },

    deleteadderss: (userId, id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).update({ _id: objectId(userId) },
                {
                    $pull: {
                        address: {
                            addressId: id
                        }
                    }  

                },false,
                    true).then((r) => {
                  resolve(r)
                })

        })
    },
    removeList: (proID, userID) => {
        return new Promise((res, rej) => {
            db.get().collection(collections.WISH_COLLECTION).updateOne({ user: objectId(userID) }, { $pull: { products: { item: objectId(proID) } } }).then(() => {
                res()
            })
        })
    },



}


