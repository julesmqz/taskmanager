var Q = require('q');

var config = require('../config.js');
var RQC = require('../Classes/RabbitMqClass');
var rabbit = new RQC();

function ServerClass() {}

ServerClass.prototype.startTask = function(req, res, next) {
	var taskKey = req.params.key;
	var response = {};
	if (config.tasks.hasOwnProperty(taskKey)) {
		var task = config.tasks[taskKey];
		var masterJobId = rabbit.generateUuid();
		var promises = task.jobs.map(function(j) {
			return Q.defer();
		});

		task.jobs.forEach(function(j, k) {
			j.masterJobId = masterJobId;
			j.jobKey = k;
			var queue = config.rabbitmq.queues[j.queue];
			if (k > 0) {
				promises[k-1].promise.then(function() {
					console.log('Starting job number %s', k);
					_startJob(queue, j, function(data) {
						console.log('Finised job number %s', k);
						promises[k].resolve();
					});
				});
			} else {
				console.log('Starting job number %s', k);
				_startJob(queue, j, function(data) {
					console.log('Finished job number %s', k);
					promises[k].resolve();
				});
			}

		});

		Q.all(promises.map(function(p){
			return p.promise;
		})).then(function(){
			console.log('All Jobs done');
		});

		response.started = true;
		response.msg = 'Task ' + task.name + ' started with ' + task.jobs.length + ' job(s)';
		res.send(200, response);
		next();
	} else {
		response.msg = 'Task ' + taskKey + ' not found';
		response.started = false;
		res.send(404, response);
		next();
	}
};

ServerClass.prototype.foo = function() {
	console.log('bar');
};

var server = new ServerClass();


function _startJob(q, data, cb) {
	rabbit.send(q, data, function(corr) {
		console.log('SENT with corr %s', corr);
	}, function(data, conn) {
		rabbit.close(conn);
		console.log('Job answer with data %s', data.jobId);
		cb.apply(null, [data]);
	});
};


module.exports = server;