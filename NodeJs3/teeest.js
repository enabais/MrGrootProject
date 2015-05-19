var mongoose = require('./monduleMongoose');




mongoose.addSensor('temperature', '3', 'captCuisine', 'descriptionSensor', 'typeSensor', 'locationSensor');
mongoose.addStatement('3', 'temperature', '39');
mongoose.addCC('idCC', 'nameCC', 'descriptionCC');
mongoose.addCU('idCU', 'idCC', 'descriptionCU', 'temperature_3', '<', '40');