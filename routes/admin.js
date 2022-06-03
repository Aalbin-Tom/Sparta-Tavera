var express = require('express');
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
router.get('/', function(req, res){
    if(req.session.admin) {
         res.redirect('/admin/admin-home')
    }   
    res.render('admin/admin-login');
  });



/* GET adminlogin page. */
router.get('/admin-login',function(req, res) {
    console.log('vanu');
    if(req.session.admin){
        res.render('admin/admin-home',{adminhead:true});
    }else{
        console.log('vanilla');
  res.redirect('/admin')
    }

 });

/* post adminlogin page. */
router.post('/admin-login', function(req, res) {
   
    if(req.body.email == "admin@gmail.com" && req.body.password == "123***") {
  req.session.admin = true;
     res.redirect('/admin/admin-home')
    }else{
        res.redirect('/admin');
    }
    
  });


  
  /* GET adminhome page. */
  router.get('/admin-home', function(req, res) {
   
        res.render('admin/admin-home',{adminhead:true});
});

  /* GET adminlogout page. */
  router.get('/logout', function(req, res) {
      req.session.admin= false
          res.redirect('/admin');
  });

  //get show-user user page
  router.get('/show-users',function (req,res){
   
       res.render('admin/show-users',{adminhead:true})
      
  })

  //get product page
  router.get('/products-view', function(req, res) {
    adminHelper.getAllProduct().then((product) => {
        console.log(product);
        res.render('admin/products-view',{adminhead:true,product});
    })
});










//add- product get
router.get('/add-product', function(req, res) {
    res.render('admin/add-product',{adminhead:true});
});

router.post('/add-products', function(req, res) {
  

  adminHelper.addProduct(req.body,(id)=>{ 
      let image =req.files.image
      image.mv('./public/productimage/'+id+'.jpg',(err)=>{
          if(!err){
              res.redirect('/admin/add-product')
          }
          console.log(err)
      })
     
      
  })
})

module.exports = router;
