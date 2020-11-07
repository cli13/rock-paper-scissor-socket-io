const auth = {};

auth.ensureAuthenticated = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'Please login to view this page');
    res.redirect('/login');
}

module.exports = auth;