let restaurant;
let reviews;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMapRestaurant = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();

      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);

      fetchReviewsFromURL((error, reviews) => {
        console.log('TODO fetchReviewsFromURL response?');
      });
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Get current restaurant from page URL.
 */
fetchReviewsFromURL = (callback) => {
  if (self.reviews) { // reviews already fetched!
    callback(null, self.reviews);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchReviewsByRestaurantId(id, (error, reviews) => {

      //sorte reviews order by creation date desc
      reviews.sort((a,b) => {
        let dateA = new Date(a.createdAt);
        let dateB = new Date(b.createdAt);
        return dateA>dateB ? -1 : dateA<dateB ? 1 : 0;
      });

      self.reviews = reviews;
      if (!reviews) {
        console.error(error);
        return;
      }
      fillReviewsHTML();
      callback(null, reviews)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const nameHeader = document.getElementById('restaurant-name');
  nameHeader.nameHeader = `title_${restaurant.id}`;

  let favorite = document.createElement('img');
  favorite.id = `fav-img_${restaurant.id}`;
  favorite.setAttribute('role','button');
  favorite.className = 'favorite-img';

  revertFavoriteImage(favorite, restaurant.id, restaurant.is_favorite);

  nameHeader.appendChild(favorite);

  const name = document.createElement('span');
  name.innerHTML = restaurant.name;  

  nameHeader.appendChild(name);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const source = document.getElementById('restaurant-img-source');
  source.srcset = DBHelper.thumbnailImageUrlForRestaurant(restaurant);

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('aria-labelledby', name.id);
  image.setAttribute('alt', restaurant.name);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.insertAdjacentElement('afterbegin', title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.insertAdjacentElement('beforeend', ul);
}

injectReviewHTML = (review) => {
  const ul = document.getElementById('reviews-list');
  ul.insertAdjacentElement('afterbegin', createReviewHTML(review));
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.style = "font-weight: bold";
  name.innerHTML = review.name;
  name.setAttribute('role', 'h3');
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = (new Date(review.createdAt)).toLocaleDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.setAttribute('aria-current','page');
  a.href = '#';
  a.innerHTML = restaurant.name;
  li.appendChild(a);
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
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

addReview = () => {

  let form = document.getElementById("addReviewForm");

   if (!formIsValid(form)) {
    window.alert('Please fill all the fields');
    return;
  }

  let review = {
    restaurant_id: self.restaurant.id,
    name: form['userName'].value,
    rating: form['rating'].value,
    comments: form['comments'].value
  }

  //update database
  console.log(DBHelper.addReview(review));
  injectReviewHTML(review);

  //clean form
  form['userName'].value = "";
  form['rating'].value = "5";
  form['comments'].value = "";
}

formIsValid = (form) => {
  if (form['userName'].value == '') return false;
  if (form['rating'].value == '') return false;
  if (form['comments'].value == '') return false;
  return true;
}

