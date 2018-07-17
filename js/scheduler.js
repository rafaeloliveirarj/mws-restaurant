const SYNC_RETRY_INTERVAL = 5000; //miliseconds

//Setup timer to keep trying when network is down
const interval = setInterval(() => {

	//TODO Refactor this

	//Check if there's any pending request to update favorite restaurants
    if (_db) {
		var storeReviews = _db.transaction('favoriteRequestQueue', 'readwrite').objectStore('favoriteRequestQueue');
		storeReviews.getAll().then(function(requests) {

			if (requests.length > 0) {
				console.log(`Found ${requests.length} 'update favorite' requests queued. Will try to sync with server...`);

				if(navigator.onLine) {
					console.log('Connection restablished.')
					requests.forEach(request => {
						DBHelper.setFavorite(request.restaurantId, request.isFavorite).then(function(response){
							console.log('Restaurant updated');
						})
						storeReviews.delete(request.timestamp);
					});
				} else {
					console.log('Server still down.');
				}
			}
		});
		
		var storeReviews = _db.transaction('reviewRequestQueue', 'readwrite').objectStore('reviewRequestQueue');
		storeReviews.getAll().then(function(requests) {

			if (requests.length > 0) {
				console.log(`Found ${requests.length} 'add review' requests queued. Will try to sync with server...`);

				if(navigator.onLine) {
					console.log('Connection restablished.')
					requests.forEach(request => {
						DBHelper.setFavorite(request.restaurantId, request.isFavorite).then(function(response){
							console.log('Review added');
						})
						storeReviews.delete(request.timestamp);
					});
				} else {
					console.log('Server still down.');
				}
			}
		})		
	}
}, SYNC_RETRY_INTERVAL);

