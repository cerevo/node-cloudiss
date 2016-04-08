var noble = require('noble'),
var buzzerCharacteristics;

var cloudissId = 'SN15910915';

noble.on('stateChange', function(state){
	console.log("State changed");
	if(state === 'poweredOn'){
		noble.startScanning([], true);
		console.log("Start Scanning");
	} else {
		noble.stopScanning();
	}
});

noble.on('discover', function(peripheral){

	var serialNoString = '';
	if(peripheral.advertisement.manufacturerData){
		var buffer = new Buffer(12);
		buffer = peripheral.advertisement.manufacturerData;
		serialNoString = buffer.toString('ASCII', 2, 12)
		console.log('serial: ' + serialNoString);
	}

	// if(peripheral.uuid === 'ff854bcf1f714efdbd000f52ddc611f5'){
	if(serialNoString === cloudissId){
		console.log('Cloudiss is found');
		noble.stopScanning();
		peripheral.connect(function(error){
			console.log('connected to peripheral: ' + peripheral.uuid);
			peripheral.discoverServices(['45699460100b11e58ab20002a5d5c51b'], function(error, services){ // Serviceを特定しない場合は['180a']をnullに
				console.log('The service is discovered');
				services[0].discoverCharacteristics([], function(error, characteristics){
					for (var i in characteristics) {
						if(characteristics[i].uuid === '45699465100b11e58ab20002a5d5c51b'){
							console.log('discovered the authorization characteristics:');
							var auth = Buffer([0x05,0x41,0x41,0x41,0x41,0x41,0x41,0x41,0x41,0x41,0x41,0x41,0x41,0x41,0x41,0x41,0x41]);
							var authCharacteristics = characteristics[i];
							authCharacteristics.write(auth, false, function(error){
								console.log('write characteristics' + error);
								authCharacteristics.read(function(error, data){
									console.log('auth: %s', authCharacteristics.uuid);
									console.log(data);
								});
							});
						}
						else if(characteristics[i].uuid === '45699464100b11e58ab20002a5d5c51b'){
							console.log('discovered the buzzer testing characteristics:');
							// [code, type, vol, count, strength, onoff]
							buzzerCharacteristics = characteristics[i];
							buzzerCharacteristics.notify(true, function(error){
								console.log('buzzer notify is enabled');
							});
						}
						else if(characteristics[i].uuid === '45699463100b11e58ab20002a5d5c51b'){
							// console.log('');
						}
						else if(characteristics[i].uuid === '45699462100b11e58ab20002a5d5c51b'){
							console.log('discovered Train delay characteristics');
							var trainCharacteristics = characteristics[i];
							trainCharacteristics.notify(true, function(error){
								console.log('train notify is enabled');
							});
						}
						else if(characteristics[i].uuid === '45699461100b11e58ab20002a5d5c51b'){
							console.log('discovered the time fixing characteristics:');
							var timef = Buffer([0x01,0x01,0x14,0x14,0x14,0x14,0x14,0x14,0x14,0x14,0x02,0x02]);
							var timeCharacteristics = characteristics[i];
							timeCharacteristics.notify(true, function(error){
								console.log('time notify is enabled');
							})
						}
					};
				});
			});
		});
	}
});

// myThings
var meshblu = require('meshblu');

var conn = meshblu.createConnection({
  "uuid": "",
  "token": "",
  "server": "",
  "port":
});

conn.on('ready', function(data){
  console.log('Ready');

  conn.on('message', function(data){
    console.log('action-1: Received');
    console.log(data);

    var buzzer = Buffer([0x05,0x03,0x1A,0x0A,0x02,0x01]);
    console.log('Start arrived');
    buzzerCharacteristics.write(buzzer, false, function(error){
      console.log('write buzzer');
      console.log(error);
    });
  });
});
