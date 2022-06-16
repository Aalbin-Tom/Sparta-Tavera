var express = require('express');
const async = require('hbs/lib/async');
const { response } = require('../app');
const { updateProduct } = require('../helpers/admin-helper');
var router = express.Router();
var adminHelper = require('../helpers/admin-helper')
var userHelper = require('../helpers/user-helper')
const multer = require ("multer");
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
    res.render('admin/admin-login',{});
});



/* GET adminlogin page. */
router.get('/admin-login', function (req, res) {
    console.log('vanu');
    if (req.session.admin) {
        res.render('admin/admin-home', { adminhead: true  });
        
    } else {
        
        res.redirect('/admin',{ warn: req.session.loginErr})
        req.session.loginErr= null
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
router.get('/admin-home', function (req, res) {
    if (req.session.admin) {
        res.render('admin/admin-home', { adminhead: true });
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
            res.render('admin/show-users',{adminhead:true, users })
    
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
router.get('/add-product',async function (req, res) {
    if (req.session.admin) {
        let category = await adminHelper.getCategory()
       res.render('admin/add-product', { adminhead: true ,category}); 
    } else {
        
        res.redirect('/admin')
    }
    
});

router.post('/add-product', productImgStore.array('image',5), function (req, res) {
      
  let arr = []

  req.files.forEach(function (files, index, ar) {
    console.log(req.files[index].filename);

    arr.push(req.files[index].filename)

  })
  let objectarray = {...arr}
  console.log(objectarray);
  adminHelper.addProduct(req.body, arr).then(() => {
    res.redirect('/admin/products-view')

  })

})
   


//.........get.............edit-product..........
router.get('/edit-product/:id', async (req, res) => {
    if (req.session.admin) {
       let product = await adminHelper.getProductDetails(req.params.id)
       let category = await adminHelper.getCategory()

    // console.log(category);
    res.render('admin/edit-product', { adminhead: true, product ,category})
 
    } else {
        
        res.redirect('/admin')
    }
    

})

router.post('/edit-product/:id', (req, res) => {
    console.log(req.body);
    console.log("huhuhuhuhhuhuhuhuuhuhuhuhuh");

    console.log(req.params.id);
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

router.get('/block-user/:id',(req,res)=>{
    adminHelper.blockUser(req.params.id).then((block)=>{
        res.redirect('/admin/show-users')
    })
    
})
//...........................block-user.....................................................

router.get('/unblock-user/:id',(req,res)=>{
   
   adminHelper.unblockUser(req.params.id).then((unblock)=>{
        res.redirect('/admin/show-users')
    })
})

//...........................VIEW_CATEGORY.....................................................

router.get('/view-category',(req,res)=>{
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

router.get('/add-category',(req,res)=>{
    if (req.session.admin) {
         res.render('admin/add-category',{ adminhead: true}) 
    } else {
        
        res.redirect('/admin')
    }

  
})

router.post('/add-category',categoryImgStore.array('image',1), (req,res)=>{
    let arr = []

  req.files.forEach(function (files, index, ar) {
    console.log(req.files[index].filename);

    arr.push(req.files[index].filename)

  })
  let objectarray = {...arr}
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



router.get('/edit-category/:id',async(req,res)=>{
    console.log('da panni');
    if (req.session.admin) {
        let category = await adminHelper.getcategoryDetails(req.params.id)
    res.render('admin/edit-category',{ adminhead: true, category })
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

router.get('/view-orders',(req,res)=>{
    // adminHelper.getAllorders().then((orders) => {
        // console.log(orders);
        res.render('admin/view-orders', { adminhead: true});
    })
// })
module.exports = router;
     