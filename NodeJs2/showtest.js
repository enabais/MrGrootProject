var mongoose = require('./moduleMongoose');
mongoose.connect();

mongoose.showMainSensor();
mongoose.showSensor();
mongoose.showStatement();
mongoose.showCC();
mongoose.showCU();
mongoose.showRoom();
