//stores a reference to the indexedDB database
let _db;

var dbPromise = idb.open('mws-db', 2, function(upgradeDb) {
	switch(upgradeDb.oldVersion) {
		case 0:
			upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
		case 1:
			upgradeDb.createObjectStore('favoriteRequestQueue', {keyPath: 'timestamp'});
			upgradeDb.createObjectStore('reviewRequestQueue', {keyPath: 'timestamp'});
	}
}).then(function(database) {
	if(!database) return;
	_db = database;
});

//Setup timer to keep trying when network is down
const interval = setInterval(() => {
	//Check if there's any pending request to update favorite restaurants
    if (_db) {
		var store = _db.transaction('favoriteRequestQueue', 'readwrite').objectStore('favoriteRequestQueue');
		store.getAll().then(function(requests) {
			requests.forEach(request => {
				let result = DBHelper.setFavorite(request.restaurantId, request.isFavorite);
				store.delete(request.timestamp);
			});
		})
	}
	if (false) {
		clearInterval(interval);
	};
}, 2000);

