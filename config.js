var config = {
	database: {
		host: '127.0.0.1',
		user: 'root',
		password: '',
		database: 'cochem_shop'
	},
	rabbitmq: {
		url: 'amqp://localhost',
		queues: {
			fb: 'file-builder',
			fm: 'file-merger',
		}
	},
	tasks: {
		google_dsa: {
			name:'Google DSA Feed Build',
			jobs: [{
				queryCount: 'SELECT COUNT(*) as total FROM (SELECT DISTINCT(CONCAT(\'https://www.cochemania.mx/\',oxseo.oxseourl,\'para-\',REPLACE(uniqueid,CONCAT(\'-\',mYear),\'\'))) as url FROM oxcategories JOIN oxobject2category o2c ON o2c.oxcatnid = oxcategories.oxid JOIN oxarticles ON oxarticles.oxid = o2c.oxobjectid JOIN oxseo ON oxseo.oxobjectid = oxcategories.oxid AND oxseo.oxshopid=\'oxbaseshop\' AND oxseo.oxlang = 0 JOIN cpCar_2articles c2a ON c2a.f_oxArticles = oxarticles.oxid JOIN cpCar_modelYears my ON c2a.f_cpCar_modelYears =  my.index1 WHERE uniqueid IS NOT NULL AND oxarticles.oxparentid=\'\' AND NOT cpiseol) m',
				builders: 5,
				chunks: 500,
				queryBuild: 'SELECT * FROM (SELECT DISTINCT(CONCAT(\'https://www.cochemania.mx/\',oxseo.oxseourl,\'para-\',REPLACE(uniqueid,CONCAT(\'-\',mYear),\'\'))) as url, \'Standard\' as type FROM oxcategories JOIN oxobject2category o2c ON o2c.oxcatnid = oxcategories.oxid JOIN oxarticles ON oxarticles.oxid = o2c.oxobjectid JOIN oxseo ON oxseo.oxobjectid = oxcategories.oxid AND oxseo.oxshopid=\'oxbaseshop\' AND oxseo.oxlang = 0 JOIN cpCar_2articles c2a ON c2a.f_oxArticles = oxarticles.oxid JOIN cpCar_modelYears my ON c2a.f_cpCar_modelYears =  my.index1 WHERE uniqueid IS NOT NULL AND oxarticles.oxparentid=\'\' AND NOT cpiseol) m ORDER BY m.url ASC',
				filepath: '/export/files',
				fields: ['url', 'type'],
				type: 'csv',
				titleHeaders: true,
				queue: 'fb'
			},
			/*{
				queryCount: 'SELECT COUNT(*) FROM (SELECT oxarticles.oxid, cpCar_2articles.googleTitle, cpCar_modelYears.index1 as carid FROM `oxarticles` JOIN oxmanufacturers ON oxarticles.oxmanufacturerid = oxmanufacturers.oxid AND oxmanufacturers.oxactive = 1 JOIN oxobject2category ON oxarticles.oxid = oxobject2category.oxobjectid JOIN oxcategories ON oxcategories.oxid = oxobject2category.oxcatnid AND oxcategories.oxactive = 1 AND oxcategories.oxhidden = 0 AND oxcategories.googleid <> \'\' JOIN oxartextends ON oxarticles.oxid = oxartextends.oxid JOIN cpCar_2articles ON oxarticles.oxid = cpCar_2articles.f_oxArticles JOIN cpCar_modelYears ON cpCar_2articles.f_cpCar_modelYears = cpCar_modelYears.index1 WHERE oxarticles.cpiseol = 0 AND oxarticles.oxactive = 1 AND oxarticles.oxprice > 0 AND oxarticles.oxartnum <> '' AND oxarticles.oxvarcount = 0 AND oxarticles.googleactive = 1 AND cpCar_2articles.googleTitle <> \'\' AND oxarticles.oxartnum <> \'SUA1000I\' GROUP BY oxarticles.oxid,cpCar_modelYears.index1,cpCar_2articles.googleTitle) as m',
				builders: 5,
				chunks: 500,
				queryBuild: 'SELECT COUNT(*) FROM (SELECT oxarticles.oxid, cpCar_2articles.googleTitle, cpCar_modelYears.index1 as carid FROM `oxarticles` JOIN oxmanufacturers ON oxarticles.oxmanufacturerid = oxmanufacturers.oxid AND oxmanufacturers.oxactive = 1 JOIN oxobject2category ON oxarticles.oxid = oxobject2category.oxobjectid JOIN oxcategories ON oxcategories.oxid = oxobject2category.oxcatnid AND oxcategories.oxactive = 1 AND oxcategories.oxhidden = 0 AND oxcategories.googleid <> \'\' JOIN oxartextends ON oxarticles.oxid = oxartextends.oxid JOIN cpCar_2articles ON oxarticles.oxid = cpCar_2articles.f_oxArticles JOIN cpCar_modelYears ON cpCar_2articles.f_cpCar_modelYears = cpCar_modelYears.index1 WHERE oxarticles.cpiseol = 0 AND oxarticles.oxactive = 1 AND oxarticles.oxprice > 0 AND oxarticles.oxartnum <> '' AND oxarticles.oxvarcount = 0 AND oxarticles.googleactive = 1 AND cpCar_2articles.googleTitle <> \'\' AND oxarticles.oxartnum <> \'SUA1000I\' GROUP BY oxarticles.oxid,cpCar_modelYears.index1,cpCar_2articles.googleTitle) as m',
				filepath: '/export/files',
				fields: ['oxtitle', 'oxartnum'],
				type: 'csv',
				titleHeaders: false,
				queue: 'fb'
			},*/
			{
				filepath: '/export/files',
				resultFile: 'dsa_feed.csv',
				queue: 'fm'
			}]
		}
	},
	server: {
		port: 9090,
		path: '/Users/jules/Workspace/taskmanager'
	},
	mail: {
		sender: 'info@cyberpuerta.mx',
		recipients: ['j.marquez@cyberpuerta.mx'],
		sesCreds: {
			'key': '',
			'secret': '',
			'region': ''
		}
	}
};


try {
	var customConf = require('./config.custom.js');
	// do stuff
	//config = customConf;
} catch (ex) {
	// File does not exists
}


module.exports = config;