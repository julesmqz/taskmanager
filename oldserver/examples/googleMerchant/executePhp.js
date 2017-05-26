#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var shell = require('shelljs');

amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
        var q = 'buildExport';

        ch.assertQueue(q, {durable: false});
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function(msg) {
            if ( msg ){
                var oMsg = JSON.parse(msg.content);
                var start = 0;
                if( oMsg.page > 1){
                    start = ( oMsg.page * 200 ) - 199;
                }
                console.log(" [x] Received %s", oMsg.msg + oMsg.page);
                var cmd = 'php /Users/jules/Sites/cochemania/modules/cppixels/cpgooglesitemap/cronjobs/google_merchant_export.php '+start+' '+oMsg.page;
                console.log('Executing cmd',cmd);
                shell.exec(cmd);
            }
        }, {noAck: true});
    });
});