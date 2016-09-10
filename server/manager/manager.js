/**
 * Required libs
 */
var querier = require('./utils/querier');
var amqp = require('amqplib/callback_api');
var Config = require('../config');
var wt = require('waterline');

/**
 * Steps:
 * 1) Receive message and see what to do
 * 2) create necessary instances and execute stuff
 * 3) Hear the queue
 *
 */

function Manager(){
    this.init();
}

Manager.prototype.init = function(){
    self.mainQ = config.manager.managerQ;
    self.oMsg = {};
}

Manager.prototype.whichWorker = function(){
    var type = self.oMsg.type || null;
    switch (type){
        case 'buildFile':
            self.executeFileBuilder();
            break;
        default:
            console.error('Following type of job does not exists: %s',type);
            break;
    }
};

Manager.prototype.executeFileBuilder = function(){

    self._createWorkers('./buildFile/filebuilder');

};

Manager.prototype.receiveMessage = function(cb){
    // Code to receive message from main queue, right now nothing
    var self = this;

    amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, ch) {
            var q = self.mainQ; // listen to main Queue


            ch.assertQueue(q, {durable: false});
            console.log(" [*] Waiting for messages in %s.", q);

            ch.consume(q, function(msg) {

                self.oMsg = JSON.parse(msg.content);


                console.log(" [x] Received %s", self.oMsg.msg);

                self.whichWorker();

                if( typeof cb == 'function' )
                    cb.apply(self,[oMsg]);

            }, {noAck: true});
        });
    });
};


var m = new Manager();

m.receiveMessage(function(msg){
    console.log('callback: ',msg);
});