let restaurants,
  neighborhoods,
  cuisines;
var map;
var markers = [];

let showMap = false;

registerServiceWorker = function() {
    
  if(!navigator.serviceWorker) return;

  navigator.serviceWorker.register('sw.js', {scope: '/'}).then(function() {
      console.log('Service worker registrated.');
  }).catch(function() {
    console.log('service worker registration failed');
  });
}

registerServiceWorker();

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
initMainScreen = function() {
  fetchNeighborhoods();
  fetchCuisines();
  updateRestaurants();
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {

  if(self.showMap) {

    //add map to the HTML
    let mapElement = document.createElement('div');
    mapElement.id = 'map';
    mapElement.setAttribute('role', 'application');

    const mapContainer = document.getElementById('map-container');
    mapContainer.appendChild(mapElement);

    //Create map instance
    let loc = {
      lat: 40.722216,
      lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: loc,
      scrollwheel: false
    });
  }
}

/**
 * Remove map from the page
 */
removeMap = () => {

  const mapContainer = document.getElementById('map-container');
  mapContainer.innerHTML = '';

  self.map = null;
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants();
      fillRestaurantsHTML(restaurants);
      addMarkersToMap(restaurants);
      self.restaurants = restaurants;
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = () => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  //self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const picture = document.createElement('picture');
  li.append(picture);

  const source = document.createElement('source');
  source.srcset = DBHelper.thumbnailImageUrlForRestaurant(restaurant);
  picture.append(source);
  
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('aria-labelledby', `title_${restaurant.id}`);
  image.alt = restaurant.name;
  picture.append(image);

  const name = document.createElement('h3');
  name.id = `title_${restaurant.id}`;
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.setAttribute('role','button');
  more.innerHTML = 'View Details';
  more.setAttribute('aria-labelledby', name.id);
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  let favorite = document.createElement('img');
  favorite.id = `fav-img_${restaurant.id}`;
  favorite.setAttribute('role','button');
  favorite.className = 'favorite-img';
  favorite.setAttribute('aria-labelledby', name.id);

  revertFavoriteImage(favorite, restaurant.id, restaurant.is_favorite);

  li.append(favorite);

  return li;
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {

  if(self.showMap) {
    restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
      google.maps.event.addListener(marker, 'click', () => {
        window.location.href = marker.url
      });
      self.markers.push(marker);
    });
  }
}

setFavorite = (restaurantId, isFavorite) => {
  //update database
  DBHelper.setFavorite(restaurantId, isFavorite);

  //update UI
  var favoriteImageElement = document.getElementById(`fav-img_${restaurantId}`);
  revertFavoriteImage(favoriteImageElement, restaurantId, isFavorite);

}

revertFavoriteImage = (favoriteElement, restaurantId, isFavorite) => {
  
  if (typeof isFavorite == 'string') {
    isFavorite = (isFavorite === 'true');
  }

  favoriteElement.setAttribute('onclick', `setFavorite(${restaurantId}, ${!isFavorite})`);
  if (isFavorite) {
    favoriteElement.setAttribute('src', 'dist/img/star_icon_on.svg');
  } else {
    favoriteElement.setAttribute('src', 'dist/img/star_icon_off.svg');
  }
}

/**
 * Shows/Hides the map
 */

 toggleMap = () => {

  self.showMap = !self.showMap;

  if(self.showMap) {
    window.initMap();
    addMarkersToMap();
  } else {
    removeMap();
  }


 }