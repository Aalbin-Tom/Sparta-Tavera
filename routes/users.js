var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/user-helper')
const userHelper = require('../helpers/user-helper');
const otp = require("../config/otp");
const { redirect } = require('express/lib/response');
const req = require('express/lib/request');
const res = require('express/lib/response');
const adminHelper = require('../helpers/admin-helper');
const async = require('hbs/lib/async');
const { response } = require('../app');
// const client = require("twilio")(otp.accountSID, otp.authToken)
require('dotenv').config()
const SSID=process.env.serviceSID
const ASID=process.env.accountSID
const AUID=process.env.authToken
const client = require("twilio")(ASID,AUID)
const paypal = require('paypal-rest-sdk');
const shortid = require('shortid');
const { route } = require('./admin');



//........................middlewear......................
const ok = async (req, res, next) => {

  if (req.session.userData) {
    await userHelper.getCartCount(req.session.userData._id).then((count) => {
      req.session.count = count
      next()
    })

  } else {

    next()
  }
}




/* GET users listing. */
router.get('/', ok, async function (req, res) {
  let cartCount = null
  let category = await adminHelper.getCategory()
  if (req.session.userData) {
    cartCount = await userHelper.getCartCount(req.session.userData?._id)
    req.session.count = cartCount
  }
  var product = null
  adminHelper.getAllProduct().then((products) => {
    
    if (req.session.help) {

      product = req.session.catshow

    } else {
      product = products
   
    }

    req.session.help = false

    res.render('home', { user: true, userData: req.session.userData, cartCount: req.session.count, product, category });
  }).catch((err)=>{
    res.redirect('404')
  })
  
})

 
//login get 
router.get('/login', (req, res) => {
  if (req.session.login) {

    res.redirect('/')
  } 
  res.render('user/login', { logginErr: req.session.logginErr, warn: req.session.logerr });
  req.session.logginErr = null
  req.session.blocked = null
 
});

//login post

router.post('/login', (req, res) => {

  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {

      req.session.loggedIn = true
      req.session.userData = response.user
      res.redirect('/verify')
    } else {
      req.session.logginErr = "Invalid Username or Password"
      res.redirect('/login')

    }
  })
});



//................................login with otp......................................................................................................................................


// router.post('/login',  (req, res) => {

//   userHelper.doLogin(req.body).then((response) => {

// //  if(response.user.status){



//     req.session.phone=response.user?.phone
//     let user = response.user
//     if (response.status) {
//      // req.session.login = true
//      // req.session.user = response.user
//       var Number = response.phone
//       client.verify
//       .services(SSID)
//       .verifications
//       .create({
//         to:`+91${user.phone}`,
//         channel:'sms'
//       })
//       .then((data)=>{
//       //  req.session.loggedin = true
//        req.session.userData = response.user
//         res.redirect('/verify')
//       })

//     } else {
//       req.session.logginErr = 'Invalid username or password'
//       res.redirect('/login')
//     }
//   // }else{
//   //   req.session.logerr='User is blocked'
//   //   res.redirect('/login')
//   // }

//   })
//   })



//signup get 
router.get('/signup', (req, res) => {
  if (req.session.userData) {
    res.redirect('/')
  } else {
    res.render('user/signup', { signinErr: req.session.signinErr });
    req.session.signinErr = null
  }
});

//..............signup post


router.post('/signup', function (req, res, next) {
  req.body.referalcode=shortid.generate()
  req.body.referalAmount=parseInt(50)
  
  userHelper.signUp(req.body).then((response) => {
    if (response.status) {
      req.session.signinErr = "Email allready exits"
      res.redirect('/signup')
    } else {
      userHelper.doSignup(req.body).then((response) => {

        res.redirect('/login')

      })
    }
  })
})

//verify get 
router.get('/verify', (req, res) => {
  if (req.session.login) {
    res.redirect('/')

  } else {
    const Number = req.session.phone
    res.render('user/verify', { header: true, Number, userData: req.session.userData });
  }
});



 //............verify post.........

router.post('/verify', (req, res) => {
  if (req.body.otp == "1234") {

    res.redirect('/')
  }
  res.redirect('/verify');
});


//................................verify with otp......................................................................................................................................


// router.post('/verify', (req, res) => {
//   let Number =req.session.phone
//   var Otp = req.body.otp


//   client.verify
//     .services(SSID)
//     .verificationChecks.create({
//       to: `+91${Number}`,
//       code: Otp
//     })
//     .then((data) => {
//       if(data.status=='approved'){
//           req.session.login = true
//         res.redirect("/");
//       }else{
//         otpErr = 'Invalid OTP'
//         res.redirect('user/verify',{otpErr,Number,header:true})
//       }

// });

// })





//logout get 
router.get('/logout', function (req, res) {
  req.session.destroy()
  res.redirect('/')
})





//..............................single-product.............................................
router.get('/single-product/:id', ok, (req, res) => {
 

  adminHelper.getProductDetails(req.params.id).then((product) => {

    res.render('user/single-product', { user: true, userData: req.session.userData, product, cartCount: req.session.count });

  }).catch(()=>{
    res.render("404")
  })
  

});
//..............................cart.............................................


