var mongoose = require('../NodeJs2/moduleMongoose');

mongoose.connect();
/*mongoose.removeDataOption();
mongoose.addData();
*/
//mongoose.switchOption();
//mongoose.addNotif();
//mongoose.moyenneStatement();
//mongoose.removeMoyenne();
//mongoose.repar();
mongoose.listStatementTypeDate("Luminance", 2015, 7,1, 2015, 8,1, function(err, res, types){
	console.log([types,res]);
});
