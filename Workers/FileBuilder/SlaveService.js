#!/usr/bin/env node

var mysql = require('mysql');
var json2csv = require('json2csv');
var fs = require('fs');
var config = require('../../config');
var RQC = require('../../Classes/RabbitMqClass');

var rabbit = new RQC();
var pool = mysql.createPool(config.database);

var args = process.argv.slice(2);
var q = args[0];

rabbit.listen(q, function(data, res) {
	var data2 = {
		id: data.query,
		promiseKey: data.promiseKey,
		success: false
	};
	pool.query(data.query, function(err, results, fields) {
		if (err) {
			rabbit.ACK(data2, res.channel, res.message);
			throw error;
		}

		// console.log(results);

		if (results.length > 0) {
			try {
				var fields = data.fields;
				var file = null;
				if (data.type == 'csv') {
					var file = makeCsv({
						data: results,
						fields: fields,
						hasCSVColumnTitle: data.withTitles
					});
				}

				if( file == null ){
					throw 'File type was not correct';
				}
				fs.writeFile(data.filepath, file, function(err) {
					if (err) {
						rabbit.ACK(data2, res.channel, res.message);
						throw err;
					}
					console.log('file saved');
					data2.success = true;
					rabbit.ACK(data2, res.channel, res.message);
				});

			} catch (err) {
				rabbit.ACK(data2, res.channel, res.message);
				// Errors are thrown for bad options, or if the data is empty and no fields are provided. 
				// Be sure to provide fields if it is possible that your data array will be empty. 
				console.error(err);
			}
		} else {
			rabbit.ACK(data2, res.channel, res.message);
		}

	});

	//rabbit.ACK(data2, res.channel, res.message);
	//rabbit.close(res.conn);
});


function makeCsv(options) {
	var csv = json2csv(options);
	return csv;
}