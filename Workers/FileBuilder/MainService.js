#!/usr/bin/env node

var mysql = require('mysql');
var Q = require('q');
var config = require('../../config');
var RQC = require('../../Classes/RabbitMqClass');

var rabbit = new RQC();
var pool = mysql.createPool(config.database);

var jobId = rabbit.generateUuid();

rabbit.listen(config.rabbitmq.queues.fb, function(data, res) {
	console.log('Received', data);
	var data2 = {
		success: false,
		message: 'No message'
	};

	pool.query(data.queryCount, function(err, results, fields) {
		if (err) {
			data2.err = err;
			rabbit.ACK(data2, res.channel, res.message);
			throw err;
		}

		if (results.length > 0) {
			var total = results[0].total;
			var pages = Math.ceil((total) / (data.chunks));
			console.log('Gonna create %s tasks', pages);
			var qS = config.rabbitmq.queues.fb + '-' + jobId;
			//var qS = config.rabbitmq.queues.fb + '-' + 1;
			// Create Workers
			rabbit.createWorkers('/Workers/FileBuilder/SlaveService.js', qS, data.builders, jobId);

			// Wait 1 second per builder to keep working
			setTimeout(function() {
				var promises = [];

				for (var i = 0; i <= pages; i++) {
					var p = Q.defer();
					var data3 = {};
					promises.push(p);
					var offset = i * data.chunks;
					// console.log(offset);
					var limit = data.chunks;
					data3.query = data.queryBuild + ' LIMIT ' + offset + ',' + limit;
					data3.filepath = config.server.path + data.filepath + '/' + data.masterJobId + '.' + data.jobKey + '.' + jobId + '.export.' + i + '.chunk';
					data3.promiseKey = promises.length - 1;
					data3.fields = data.fields;
					data3.withTitles = (i === 0) && data.titleHeaders;
					data3.type = data.type;
					//console.log(data3);
					rabbit.send(qS, data3, function(corr) {
						console.log('SENT with corr %s', corr);
					}, function(data, conn) {
						console.log('Job answer with data %s', data.success);
						promises[data.promiseKey].resolve();
					});

				}

				Q.all(promises.map(function(p) {
					return p.promise;
				})).then(function() {
					console.log('Kill all workers');
					rabbit.killWorkers(jobId);
					data2.success = true;
					data2.message = 'All jobs finished';
					data2.jobId = jobId;
					data2.totalPages = pages;
					rabbit.ACK(data2, res.channel, res.message);
				});


			}, 1000 * (data.builders + (data.builders / 2)));



		}

		// Should receive data.
	});



});