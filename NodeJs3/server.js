  ///////////////////////////////////////////////////////////////////
  /*
   * V3
   */

  var OpenZWave = require('openzwave');
  var mongoose = require('./moduleMongoose');

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
          addValue(nodeid, lab, value['value']);
      }
      nodes[nodeid]['classes'][comclass][value.index] = value;
  });

  zwave.on('value removed', function(nodeid, comclass, index) {
      if (nodes[nodeid]['classes'][comclass] &&
          nodes[nodeid]['classes'][comclass][index])
          delete nodes[nodeid]['classes'][comclass][index];
  });

  zwave.on('node ready', function(nodeid, nodeinfo) {
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
          console.log('node%d: class %d', nodeid, comclass);
          for (idx in values) {
              console.log('node%d:   %s=%s', nodeid, values[idx]['label'], values[idx]['value']);
              //console.log('affiche : %s',values[idx]['label'] );
              var lab = values[idx]['label'].replace(' ', '_');
              addValue(nodeid, lab, values[idx]['value']);


          }
      }
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

  var showStatement = function() {
      var query = mongoose.showStatement();
      query.exec(function(err, relevs) {
          if (err) {}
          // On va parcourir le résultat et les afficher
          var relev;
          for (var i = 0, l = relevs.length; i < l; i++) {
              relev = relevs[i];
              console.log('------------------------------');
              console.log('ID : ' + relev._id);
              console.log('value : ' + relev.value);
              console.log('Date : ' + relev.date);
              console.log('------------------------------');
          }
      });
  }

  var addValue = function(nodeid, label, value) {

      if (label == 'Luminance' || label == 'Temperature' || label == 'Relative_Humidity' || label == 'Sensor' || label == 'Battery_Level') {
          mongoose.addStatement(nodeid, label, value)
      }
  }

  var removeStatement = function() {
  mongoose.removeStatement();
  }

  