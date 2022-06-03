
var db= require('../config/connection')
var collection=require('../config/collections')
module.exports= {
   

   
  addProduct:(product,callback)=>{ 
        console.log(product);
        db.get().collection('product').insertOne(product).then((data)=>{
      
          callback(data.insertedId)
        })
    },
    
    getAllProduct: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            console.log(product);
            resolve(product)
        })
    },

//  ,
//  getAllUser:()=>{
//      return new Promise(async(res,rej)=>{
//          let user= await db.get().collection(collection.USER_COLLECTION).find().toArray()
//          res(user)
//      })
//  }
}


