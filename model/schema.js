var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost/BattleShip_DB");

var msgSchema = {autor:String, texto:String};
var msg_schema = new Schema(msgSchema);
var Msg = mongoose.model("Msg", msg_schema);

module.exports.msg = Msg;

var UserSchema = {name:String, img:String, Tbl_Barcos:Object};
var User_schema = new Schema(UserSchema);
var User = mongoose.model("User", User_schema);

module.exports.user = User;

var RankSchema = {name:String, img:String, turnos:Number};
var Rank_schema = new Schema(RankSchema);
var Rank = mongoose.model("Rank", Rank_schema);

module.exports.rank = Rank;

var PartidaSchema = {IPPlayerJ1:String,nameJ1:String, imgJ1:String, turnosJ1:Number,IPPlayerJ2:String,nameJ2:String, imgJ2:String, turnosJ2:Number};
var Partida_schema = new Schema(PartidaSchema);
var Partida = mongoose.model("Partida", Partida_schema);

module.exports.partida = Partida;
