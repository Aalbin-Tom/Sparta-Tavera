var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/user-helper')

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
        res.render('admin/admin-home');
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


  
  /* GET adminlogout page. */
  router.get('/admin-home', function(req, res) {
   
        res.render('admin/admin-home');
});

  /* GET adminlogout page. */
  router.get('/logout', function(req, res) {
      req.session.admin= false
          res.redirect('/admin');
  });



module.exports = router;
