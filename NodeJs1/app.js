///////////////////////////////////////////////////////////////////
  /*
   * V3
   */
  var OpenZWave = require('openzwave');
  var async = require('async');
  var mongoose = require('../NodeJs2/moduleMongoose');

  var zwave = new OpenZWave('/dev/ttyUSB0', {
	  
      saveconfig: true,
  });
  var nodes = [];
  mongoose.connect();
  zwave.connect();

  zwave.on('driver ready', function(homeid) {
      console.log('scanning homeid=0x%s...', homeid.toString(16));
  });


  zwave.on('driver failed', function() {
      console.log('failed to start driver');
      zwave.disconnect();
      process.exit();
  });

  zwave.on('node added', function(nodeid) {
      nodes[nodeid] = {
          manufacturer: '',
          manufacturerid: '',
          product: '',
          producttype: '',
          productid: '',
          type: '',
          name: '',
          loc: '',
          classes: {},
          ready: false,
      };
  });

  zwave.on('value added', function(nodeid, comclass, value) {

      if (!nodes[nodeid]['classes'][comclass])
          nodes[nodeid]['classes'][comclass] = {};
      nodes[nodeid]['classes'][comclass][value.index] = value;
  });

  zwave.on('value changed', function(nodeid, comclass, value) {
      if (nodes[nodeid]['ready']) {
          console.log('node%d: changed: %d:%s:%s->%s', nodeid, comclass,
              value['label'],
              nodes[nodeid]['classes'][comclass][value.index]['value'],
              value['value']);
          var lab = value['label'].replace(' ', '_');
          if(comclass == 0x30){
            if(value.index == 0){
              mongoose.addStatement(nodeid, lab, value['value']);
            }
          }
          else if(comclass == 0x31){// COMMAND_CLASS_SENSOR_MULTILEVEL
          //index: 1 Temprature, 3 Luminance, 5 Relative humidity
            switch(value.index){
              case 1:
                if(value['units'] == 'F'){
                  var tmpVal = (value['value'] - 32)/1.8;
                  mongoose.addStatement(nodeid, lab, tmpVal.toFixed(1));
                }
                else
                  mongoose.addStatement(nodeid, lab, value['value'].toFixed(1));
                break;
              case 3:
                mongoose.addStatement(nodeid, lab, value['value']);
                break;
              case 5:
                mongoose.addStatement(nodeid, lab, value['value']);
                break;
            }
          }
          else if(comclass == 0x80){
            if(value.index == 0){
              mongoose.updateBattery(nodeid, value['value']);
            }
          }
      }
      nodes[nodeid]['classes'][comclass][value.index] = value;
  });

  zwave.on('value removed', function(nodeid, comclass, index) {
      if (nodes[nodeid]['classes'][comclass] &&
          nodes[nodeid]['classes'][comclass][index])
          delete nodes[nodeid]['classes'][comclass][index];
  });

  zwave.on('node ready', function(nodeid, nodeinfo) {

      var batteryLvl;
      var snsrs = [];
      var asyncTasks = [];
      var motionSnsrid, tempSnsrid, lumiSnsrid, humiSnsrid;
      var motionName, tempName, lumiName, humiName;
      var tmpMotion, tmpTemp, tmpLumi, tmpHumi;
      var motionUnits, tempUnits, lumiUnits, humiUnits;

      nodes[nodeid]['manufacturer'] = nodeinfo.manufacturer;
      nodes[nodeid]['manufacturerid'] = nodeinfo.manufacturerid;
      nodes[nodeid]['product'] = nodeinfo.product;
      nodes[nodeid]['producttype'] = nodeinfo.producttype;
      nodes[nodeid]['productid'] = nodeinfo.productid;
      nodes[nodeid]['type'] = nodeinfo.type;
      nodes[nodeid]['name'] = nodeinfo.name;
      nodes[nodeid]['loc'] = nodeinfo.loc;
      nodes[nodeid]['ready'] = true;
      console.log('node%d: %s, %s', nodeid,
          nodeinfo.manufacturer ? nodeinfo.manufacturer : 'id=' + nodeinfo.manufacturerid,
          nodeinfo.product ? nodeinfo.product : 'product=' + nodeinfo.productid +
          ', type=' + nodeinfo.producttype);
      console.log('node%d: name="%s", type="%s", location="%s"', nodeid,
          nodeinfo.name,
          nodeinfo.type,
          nodeinfo.loc);
      for (comclass in nodes[nodeid]['classes']) {
        switch (comclass) {
            case 0x25: // COMMAND_CLASS_SWITCH_BINARY 
            case 0x26: // COMMAND_CLASS_SWITCH_MULTILEVEL 
              zwave.enablePoll(nodeid, comclass);
              break;
        }
        var values = nodes[nodeid]['classes'][comclass];

        /************************************************************/
        //détection des différents sous capteurs
        //pb rencontré avec le switch, utilisation du if
        if(comclass == 0x30){
          if(values[0]){ // COMMAND_CLASS_SENSOR_BINARY
            //index: 0 motion sensor, 1 Door/Window sensor, 2 tamper
            tmpMotion = values[0]['label'].replace(' ', '_');
            motionUnits = values[0]['units']; //probablement tout le temps vide ''
            asyncTasks.push(function(callback){
              mongoose.idMainSensor(nodeid, nodeinfo.product, function(nameid){
                motionSnsrid = tmpMotion + '_' + nodeid;
                snsrs.push(motionSnsrid);
                motionName = nameid + '_Motion';
                callback();
              });
            });
          }
        }
        else if(comclass == 0x31){ // COMMAND_CLASS_SENSOR_MULTILEVEL
          //index: 1 Temprature, 3 Luminance, 5 Relative humidity
          if(values[1]){
            tmpTemp = values[1]['label'].replace(' ', '_');
            if(values[1]['units'] == 'F')
              tempUnits = 'C';
            else
              tempUnits = values[1]['units'];
            if(!tempUnits)
              tempUnits = 'C';
            asyncTasks.push(function(callback){
                mongoose.idMainSensor(nodeid, nodeinfo.product, function(nameid){
                tempSnsrid = tmpTemp + '_' + nodeid;
                snsrs.push(tempSnsrid);
                tempName = nameid + '_Temperature';
                callback();
              });
            });
          }
          if(values[3]){
            tmpLumi = values[3]['label'].replace(' ', '_');
            lumiUnits = values[3]['units'];
            asyncTasks.push(function(callback){
                mongoose.idMainSensor(nodeid, nodeinfo.product, function(nameid){
                lumiSnsrid = tmpLumi + '_' + nodeid;
                snsrs.push(lumiSnsrid);
                lumiName = nameid + '_Luminance';
                callback();
              });
            });
          }
          if(values[5]){
            tmpHumi = values[5]['label'].replace(' ', '_');
            humiUnits = values[5]['units'];
            asyncTasks.push(function(callback){
              mongoose.idMainSensor(nodeid, nodeinfo.product, function(nameid){
                humiSnsrid = tmpHumi + '_' + nodeid;
                snsrs.push(humiSnsrid);
                humiName = nameid + '_Humidity';
                callback();
              });
            });
          }
        }
        else if(comclass == 0x80){
          if(values[0]) batteryLvl = values[0]['value'];
        }
          /*switch (comclass) {
              case 0x30: // COMMAND_CLASS_SENSOR_BINARY
                //index: 0 motion sensor, 1 Door/Window sensor, 2 tamper
                console.log('dans motion');
                if(values[0]){
                  console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaa");
                  mongoose.idMainSensor(nodes[nodeid]['name'], nodeinfo.product, function(nameid){
                    motionSnsrid = nameid + '_motion';
                    snsrs.push(motionSnsrid);
                  });
                }
                break;
              case 0x31: // COMMAND_CLASS_SENSOR_MULTILEVEL
                //index: 1 Temprature, 3 Luminance, 5 Relative humidity
                if(values[1]){
                  mongoose.idMainSensor(nodes[nodeid]['name'], nodeinfo.product, function(nameid){
                    tempSnsrid = nameid + '_temp';
                    snsrs.push(tempSnsrid);
                  });
                }
                if(values[3]){
                  mongoose.idMainSensor(nodes[nodeid]['name'], nodeinfo.product, function(nameid){
                    lumiSnsrid = nameid + '_lumi';
                    snsrs.push(lumiSnsrid);
                  });
                }
                if(values[5]){
                  mongoose.idMainSensor(nodes[nodeid]['name'], nodeinfo.product, function(nameid){
                    humiSnsrid = nameid + '_humid';
                    snsrs.push(humiSnsrid);
                  });
                }
                break;
              default: 
                console.log('---------------------default');
          }*/
          
          /*************************************************************/

          console.log('node%d: class %d', nodeid, comclass);
          for (idx in values) {
              console.log('node%d:   idx%d %s=%s', nodeid, idx, values[idx]['label'], values[idx]['value']);
          }
      }
      /****************************************************/
      async.parallel(asyncTasks,function(){
       //ajout/mise à jour du capteur principal
        /*if(nodeinfo.name){
          mongoose.updateMainSensor(nodeinfo.name, nodeid, nodeinfo.product, batteryLvl, snsrs, function(idSnsr){
          });
        }
        else{
          mongoose.addMainSensor(nodeinfo.product, batteryLvl, snsrs, nodeid, function(idSnsr){
          });
        }*/
        mongoose.addMainSensor(nodeinfo.product, batteryLvl, snsrs, nodeid, function(idSnsr){
          if(idSnsr){
            //ajout des sous capteurs
            if(motionSnsrid){
              mongoose.existSensor(motionSnsrid, function(isDefine){
                if(!isDefine){
                  mongoose.addSensor("Motion_Sensor", motionName, "", "", motionSnsrid, motionUnits);
                }
              });
            }
            if(tempSnsrid){
              mongoose.existSensor(tempSnsrid, function(isDefine){
                if(!isDefine){
                  mongoose.addSensor("Temperature", tempName, "", "", tempSnsrid, '°' + tempUnits);
                }
              });
            }
            if(lumiSnsrid){
              mongoose.existSensor(lumiSnsrid, function(isDefine){
                if(!isDefine){
                  mongoose.addSensor("Luminance", lumiName, "", "", lumiSnsrid, lumiUnits);
                }
              });
            }
            if(humiSnsrid){
              mongoose.existSensor(humiSnsrid, function(isDefine){
                if(!isDefine){
                  mongoose.addSensor("Relative_Humidity", humiName, "", "", humiSnsrid, humiUnits);
                }
              });
            }
            nodes[nodeid]['sensors'] = snsrs;
            nodes[nodeid]['idSensor'] = idSnsr; 
          }
        });
      });
      /****************************************************/

  });

  zwave.on('notification', function(nodeid, notif) {
      switch (notif) {
          case 0:
              console.log('node%d: message complete', nodeid);
              break;
          case 1:
              console.log('node%d: timeout', nodeid);
              break;
          case 2:
              console.log('node%d: nop', nodeid);
              break;
          case 3:
              console.log('node%d: node awake', nodeid);
              break;
          case 4:
              console.log('node%d: node sleep', nodeid);
              break;
          case 5:
              console.log('node%d: node dead', nodeid);
              break;
          case 6:
              console.log('node%d: node alive', nodeid);
              break;
      }
  });

  zwave.on('scan complete', function() {
      console.log('scan complete, hit ^C to finish.');
  });


  process.on('SIGINT', function() {
      console.log('disconnecting...');
      zwave.disconnect();
      process.exit();
  });

  //*************************************************************************************
  