/**
 * Required Libs
 */
var mysql      = require('mysql');
var Config = require('../../config');

/**
 * Required variables (not yet)
 */

function Querier(){
    this._createDbConn();
}

Querier.prototype._createDbConn = function(){
    var self = this;

    self.connection = mysql.createConnection({
        host     : Config.db.host,
        user     : Config.db.user,
        password : Config.db.pass,
        database : Config.db.name
    });

};

Querier.prototype.makeQuery = function( query, cb ){
    var self = this;

    self.connection.connect();

    self.connection.query('query', function(err, rows, fields) {
        if (err) throw err;

        if( typeof cb == 'function' ){
            cb.apply(self,[rows,fields]);
        }
    });

    self.connection.end();
};


return Querier;