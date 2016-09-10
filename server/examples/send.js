#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
        var q = 'hello';
        var msg = 'Hello World!';

        ch.assertQueue(q, {durable: false});
        // Note: on Node 6 Buffer.from(msg) should be used
        for( var i=1; i<100; i++){
            ch.sendToQueue(q, new Buffer(msg + i));
            console.log(" [x] Sent %s", msg + i);
        }

    });
    setTimeout(function() { conn.close(); console.log('finish'); process.exit(0); }, 1000);
});