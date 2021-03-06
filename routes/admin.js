var express = require('express');
const async = require('hbs/lib/async');
const { response } = require('../app');
const { updateProduct } = require('../helpers/admin-helper');
var router = express.Router();
var adminHelper = require('../helpers/admin-helper')
var userHelper = require('../helpers/user-helper')
const multer = require("multer");
//.....................................................................................................






//...............................multer........
const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, "./public/productimage");
    },
    filename: function (req, file, callback) {
        callback(null, "Product_image-" + Date.now() + ".jpeg");
    },
});

const productImgStore = multer({ storage: productStorage });
//...............................category................


const categoryStorage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, "./public/category");
    },
    filename: function (req, file, callback) {
        callback(null, "Category_image-" + Date.now() + ".jpeg");
    },
});

const categoryImgStore = multer({ storage: categoryStorage });



/* GET adminhome page. */
router.get('/', function (req, res) {
    if (req.session.admin) {

        res.redirect('/admin/admin-home')
    }
    res.render('admin/admin-login', {});
});



/* GET adminlogin page. */
router.get('/admin-login', function (req, res) {
    if (req.session.admin) {
        res.render('admin/admin-home', { adminhead: true });

    } else {

        res.redirect('/admin', { warn: req.session.loginErr })
        req.session.loginErr = null
    }

});

/* post adminlogin page. */
router.post('/admin-login', function (req, res) {

    if (req.body.email == "admin@gmail.com" && req.body.password == "123***") {
        req.session.admin = true;

        res.redirect('/admin/admin-home')

    } else if (req.body.email == '' || req.body.password == '') {
        res.render('admin/admin-login', { login: true, warn: "Email or Password cannot be empty" })
    } else {
        res.render('admin/admin-login', { login: true, warn: "Invalid Password or Email " })
    }

});



/* GET adminhome page. */
router.get('/admin-home', async function (req, res) {
    if (req.session.admin) {
        let total = await adminHelper.totalSales()
        let paypal = await adminHelper.PaypaltotalSales()
        let cod = await adminHelper.CODtotalSales()
        let razorpay = await adminHelper.RazorpaytotalSales()
        let users=await adminHelper.getUsercount()
      

        const formatCash = n => {
            if (n < 1e3) return n;
            if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
            if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
            if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
            if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
        };



        let totals = formatCash(total)
        let paypals = formatCash(paypal)
        let COD = formatCash(cod)
        let razorpays = formatCash(razorpay)


        res.render('admin/admin-home', { adminhead: true, total, paypal, cod, razorpay, totals, paypals, COD, razorpays,users });
    } else {

        res.redirect('/admin')
    }

});

/* GET adminlogout page. */
router.get('/logout', function (req, res) {
    req.session.admin = false
    res.redirect('/admin');
});

//get show-user user page
router.get('/show-users', function (req, res) {
    if (req.session.admin) {
        adminHelper.getAllUsers().then((users) => {
            res.render('admin/show-users', { adminhead: true, users })

        })
    } else {

        res.redirect('/admin')
    }

})

//get product page
router.get('/products-view', function (req, res) {
    if (req.session.admin) {
        adminHelper.getAllProduct().then((product) => {
            
            res.render('admin/products-view', { adminhead: true, product });
        })
    } else {

        res.redirect('/admin')
    }

});










//add- product get
router.get('/add-product', async function (req, res) {
    if (req.session.admin) {
        let category = await adminHelper.getCategory()
        res.render('admin/add-product', { adminhead: true, category });
    } else {

        res.redirect('/admin')
    }

});

router.post('/add-product', productImgStore.array('image', 5), function (req, res) {

    let arr = []

    req.files.forEach(function (files, index, ar) {

        arr.push(req.files[index].filename)

    })
    let objectarray = { ...arr }
    adminHelper.addProduct(req.body, arr).then(() => {
        res.redirect('/admin/products-view')

    })

})



//.........get.............edit-product..........
router.get('/edit-product/:id', async (req, res) => {
    if (req.session.admin) {
       
        adminHelper.getProductDetails(req.params.id).then(async(product)=>{
            let category = await adminHelper.getCategory()
               res.render('admin/edit-product', { adminhead: true, product, category })
        }).catch(()=>{
            res.render('404')
        })


    } else {

        res.redirect('/admin')
    }


})

router.post('/edit-product/:id', (req, res) => {

    adminHelper.updateProduct(req.params.id, req.body).then((response) => {

        res.redirect('/admin/products-view')
    })

})


//................................................................................


//...........................delete-product.....................................................
router.get('/delete-product/:id', (req, res) => {
    let productId = req.params.id
    adminHelper.deleteProduct(productId).then((response) => {
        res.redirect('/admin/products-view')
    })


})
//...........................unblock-user.....................................................

