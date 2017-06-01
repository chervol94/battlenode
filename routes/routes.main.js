var express = require('express');
var router = express.Router();

router.get("/",function(req,res){
  res.render("pages/index");
  	/*var ip = req.headers['x-forwarded-for'] ||
  	req.connection.remoteAddress ||
  	req.socket.remoteAddress ||
  	req.connection.socket.remoteAddress;
  	console.log(ip);*/
});
router.get('/gmaq', function(req, res){
	res.render("pages/game_maq");
});
router.get('/gmusr', function(req, res){
	res.render("pages/game_usr");
});
router.get('/rank', function(req, res){
	res.render("pages/rank");
});
router.get('/about', function(req, res){
	res.render("pages/about");
});

module.exports = router;
