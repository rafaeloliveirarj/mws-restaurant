//stores a reference to the indexedDB database
let _db;

var dbPromise = idb.open('mws-db', 3, function(upgradeDb) {
	switch(upgradeDb.oldVersion) {
		case 0:
			upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
		case 1:
			upgradeDb.createObjectStore('favoriteRequestQueue', {keyPath: 'timestamp'});
			upgradeDb.createObjectStore('reviewRequestQueue', {keyPath: 'timestamp'});
		case 2:
			upgradeDb.createObjectStore('reviews', {keyPath: 'idbInternalKey', autoIncrement:true});
	}
}).then(function(database) {
	if(!database) return;
	_db = database;
});