router.get('/cart', ok, async (req, res) => {
  if (req.session.userData) {
    let product = await userHelper.getCartProducts(req.session.userData?._id)

  let address = await userHelper.getallAddress(req.session.userData?._id)

    let singleProAmount = await userHelper.singleProductAmount(req.session.userData?._id)
     
    let totalamount = await userHelper.getTotalAmount(req.session.userData?._id)
    let couponoffer = await userHelper.getCoupons(req.session.userData?._id)
  
 if(product){
    if(couponoffer.couponoffer){ 
    var offer = couponoffer.couponoffer
    var offers =Math.round((totalamount * offer)/100)
    var subtotal =  Math.round(totalamount - offers)
    
  }else{
    var subtotal = totalamount
   
   var offer= 0
   var offers=0
  } 
   }

    res.render('user/cart', { user: true, totalamount, userData: req.session.userData,address,
      referalAmount:req.session.referal, cartCount: req.session.count, singleProAmount, product, subtotal, offer,offers})

  } else {
    res.redirect('/login',)
  }


})


//.............add-to-cart.....................................................

router.get('/add-to-cart/:id', (req, res) => {
  if (req.session.userData) {
    userHelper.addToCart(req.params.id, req.session.userData?._id).then((response) => {
      res.json(response)
    })
  } else {
    res.redirect('/login')
  }

})
//...................................

router.post('/changeproductquantity', (req, res, next) => {
  userHelper.changeproductquantity(req.body).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.session.userData?._id)
    response.catof = await userHelper.Coupon(req.session.userData?._id)
    response.referal = req.session.referal
    res.json(response)
  })
})

router.post('/remove-product', (req, res, next) => {
  userHelper.removeCartProduct(req.body).then((response) => {
    res.json(response)
  })
})





router.get('/check-out', ok, async (req, res) => {
  if (req.session.userData) {
   
    let address = await userHelper.getAddresdetails(req.session.userData?._id, req.session.addressId)
    let totalamount = await userHelper.getTotalAmount(req.session.userData?._id)
    let subtotal = totalamount 
    
    // response.referal = req.session.referal
    
    let couponoffer = await userHelper.getCoupons(req.session.userData?._id)

   
    if(couponoffer.couponoffer){ 
      
   var offer = couponoffer.couponoffer
    var offers =Math.round((totalamount*offer)/100)
     subtotal =  Math.round(totalamount - offers)
    
  }else{
     subtotal
    
   var offer= 0
   var offers=0
  } 

  if(req.session.referal){

      subtotal =subtotal-50
      
 
  }else{
    subtotal
  }

    res.render('user/checkout', { user: true, address, userData: req.session.userData, totalamount, subtotal, referal: req.session.referal, cartCount: req.session.count,offer,offers })
 
  } else {
    res.redirect('/login')
  }
})



router.post('/check-out', async (req, res) => {
  let products = await userHelper.getCartProductsList(req.session.userData?._id)
  
  let totalPric = await userHelper.getTotalAmount(req.session.userData?._id)
  
  let couponoffer = await userHelper.getCoupons(req.session.userData?._id)

    if(couponoffer.couponoffer){ 
    var offer = couponoffer.couponoffer
    var offers =Math.round((totalPric*offer)/100)
    var totalprice =  Math.round(totalPric  - offers)
    
  }else{
    var totalprice = totalPric  
   var offer= 0
   var offers=0
  } 
  if(req.session.referal){
    totalprice=totalprice-50
  }else{
    totalprice
  }

  userHelper.placeOrder(req.body, products, totalprice).then((orderId) => {
    req.session.orderid = orderId.insertedId
    if (req.body['payment-method'] === 'COD') {
      res.json({ status: true })
    } else if (req.body['payment-method'] === 'Razorpay') {
      userHelper.generateRazorpay(orderId, totalprice).then((response) => {
        response.status = false

        res.json(response)
      })
    } else {
      userHelper.generatePaypal(orderId, totalprice).then((payment) => {

        res.json(payment)
      })
    }
  })
})
//---------------sort category----------------

router.get('/showcart/:name', (req, res) => {


  let names = req.params.name
  userHelper.getCatName(names).then((pro) => {
    req.session.catshow = pro
    req.session.help = true
    res.redirect('/')
  })
})

//..........................user-profile...............

router.get('/user-profile', ok,async (req, res) => {
  if (req.session.userData) {
  let address=await userHelper.getallAddress(req.session.userData?._id)
    res.render('user/user-profile', { user: true, userData: req.session.userData, cartCount: req.session.count,address });

  } else {
    res.redirect('/')
  }

});


router.post('/user-profile', async (req, res) => {
  if (req.session.userData) {
    await userHelper.Addres(req.body).then((response) => {
      res.render('user/user-profile', { user: true, userData: req.session.userData });
    })
  } else {
    res.redirect('/')
  }
})

