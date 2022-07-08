var express = require('express');
const async = require('hbs/lib/async');
const { response } = require('../app');
const { updateProduct } = require('../helpers/admin-helper');
var router = express.Router();
var adminHelper = require('../helpers/admin-helper')
var userHelper = require('../helpers/user-helper')
const multer = require("multer");
//.....................................................................................................





//....................................middlewewar.......................
// const adminLogin= (req, res, next)=>{

//     if(req.session.admin){

//      next()
//     }else{

//         res.redirect('/admin/admin-login')
//     }
// }
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
    console.log('vanu');
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
        console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
        let total = await adminHelper.totalSales()
        let paypal = await adminHelper.PaypaltotalSales()
        let cod = await adminHelper.CODtotalSales()
        let razorpay = await adminHelper.RazorpaytotalSales()
      

        const formatCash = n => {
            if (n < 1e3) return n;
            if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
            if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
            if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
            if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
        };

        console.log(formatCash(cod));
        console.log(formatCash(total));
        console.log(formatCash(total));
        console.log(formatCash(paypal));


        let totals = formatCash(total)
        let paypals = formatCash(paypal)
        let COD = formatCash(cod)
        let razorpays = formatCash(razorpay)
        console.log(total);


        //   console.log(totals);
        res.render('admin/admin-home', { adminhead: true, total, paypal, cod, razorpay, totals, paypals, COD, razorpays });
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
            console.log(users);
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
            // console.log(product);
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
        console.log(req.files[index].filename);

        arr.push(req.files[index].filename)

    })
    let objectarray = { ...arr }
    console.log(objectarray);
    adminHelper.addProduct(req.body, arr).then(() => {
        res.redirect('/admin/products-view')

    })

})



//.........get.............edit-product..........
router.get('/edit-product/:id', async (req, res) => {
    if (req.session.admin) {
        console.log(req.params.id);
        let product = await adminHelper.getProductDetails(req.params.id)
        let category = await adminHelper.getCategory()

        console.log(product);
        res.render('admin/edit-product', { adminhead: true, product, category })

    } else {

        res.redirect('/admin')
    }


})

router.post('/edit-product/:id', (req, res) => {
    console.log(req.body);
    console.log("huhuhuhuhhuhuhuhuuhuhuhuhuh");

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
            // console.log(product);
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
        console.log(req.files[index].filename);

        arr.push(req.files[index].filename)

    })
    let objectarray = { ...arr }
    console.log(objectarray);
    adminHelper.Category(req.body, arr).then(() => {
        res.redirect('/admin/add-category')

    })

})
// adminHelper.Category(req.body, (id) => {
//     let imagecat = req.files.image
//     // console.log(imagecat); 
//     imagecat.mv('./public/category/' + id + '.jpg', (err) => {
//         if (!err) {
//             res.redirect('/admin/add-category')
//         }
//         console.log(err)
//     })


// })

//...........................EDIT_CATEGORY.....................................................



router.get('/edit-category/:id', async (req, res) => {
    console.log('da panni');
    if (req.session.admin) {
        let category = await adminHelper.getcategoryDetails(req.params.id)
        res.render('admin/edit-category', { adminhead: true, category })
    } else {

        res.redirect('/admin')
    }

})


router.post('/edit-category/:id', (req, res) => {
    console.log(req.params.id);
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
        // console.log(orders);
        res.render('admin/view-orders', { adminhead: true, orders });
    })
})

router.get('/cancel-order/:id', (req, res) => {
    adminHelper.Cancelstatus(req.params.id).then(() => {
        console.log('hihihihihihh');

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
    console.log("hlooooooooooooooooooooooooooooooooooooooo");
    adminHelper.getcoupon().then((coupon) => {
        console.log(coupon);

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
    console.log("ddddddddddddddddddddddddddddddddddddd");
    adminHelper.addCategoryOffer(req.params.name).then(() => {
        res.json({ status: true })
    })
})



// .............sales report............................

router.get('/report', (req, res) => {

    res.render('admin/report', { adminhead: true ,report :req.session.report}) 
    
})


router.post('/sales-report', (req, res) => {
    console.log(req.body);
    let to = new Date(req.body.to)
    let from = new Date(req.body.from)
    adminHelper.datereport(to, from, req.body.type).then((report) => {
       req.session.report=report
        console.log(req.session.report);
        res.redirect('/admin/report')

    })

})

router.get('/sales-report',async(req,res)=>{
    let dailySales = await adminHelper.getDailySales()
    let weeklySales = await adminHelper.getWeeklySales()
    let YearlySales = await adminHelper.getYearlySales()
    
    // map to get only the dates
    let date = [];
    dailySales.map((daily) => {
      date.push(daily._id);
    });

    let a=date[0]
    let b =date[1]

    let dailycount = [];
    dailySales.map((daily) => {
      dailycount.push(daily.count);
    });

    //map to get the month 
    let month = [];
    weeklySales.map((daily) => {
      month.push(daily._id);
    });

    let monthcount = [];
    weeklySales.map((daily) => {
      monthcount.push(daily.count);
    });

     //map to get the year
     let year = [];
     YearlySales.map((daily) => {
       month.push(daily._id);
     });
 
     let yearcount = [];
     YearlySales.map((daily) => {
       yearcount.push(daily.count);
     });

    console.log(date);
    console.log(dailycount);
   res.render('admin/sales-report',{adminhead:true,a,b,date,dailycount,month,monthcount,yearcount, year})
})

module.exports = router;
