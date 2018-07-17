const SYNC_RETRY_INTERVAL = 5000; //miliseconds

//Setup timer to keep trying when network is down
const interval = setInterval(() => {
	//Check if there's any pending request to update favorite restaurants
    if (_db) {
		var store = _db.transaction('favoriteRequestQueue', 'readwrite').objectStore('favoriteRequestQueue');
		store.getAll().then(function(requests) {

			if (requests.length > 0) {
				console.log(`Found ${requests.length} 'update favorite'requests queued. Will try to sync with server...`);

				if(navigator.onLine) {
					console.log('Connection restablished.')
					requests.forEach(request => {
						DBHelper.setFavorite(request.restaurantId, request.isFavorite).then(function(response){
							console.log('Restaurant updated');
						})
						store.delete(request.timestamp);
					});
				} else {
					console.log('Server still down.');
				}

			}

		})
	}
	if (false) {
		clearInterval(interval);
	};
}, SYNC_RETRY_INTERVAL);

