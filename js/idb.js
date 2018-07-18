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
			let reviewsStore = upgradeDb.createObjectStore('reviews', {keyPath: 'idbInternalKey', autoIncrement:true})
			reviewsStore.createIndex('serverId', 'id');
			reviewsStore.createIndex('restaurantId', 'restaurant_id');
			reviewsStore.createIndex('createdAt', 'createdAt');
			
	}
}).then(function(database) {
	if(!database) return;
	_db = database;
});