//................add-address...........................
router.get('/add-address', (req, res) => {
  if(req.session.userData){
     res.render('user/add-address', { user: true, cartCount: req.session.count, userData: req.session.userData })
  }else{
    res.redirect('/')
  }
 
})

router.post('/add-address', (req, res) => {
  if (req.session.userData) {


    let id = req.session.userData._id
    req.body.addressId = shortid.generate()
    userHelper.Addres(req.body, id)

    res.redirect('/user-profile')


  } else {
    res.redirect('/login')
  }
})



//.................................................



router.get('/payment-success', async (req, res) => {
  if (req.session.userData) {


    let totalamount = await userHelper.getTotalAmount()
    var subtotal = totalamount 
   

    res.render('user/payment-success', { user: true, userData: req.session.userData, subtotal, totalamount })
  } else {


    res.redirect('/login')
  }
})


//................get user order..........................
router.get('/orders', ok, async (req, res) => {
  if (req.session.userData) {
    let orders = await userHelper.getUserOrders(req.session.userData._id)
    res.render('user/orders', { userData: req.session.userData, user: true, orders, cartCount: req.session.count })
  } else {
    res.redirect('/login')
  }
})


//........get user order..........................

router.get('/view-orders/:id', ok, async (req, res) => {
  if (req.session.userData) {
    let products = await userHelper.getOrderProducts(req.params.id)
    let orders = await userHelper.getUserOrder(req.params.id)

    res.render('user/view-orders', { userData: req.session.userData, user: true, products, cartCount: req.session.count,orders })
  } else {
    res.redirect('/login')
  }
})

//.............cancel the order................

router.get('/cancelOrder/:id', (req, res) => {
  adminHelper.Cancelstatus(req.params.id).then(() => {
   

    res.json({ status: true })

  })
 
})


//..............change-password......................


router.get('/change-password', (req, res) => {
  if (req.session.userData) {
    res.render('user/change-password', { status: req.session.pass, stat: req.session.wrong, userData: req.session.userData, user: true, })

  } else {
    res.redirect('/login')



  }
})


router.post('/change-password', (req, res) => {
  if (req.session.userData) {

    userHelper.changePassword(req.body, req.session.userData?._id).then((response) => {
      if (response.status) {
        req.session.pass = " Password changed successfully"
        req.session.wrong = null

        res.redirect('/change-password')
      } else {
        req.session.pass = null
        req.session.wrong = "Old Password dosen't Match"
        res.redirect('/change-password')

      }
    })
  } else {
    res.redirect('/login')
  }
})

router.post('/verify-payment', (req, res) => {
  userHelper.verifyPayment(req.body).then(() => {
    userHelper.changePaymentStatus(req.body.order.receipt).then(() => {
      res.json({ status: true })
    })
  }).catch((err) => {
    res.json({ status: false, errMsg: '' })
  })
})

router.get('/wishlist', async (req, res) => {
  if (req.session.userData) {
    let product = await userHelper.getWishList(req.session.userData?._id)
    res.render('user/wishlist', { user: true, userData: req.session.userData, product, cartCount: req.session.count })
  } else {
    res.redirect("/login")
  }
})

router.get('/add-to-wishlist/:id', (req, res) => {
  userHelper.addToWhishlist(req.params.id, req.session.userData?._id).then(() => {
    res.redirect('/')
  })

})
// router.post('/removelist/:id', (req, res) => {
//   proID = req.params.id
//   userID = req.session.user._id
//   userHelper.removeList(proID, userID)
//   res.json({status:true})

// })

router.get('/success', async (req, res) => {
  userHelper.changePaymentStatus(req.session.orderid)
  let total = await userHelper.getTotal(req.session.orderid)
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": total.totalAmount
      }
    }]

  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      res.redirect('/payment-success');
    }
  });

});



router.get('/return-order/:id', (req, res) => {
  userHelper.returnedstatus(req.params.id).then((response) => {
    res.json({ status: true })
  })
})


router.post('/coupons', (req, res) => {
  if (req.session.userData) {
    req.session.cupoff =req.body.name
    userHelper.getCoupon(req.body.name, req.session.userData?._id).then((response) => {

      res.json( response )
    })
  }
})


router.post('/referal',(req,res)=>{
  userHelper.getReferal(req.body).then((response) => {
    req.session.referal=response
    res.json(response)
  })  
})

//...............edit address.........
router.post('/edit-address/:id',(req,res)=>{
  try{
  userHelper.getaddress(req.params.id,req.session.userData?._id,req.body)
  
  res.redirect('/user-profile')
  }catch(err){
    res.status(400)
  }
})

//...............edit address.........

router.get('/delete-address/:id',(req,res)=>{
  userHelper.deleteadderss(req.session.userData?._id,req.params.id) 
  res.redirect('/user-profile')
})
 


//................get all address...............................


 




router.post('/alladdress',(req,res)=>{
  req.session.addressId=req.body
  res.redirect('/check-out')
 
})

module.exports = router;
 