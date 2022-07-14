
var db = require('../config/connection')
var collection = require('../config/collections')
const { ObjectId } = require('mongodb');
const req = require('express/lib/request');
const async = require('hbs/lib/async');
const { reject } = require('bcrypt/promises');
module.exports = {

  userStatus: (userData) => {
    let response = {}
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
      if (user) {
        if (user.status == "active") {
          console.log('active user');
          response.status = true
          resolve(response)
        } else {
          console.log('@@@@@@@@@@@@@blocked user');
          response.block = true
          resolve(response)
        }
      }
      else {
        console.log('blocked user');

        resolve({ status: false })
      }
    })


  },




  addProduct: (body, files) => {
    console.log(body);
    body.images = files
    body.pricess = parseInt(body.pricess)
    body.discountedprice = parseInt(body.discountedprice)
    body.saveprice = parseInt((body.pricess * body.discountedprice) / 100)
    body.price = parseInt(body.pricess - body.saveprice)
    console.log(body);
    return new Promise(async (resolve, reject) => {

      await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(body)
      resolve();
    })

  },

  addProductImage: (product_id, image_path) => {
    console.log("product : " + product_id + " image path : " + image_path);
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
        { _id: ObjectId(product_id) },
        {
          $push: [{
            img_path: image_path,
          }],
        }
      )
        .then((response) => {
          resolve();
        });
    });
  },

  getAllProduct: () => {
    return new Promise(async (resolve, reject) => {
      let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
      resolve(product)
    })
  },

  getProductDetails: (productId) => {
    return new Promise((res, rej) => {

      db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(productId) }).then((product) => {

        res(product)
      }).catch((err) => {

        rej()
      })
    })
  },

  updateProduct: (productId, productDetails) => {
    console.log(productDetails);
    productDetails.price = parseInt(productDetails.price)
    productDetails.pricess = parseInt(productDetails.pricess)
    productDetails.discountedprice = parseInt(productDetails.discountedprice)
    productDetails.saveprice = parseInt(productDetails.pricess * productDetails.discountedprice) / 100
    productDetails.price = parseInt(productDetails.pricess - productDetails.saveprice)
    console.log(productDetails.price);

    return new Promise((resolve, reject) => {

      db.get().collection(collection.PRODUCT_COLLECTION)
        .updateOne({ _id: ObjectId(productId) }, {
          $set: {

            name: productDetails.name,
            category: productDetails.category,
            discription: productDetails.discription,
            discountedprice: productDetails.discountedprice,
            pricess: productDetails.pricess,
            price: productDetails.price,
            saveprice: productDetails.saveprice

          }
        }).then((response) => {
          console.log(response)
          resolve(response)
        })
    })
  },





  deleteProduct: (productId) => {
    return new Promise((res, rej) => {
      db.get().collection(collection.PRODUCT_COLLECTION).remove({ _id: ObjectId(productId) }).then((response) => {
        res(response)
      })
    })
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()

      resolve(users)
    }) 
  },
  blockUser: (id) => { 
    return new Promise((res, rej) => {
      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { status: true, status: false } }).then((block) => {
        res(block)
      })
    })
  },

  unblockUser: (id) => {
    return new Promise((res, rej) => {
      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { status: false, status: true } }).then((unblock) => {
        res(unblock)
      })
    })
  },



  Category: (body, files) => {
    body.images = files
    body.offer = parseInt(body.offer)
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.CATAGORY_COLLECTION).insertOne(body)
      resolve();
    })
  },

  getcategoryDetails: (categoryId) => {
    return new Promise((res, rej) => {
      db.get().collection(collection.CATAGORY_COLLECTION).findOne({ _id: ObjectId(categoryId) }).then((category) => {
        res(category)
      })
    })
  },

  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = await db.get().collection(collection.CATAGORY_COLLECTION).find().toArray()
      resolve(category)
    })
  },

  deleteCategory: (categoryId) => {
    return new Promise((res, rej) => {
      db.get().collection(collection.CATAGORY_COLLECTION).remove({ _id: ObjectId(categoryId) }).then((response) => {
        res(response)
      })
    })
  },
  updateCategory: (categoryId, categoryDetails) => {
    console.log(categoryDetails);

    return new Promise((resolve, reject) => {
      categoryDetails.offer = parseInt(categoryDetails.offer)
      db.get().collection(collection.CATAGORY_COLLECTION)
        .updateOne({ _id: ObjectId(categoryId) },
          {
            $set: {


              categoryname: categoryDetails.categoryname,
              offer: categoryDetails.offer


            }
          }).then((response) => {
            resolve()
          })
    })
  },

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ time: -1 }).toArray()
      resolve(orders)
    })
  },


  Cancelstatus: (Orderid) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(Orderid) },
        {
          $set: { status: 'Cancelled' }
        }).then(() => {
          resolve()
        })
    })
  },

  Deliverystatus: (Orderid) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(Orderid) },
        {
          $set: { status: 'Deliverd' }
        }).then(() => {
          resolve()
        })
    })
  },

  Shippedstatus: (Orderid) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(Orderid) },
        {
          $set: { status: 'Shipped' }
        }).then(() => {
          resolve()
        })
    })
  },

  Returnedstatus: (Orderid) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(Orderid) },
        {
          $set: { status: 'Returned' }
        }).then(() => {
          resolve()
        })
    })
  },



  totalSales: () => {
    return new Promise(async (resolve, reject) => {

      let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
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



  PaypaltotalSales: () => {
    return new Promise(async (resolve, reject) => {

      let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            paymentMethord: "paypal",
          }
        },
        {
          $group: {

            _id: null,
            total: { $sum: '$totalAmount' }
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




  CODtotalSales: () => {
    return new Promise(async (resolve, reject) => {

      let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            paymentMethord: "COD",
          }
        },
        {
          $group: {

            _id: null,
            total: { $sum: '$totalAmount' }
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




  RazorpaytotalSales: () => {
    return new Promise(async (resolve, reject) => {

      let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            paymentMethord: "Razorpay",
          }
        },
        {
          $group: {

            _id: null,
            total: { $sum: '$totalAmount' }
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

  addcoupon: (body) => {
    console.log(body);
    body.Couponoffer = parseInt(body.Couponoffer)
    return new Promise(async (resolve, reject) => {
      db.get().collection(collection.COUPON_COLLECTION).insertOne(body)
      resolve()
    })
  },


  getcoupon: () => {
    return new Promise(async (resolve, reject) => {
      let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
      resolve(coupon)
    })
  },


  addBanner: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.BANNER_COLLECTION).insertOne(body)
      resolve()
    })
  },
  deleteCoupon: (couponId) => {
    return new Promise((res, rej) => {
      db.get().collection(collection.COUPON_COLLECTION).remove({ _id: ObjectId(couponId) }).then((response) => {
        res(response)
      })
    })
  },


  addCategoryOffer: (name) => {
    console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv");
    return new Promise(async (resolve, reject) => {
      let category = await db.get().collection(collection.CATAGORY_COLLECTION).findOne({ categoryname: name })
      console.log(name);
      console.log(category);
      let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
        {
          $match: {
            category: name

          }
        },
      ]).toArray()

      console.log(product);
      resolve(product)

      product.map(async (value, index) => {
        let id = value._id
        let offers = value.price - category.offer
        console.log(offers);
        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(id) },
          {
            $set: {
              price: offers
            }
          })
      })

      resolve()

    })
  },

  datereport: (to, from, type) => {
    console.log(from);
    console.log(to);
    console.log(type);
    return new Promise(async (resolve, reject) => {

      let report = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

        {
          $match: {

            status: type,
            time: {
              $gte: from,
              $lte: to
            },

          }
        },

        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'products.item',
            foreignField: '_id',
            as: 'product'
          }
        }, {
          $lookup: {
            from: collection.USER_COLLECTION,
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        }

      ]).toArray()

      console.log("hihihihihihih");
      resolve(report)
    })
  },

  getDailySales: () => {
    return new Promise(async (resolve, reject) => {

      let Dailysales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled', 'pending'] }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$time" } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          }
        },
        {
          $sort: { _id: 1 },
        }
      ]).toArray()
      resolve(Dailysales)
    })
  },


  getWeeklySales: () => {
    return new Promise(async (resolve, reject) => {

      let Monthlysales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled', 'pending'] }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$time" } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          }
        },
        {
          $sort: { _id: 1 },
        }
      ]).toArray()
      resolve(Monthlysales)
    })
  },




  getYearlySales: () => {
    return new Promise(async (resolve, reject) => {

      let Yearlysales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            "status": { $nin: ['cancelled', 'pending'] }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y", date: "$time" } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          }
        },
        {
          $sort: { _id: 1 },
        }
      ]).toArray()
      resolve(Yearlysales)
    })
  },


}


