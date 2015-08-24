var mongoose = require('../NodeJs2/moduleMongoose');

mongoose.connect();


var inherit = require('inherit'),
    CronRunner = require('cron-runner');
 
var MyCronRunner = inherit(CronRunner, {
    __constructor: function (options) {
        this.__base(options);
        //TODO implement your custom initialization code here
    },
 
    execute: function () {
      console.log("Verification");
      mongoose.addNotif();
    }
});
 
var mcr = new MyCronRunner({
    cron: {
        pattern: '0 */1 * * * *'
    }
});
 
mcr.start();


var MyCronRunner2 = inherit(CronRunner, {
    __constructor: function (options) {
        this.__base(options);
        //TODO implement your custom initialization code here
    },
 
    execute: function () {
        mongoose.moyenneStatement(); //calcul la moyenne de tous les capteurs du mois actuel
    }
});
 
var mcr2 = new MyCronRunner2({
    cron: {
        pattern: '00 30 11 * * 4-5' //tout les Jeudi Vendredi à 11h30m00
    }
});
mcr2.start();