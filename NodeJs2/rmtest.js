var mongoose = require('./moduleMongoose');
mongoose.connect();



mongoose.removeStatement();
mongoose.removeMainSensor();
mongoose.removeSensor();
mongoose.removeCU();
mongoose.removeCC(); 
mongoose.removeRoom();

