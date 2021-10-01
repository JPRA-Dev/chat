//Authorization
module.exports = function (req, res, next) {
    //401 means Unauthorizes
    //403 means Forbidden
    //we are getting the 'req.user' from the auth.js if we execute it before, so we don't need to require it again
    if (!req.user.isAdmin) return res.status(403).send('Access denied.')
    next ();
}