var express = require('express');
const async = require('hbs/lib/async');
const { response } = require('../app');
const { updateProduct } = require('../helpers/admin-helper');
var router = express.Router();
var adminHelper = require('../helpers/admin-helper')
var userHelper = require('../helpers/user-helper')

//....................................middlewewar.......................
// const adminLogin= (req, res, next)=>{

//     if(req.session.admin){

//      next()
//     }else{

//         res.redirect('/admin/admin-login')
//     }
// }



/* GET adminhome page. */
router.get('/', function (req, res) {
    if (req.session.admin) {
        res.redirect('/admin/admin-home')
    }
    res.render('admin/admin-login');
});



/* GET adminlogin page. */
router.get('/admin-login', function (req, res) {
    console.log('vanu');
    if (req.session.admin) {
        res.render('admin/admin-home', { adminhead: true });
    } else {
        console.log('vanilla');
        res.redirect('/admin')
    }

});

/* post adminlogin page. */
router.post('/admin-login', function (req, res) {

    if (req.body.email == "admin@gmail.com" && req.body.password == "123***") {
        req.session.admin = true;
        res.redirect('/admin/admin-home')
    } else {
        res.redirect('/admin');
    }

});



/* GET adminhome page. */
router.get('/admin-home', function (req, res) {

    res.render('admin/admin-home', { adminhead: true });
});

/* GET adminlogout page. */
router.get('/logout', function (req, res) {
    req.session.admin = false
    res.redirect('/admin');
});

//get show-user user page
router.get('/show-users', function (req, res) {

    adminHelper.getAllUsers().then((users) => {
        console.log(users);
        res.render('admin/show-users',{adminhead:true, users })

    })
})

//get product page
router.get('/products-view', function (req, res) {
    adminHelper.getAllProduct().then((product) => {
        // console.log(product);
        res.render('admin/products-view', { adminhead: true, product });
    })
});










//add- product get
router.get('/add-product', function (req, res) {
    res.render('admin/add-product', { adminhead: true });
});

router.post('/add-products', function (req, res) {


    adminHelper.addProduct(req.body, (id) => {
        let image = req.files.image
        image.mv('./public/productimage/' + id + '.jpg', (err) => {
            if (!err) {
                res.redirect('/admin/add-product')
            }
            console.log(err)
        })


    })
})


//.........get.............edit-product..........
router.get('/edit-product/:id', async (req, res) => {

    let product = await adminHelper.getProductDetails(req.params.id)
    // console.log(product);
    res.render('admin/edit-product', { adminhead: true, product })


})

router.post('/edit-product/:id', (req, res) => {
    // console.log(req.params.id);
    let editid=req.params.id
    adminHelper.updateProduct(req.params.id, req.body).then((data) => {
        if(req.files.image){
            let image=req.files.image
            image.mv('./public/productimage/'+editid+'.jpg')
            res.redirect('/admin/products-view')
            }
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
    adminHelper.getCategory().then((category) => {
        // console.log(product);
        res.render('admin/view-category', { adminhead: true, category });
    })
})


//...........................ADD_CATEGORY.....................................................

router.get('/add-category',(req,res)=>{

    res.render('admin/add-category',{ adminhead: true})
})

router.post('/add-category',(req,res)=>{
    adminHelper.Category(req.body, (id) => {
        let imagecat = req.files.image
        // console.log(imagecat); 
        imagecat.mv('./public/category/' + id + '.jpg', (err) => {
            if (!err) {
                res.redirect('/admin/add-category')
            }
            console.log(err)
        })


    })
}) 


//...........................EDIT_CATEGORY.....................................................



router.get('/edit-category/:id',async(req,res)=>{

    let category = await adminHelper.getcategoryDetails(req.params.id)
    res.render('admin/edit-category',{ adminhead: true, category })
})


router.post('/edit-category/:id', (req, res) => {
    let editcat=req.params.id
    console.log(req.params.id);
    adminHelper.updateCategory(req.params.id, req.body).then((data) => {
        if(req.files.image){
            let image=req.files.image
            console.log(image)
            image.mv('./public/category'+editcat+'.jpg') 
             res.redirect('/admin/view-category')
        }
        
        

    })
})




//...........................delete_CATEGORY.....................................................


router.get('/delete-category/:id', (req, res) => {
    let categoryId = req.params.id
    adminHelper.deleteCategory(categoryId).then((response) => {
        res.redirect('/admin/view-category')
    })

})
module.exports = router;
