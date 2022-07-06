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
const client = require("twilio")(otp.accountSID, otp.authToken)
const paypal = require('paypal-rest-sdk');
// const shordid =require('shortid');
const shortid = require('shortid');



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
  // console.log(category);
  var product = null
  adminHelper.getAllProduct().then((products) => {
    if (req.session.help) {

      product = req.session.catshow
      console.log(product);

    } else {
      product = products
      console.log(product);

    }

    req.session.help = false

    res.render('home', { user: true, userData: req.session.userData, cartCount: req.session.count, product, category });
  });
  if (req.session.userData) {
    cartCount = await userHelper.getCartCount(req.session.userData?._id)
    req.session.count = cartCount
  }
  // let category = await adminHelper.getCategory()
  // // console.log(category);
  // var product = null
  // adminHelper.getAllProduct().then((products) => {
  //   if (req.session.help) {

  //     product = req.session.catshow
  //     console.log(product);

  //   } else {
  //     product = products
  //     console.log(product);

  //   }

  //   req.session.help = false

  //   res.render('home', { user: true, userData: req.session.userData, cartCount: req.session.count, product, category });
  // });
})


//login get 
router.get('/login', (req, res) => {
  if (req.session.userData) {

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

// console.log(response.user.status);
//  if(response.user.status){



//     console.log(response);
//     req.session.phone=response.user?.phone
//     console.log('vannu')
//     let user = response.user
//     if (response.status) {
//       // console.log('mmmmmmmmmmmm');
//       console.log(user.phone);
//      // req.session.login = true
//      // req.session.user = response.user
//       var Number = response.phone
//       client.verify
//       .services(otp.serviceSID)
//       .verifications
//       .create({
//         to:`+91${user.phone}`,
//         channel:'sms'
//       })
//       .then((data)=>{
//        req.session.loggedin = true
//        req.session.userData = response.user
// console.log(user)
//         console.log(data+'iam line 40 data');
//         res.redirect('/verify')
//       })

//     } else {
//       req.session.logginErr = 'Invalid username or password'
//       res.redirect('/login')
//     }
//   }else{
//     req.session.logerr='User is blocked'
//     res.redirect('/login')
//   }

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
  console.log(req.body.referalcode);
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



// //verify post 
router.post('/verify', (req, res) => {
  if (req.body.otp == "1234") {
    console.log(otp);
    res.redirect('/')
  }
  res.redirect('/verify');
});


//................................verify with otp......................................................................................................................................


// router.post('/verify', (req, res) => {
//   var Number =req.session.phone
//   console.log(Number);
//   var Otp = req.body.otp

//   console.log(Otp);

//   client.verify
//     .services(otp.serviceSID)
//     .verificationChecks.create({
//       to: `+91${Number}`,
//       code: Otp
//     })
//     .then((data) => {
//       console.log(data.status + "otp status/*/*/*/");
//       if(data.status=='approved'){
//           req.session.login = true
//         res.redirect("/");
//       }else{
//         console.log(data.status+'no booyy');
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




// //shop  get 
// router.get('/shop', ok, async (req, res) => {
//   // if (req.session.userData) {
//   let category = await adminHelper.getCategory()

//   var product = null
// adminHelper.getAllProduct().then((products) => {
//     if (req.session.help) {

//       product = req.session.catshow
//       console.log('xxxxxxxxxxxxxxxxx selected cat vannu');

//     } else {
//       product = products
//       console.log('xxxxxxxxxxxxxxxxx all cat vannu');
//     }

//     res.render('user/shop', { user: true, userData: req.session.userData, product, cartCount: req.session.count, category });
//     req.session.help = false
//   })


//   // }else{
//   //   res.redirect('/')
//   // }
// })


//..............................single-product.............................................
router.get('/single-product/:id', ok, (req, res) => {
  // if (req.session.userData) {

  adminHelper.getProductDetails(req.params.id).then((product) => {
    // console.log(product);
    res.render('user/single-product', { user: true, userData: req.session.userData, product, cartCount: req.session.count });

  })
  // } else {
  //   res.redirect('/')
  // }

});
//..............................cart.............................................


router.get('/cart', ok, async (req, res) => {
  if (req.session.userData) {
    let product = await userHelper.getCartProducts(req.session.userData?._id)
    let singleProAmount = await userHelper.singleProductAmount(req.session.userData?._id)
    // console.log(singleProAmount); 
    // console.log(couponoffer); 
    let totalamount = await userHelper.getTotalAmount(req.session.userData?._id)
    console.log(totalamount);
    let couponoffer = await userHelper.getCoupons(req.session.userData?._id)
    console.log(couponoffer);
  

    if(couponoffer.couponoffer){ 
      console.log(couponoffer.couponoffer);
      console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    var offer = couponoffer.couponoffer
    var offers =(totalamount*offer)/100
    var subtotal =  Math.round(totalamount 
      // + 45
       - offers)
    
  }else{
    var subtotal = totalamount
    //  + 45 
   var offer= 0
   var offers=0
  } 
   
    console.log(subtotal);

    res.render('user/cart', { user: true, totalamount, userData: req.session.userData,referalAmount:req.session.referal, cartCount: req.session.count, singleProAmount, product, subtotal, offer,offers})

  } else {
    res.redirect('/login',)
  }


})


//.............add-to-cart.....................................................

router.get('/add-to-cart/:id', (req, res) => {
  if (req.session.userData) {
    console.log('verindu');
    userHelper.addToCart(req.params.id, req.session.userData?._id).then((response) => {
      res.json(response)
    })
  } else {
    res.redirect('/login')
  }

})
//...................................

router.post('/changeproductquantity', (req, res, next) => {
  console.log(req.body);
  userHelper.changeproductquantity(req.body).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.session.userData?._id)
    response.catof = await userHelper.Coupon(req.session.userData?._id)
    response.referal = req.session.referal
    console.log(response);
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
    let address = await userHelper.getAddresdetails(req.session.userData?._id)
    let totalamount = await userHelper.getTotalAmount(req.session.userData?._id)
    let subtotal = totalamount 
    
    let couponoffer = await userHelper.getCoupons(req.session.userData?._id)
    console.log(couponoffer);

   
    if(couponoffer.couponoffer){ 
     
    var offer = couponoffer.couponoffer
    var offers =(totalamount*offer)/100
     subtotal =  Math.round(totalamount - offers)
    
  }else{
     subtotal
    
   var offer= 0
   var offers=0
  } 

  if(req.session.referal){

    console.log(req.session.referal);
      subtotal =subtotal-50
      
console.log(totalamount);

  }else{
    subtotal
  }
  console.log("hahhahahahhahahahahahahhahahahahahahahahahahhahhahahhah");

    // console.log(req.session.userData);
    res.render('user/checkout', { user: true, userData: req.session.userData, totalamount, subtotal, referal: req.session.referal, cartCount: req.session.count,offer,offers })
 
  } else {
    res.redirect('/login')
  }
})



router.post('/check-out', async (req, res) => {
  console.log(req.body);
  let products = await userHelper.getCartProductsList(req.session.userData?._id)
  let totalPric = await userHelper.getTotalAmount(req.session.userData?._id)

  console.log("asdfghjkqwertyuiozxcvbn");
 // let totalprice = (totalPric + 45) 
  console.log(totalPric);    
  let couponoffer = await userHelper.getCoupons(req.session.userData?._id)
    console.log(couponoffer);

    if(couponoffer.couponoffer){ 
      console.log(couponoffer.couponoffer);
      console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    var offer = couponoffer.couponoffer
    var offers =(totalPric*offer)/100
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
    console.log("hahhahhahahhahahah");
    console.log(totalprice);
    console.log();

    req.session.orderid = orderId.insertedId
    if (req.body['payment-method'] === 'COD') {
      res.json({ status: true })
    } else if (req.body['payment-method'] === 'Razorpay') {
      console.log(orderId);
      userHelper.generateRazorpay(orderId, totalprice).then((response) => {
        response.status = false
          console.log(totalprice);

        res.json(response)
      })
    } else {
      console.log("paypal"); 
      userHelper.generatePaypal(orderId, totalprice).then((payment) => {
    console.log(totalprice);

        res.json(payment)
      })
    }
  })
})
//---------------sort category----------------

