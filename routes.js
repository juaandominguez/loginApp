const passport = require('passport');


function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect('/');
  }

module.exports = function (app, myDataBase) {
    app.route('/').get((req, res) => {
        // Change the response to render the Pug template
        res.render('index', {
          title: 'Connected to Database',
          message: 'Please login',
          showLogin: true,
          showRegistration: true
        });
      });

      app.post('/login', passport.authenticate('local', {failureRedirect: '/'}),(req,res) =>{
        res.redirect('/profile');
      })
    
      app.route('/register').post((req, res, next) =>{
        myDataBase.findOne({username: req.body.username},(err, user) =>{
          if(err) next(err);
          else if(user){
            res.redirect('/')
          }
          else{
            const hash = bcrypt.hashSync(req.body.password, 12)
            //console.log(req.body)
            myDataBase.insertOne({
              username: req.body.username,
              password: hash
            }, { writeConcern: { w: 'majority' } }, (err,doc) => {
              if(err){
                console.log(err)
                res.redirect('/');}
              else{
                next(null,doc.ops[0]);
              }
            })
          }
        })
      },passport.authenticate('local', {failureRedirect: '/'}),(req, res, next) =>{
        res.redirect('/profile');
      })
    
      app.get('/profile',ensureAuthenticated,(req,res) => {
        res.render('profile',{
          username: req.user.username
        });
      })
    
      app.get('/logout', (req, res) => {
        req.logOut((err) => {
          if(err) return console.log(err);
        });
        res.redirect('/');
      })
}