#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
        var q = 'buildExport';
        var msg = {
            'msg' : 'Build file please. Nr: ',
            'totalPages': 1//261
        };

        ch.assertQueue(q, {durable: false});
        // Note: on Node 6 Buffer.from(msg) should be used
        for( var i=1; i<=msg.totalPages; i++){
            msg.page = i;
            var msgJ = JSON.stringify(msg);
            ch.sendToQueue(q, new Buffer(msgJ));
            console.log(" [x] Sent %s", msg.msg + i);
        }

    });
    setTimeout(function() { conn.close(); console.log('finish'); process.exit(0); }, 1000);
});