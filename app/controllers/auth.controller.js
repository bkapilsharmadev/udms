
const authService = require('../services/auth.service');

module.exports.authenticate = async(req,res,next) => {
    let { username, password} = req.body;
    const data = await authService.authenticateService({username,password},req,res);
    return res.status(200).json(data);
}

module.exports.login = async(req,res,next) => {
    res.render("login.ejs");
}

module.exports.logout = async(req,res,next) => {
    await authService.logout(req,res,next);
    res.redirect("/signin");
}