router.get('/showcart/:name', (req, res) => {
  // if (req.session.userData) {


  let names = req.params.name
  // console.log(names);
  userHelper.getCatName(names).then((pro) => {
    console.log(pro);
    req.session.catshow = pro
    req.session.help = true
    res.redirect('/')
  })
  // } else { 
  //   res.redirect('/login')
  // }
})

//..........................user-profile...............

router.get('/user-profile', ok, (req, res) => {
  if (req.session.userData) {

    res.render('user/user-profile', { user: true, userData: req.session.userData, cartCount: req.session.count });

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
  res.render('user/add-address', { user: true, userData: req.session.userData })
})

router.post('/add-address', (req, res) => {
  if (req.session.userData) {


    let id = req.session.userData._id

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
    // + 45

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
    res.render('user/view-orders', { userData: req.session.userData, user: true, products, cartCount: req.session.count })
  } else {
    res.redirect('/login')
  }
})

//.............cancel the order................

router.get('/cancelOrder/:id', (req, res) => {
  // userHelper.cancelOrderList(req.params.id).then((cancel)=>{
  adminHelper.Cancelstatus(req.params.id).then(() => {
    console.log('hihihihihihh');

    res.json({ status: true })
    // res.redirect('/orders')

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
      console.log('Payment success');
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMsg: '' })
  })
})

router.get('/wishlist', async (req, res) => {
  if (req.session.userData) {
    let product = await userHelper.getWishList(req.session.userData?._id)
    console.log(product);
    res.render('user/wishlist', { user: true, userData: req.session.userData, product })
  } else {
    res.redirect("/login")
  }
})

router.get('/add-to-wishlist/:id', (req, res) => {
  userHelper.addToWhishlist(req.params.id, req.session.userData?._id).then(() => {
    res.redirect('/')
  })

})

router.get('/success', async (req, res) => {
  userHelper.changePaymentStatus(req.session.orderid)
  let total = await userHelper.getTotal(req.session.orderid)
  console.log(total.Amount);
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
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
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
  console.log("hihihihihihihi");
  if (req.session.userData) {
    req.session.cupoff =req.body.name
    userHelper.getCoupon(req.body.name, req.session.userData?._id).then((response) => {

      console.log(response);
      res.json( response )
    })
  }
  // res.redirect('/login')
})


router.post('/referal',(req,res)=>{
  console.log(req.body);
  userHelper.getReferal(req.body).then((response) => {
    req.session.referal=response
    console.log(response.referalAmount);
    res.json(response)
  })  
})

module.exports = router;
