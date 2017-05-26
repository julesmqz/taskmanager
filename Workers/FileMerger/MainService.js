#!/usr/bin/env node

var concatFiles = require('concat-files');
var fs = require('fs');
var config = require('../../config');
var RQC = require('../../Classes/RabbitMqClass');

var rabbit = new RQC();
var jobId = rabbit.generateUuid();

rabbit.listen(config.rabbitmq.queues.fm, function(data, res) {
	var data2 = {
		success: false
	};

	var files = [];
	var filepath = config.server.path + '/' + data.filepath + '/';
	fs.readdirSync(filepath).forEach(file => {
		if (file.indexOf(data.masterJobId) > -1) {
			files.push(filepath + file);
		}
	});

	concatFiles(files, filepath + data.resultFile, function(err) {
		if (err) {
			rabbit.ACK(data2, res.channel, res.message);
			throw err;
		}
		data2.success = true;
		data2.message = 'File merged into ' + filepath + data.resultFile;
		data2.jobId = jobId;
		rabbit.ACK(data2, res.channel, res.message);
	});



	//rabbit.ACK(data2, res.channel, res.message);
	//rabbit.close(res.conn);
});