router.get('/block-user/:id', (req, res) => {
    adminHelper.blockUser(req.params.id).then((block) => {
        res.redirect('/admin/show-users')
    })

})
//...........................block-user.....................................................

router.get('/unblock-user/:id', (req, res) => {

    adminHelper.unblockUser(req.params.id).then((unblock) => {
        res.redirect('/admin/show-users')
    })
})

//...........................VIEW_CATEGORY.....................................................

router.get('/view-category', (req, res) => {
    if (req.session.admin) {
        adminHelper.getCategory().then((category) => {
           
            res.render('admin/view-category', { adminhead: true, category });
        })

    } else {

        res.redirect('/admin')
    }
})


//...........................ADD_CATEGORY.....................................................

router.get('/add-category', (req, res) => {
    if (req.session.admin) {
        res.render('admin/add-category', { adminhead: true })
    } else {

        res.redirect('/admin')
    }


})

router.post('/add-category', categoryImgStore.array('image', 1), (req, res) => {
    let arr = []

    req.files.forEach(function (files, index, ar) {

        arr.push(req.files[index].filename)

    })
    let objectarray = { ...arr }
    adminHelper.Category(req.body, arr).then(() => {
        res.redirect('/admin/add-category')

    })

})


//...........................EDIT_CATEGORY.....................................................



router.get('/edit-category/:id', async (req, res) => {
    if (req.session.admin) {
        let category = await adminHelper.getcategoryDetails(req.params.id)
        res.render('admin/edit-category', { adminhead: true, category })
    } else {

        res.redirect('/admin')
    }

})


router.post('/edit-category/:id', (req, res) => {
    adminHelper.updateCategory(req.params.id, req.body).then((data) => {

        res.redirect('/admin/view-category')
    })
})




//...........................delete_CATEGORY.....................................................


router.get('/delete-category/:id', (req, res) => {
    let categoryId = req.params.id
    adminHelper.deleteCategory(categoryId).then((response) => {
        res.redirect('/admin/view-category')
    })

})

//.....................Order-get-all...........................

router.get('/view-orders', (req, res) => {
    adminHelper.getAllOrders().then((orders) => {
        
        res.render('admin/view-orders', { adminhead: true, orders });
    })
})


router.get('/order-products/:id', async (req, res) => {
    // if (req.session.admin) {
      let products = await userHelper.getOrderProducts(req.params.id)
      let orders = await userHelper.getUserOrder(req.params.id)
  
      res.render('admin/order-products',{ adminhead: true, products, orders })
    // } else {
    //   res.redirect('admin/login')
    // }
  })



router.get('/cancel-order/:id', (req, res) => {
    adminHelper.Cancelstatus(req.params.id).then(() => {

        res.json({ status: true })

    })
})


router.get('/ship-order/:id', (req, res) => {
    adminHelper.Shippedstatus(req.params.id).then((response) => {
        res.json({ status: true })

    })
})



router.get('/deliver-order/:id', (req, res) => {
    adminHelper.Deliverystatus(req.params.id).then((response) => {
        res.json({ status: true })

    })
})


router.get('/return-order/:id', (req, res) => {
    adminHelper.Returnedstatus(req.params.id).then((response) => {
        res.json({ status: true })

    })
})

//............................get and category...................................................

router.get('/coupon', async (req, res) => {
    adminHelper.getcoupon().then((coupon) => {

        res.render('admin/add-coupon', { adminhead: true, coupon })

    })
})


router.post('/Coupon', (req, res) => {
    adminHelper.addcoupon(req.body).then((response) => {
        res.redirect('/admin/coupon')
    })
})

//...........................delete coupon.....................................................
router.get('/delete-coupon/:id', (req, res) => {
    let couponId = req.params.id
    adminHelper.deleteCoupon(couponId).then((response) => {
        res.redirect('/admin/coupon')
    })

})

 
//.............add cstegory offer...........
router.get('/add-categoryoffer/:name', (req, res) => {
    adminHelper.addCategoryOffer(req.params.name).then(() => {
        res.json({ status: true })
    })
})



// .............sales report............................

router.get('/report', (req, res) => {

    res.render('admin/report', { adminhead: true ,report :req.session.report}) 
    
})


router.post('/sales-report', (req, res) => {
    let to = new Date(req.body.to)
    let from = new Date(req.body.from)
    adminHelper.datereport(to, from, req.body.type).then((report) => {
       req.session.report=report
        res.redirect('/admin/report')

    })

})

router.get('/sales-report',async(req,res)=>{
    let dailySales = await adminHelper.getDailySales()
    let weeklySales = await adminHelper.getWeeklySales()
    let YearlySales = await adminHelper.getYearlySales()
    
   

   res.render('admin/sales-reports',{adminhead:true,dailySales,weeklySales,YearlySales})
})

module.exports = router;
