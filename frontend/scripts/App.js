let userInfo;
let data;
let mainDiv;
let imgSource;
let map;
let geocoder;

let markerCluster;
let yesLocations = [];
let noLocations = [];
let markersData = [];
let markersList = [];
let listenerList = [];

let latindices = [];
let lngindices = [];
let totalindices = [];

let fetching = false;

let initialComplete = false;
let initialYesNoDisplayComplete = false;

let totalDistance = 0;
let scroller = null;
let totalDistanceCalcComplet = false;
let speed = 5;
let displacement = 0;

function initScroll(elementId) {
	if (!totalDistanceCalcComplet) {
		totalDistanceCalc(elementId);
		totalDistanceCalcComplet = !totalDistanceCalcComplet;
	}
	if (displacement >= totalDistance) {
		clearTimeout(scroller);
		return;
	}
	scroller = setTimeout(function() {
		initScroll(elementId);
	}, 1)
	displacement += speed;
	window.scrollBy(0, speed);
}

function resetVar() {
	totalDistance = 0;
	scroller = null;
	totalDistanceCalcComplet = false;
	displacement = 0;
}

function totalDistanceCalc(elementId) {
	totalDistance = document.getElementById(elementId).offsetTop - window.scrollY;
}


document.getElementById('submitbtn').addEventListener('click', (e) => {
	e.preventDefault();
	resetVar();
	let screennameText = document.getElementById('screenName');
	document.getElementById('submitbtn').disabled = true;
	
	fetch(`https://map-twit-be.herokuapp.com/userInfo/${screennameText.value}`)
	    .then((res) => res.json())
	    .then((res) => {
			userInfo = res;
			getInitialData(userInfo["screenName"]);
			screennameText.value = '';    
	    })
	    .catch((err) => {
	    	document.getElementById('submitbtn').disabled = false;
	    	screennameText.value = 'Screen name does not exist';
	    });	
})

function getInitialData(screenName) {
	fetch(`https://map-twit-be.herokuapp.com/followers/${screenName}`)
	    .then((res) => res.json())
	    .then((res) => {
	      data = res;
	    })
	    .then(() => {
	    	if (!initialComplete) {
				initialComplete = true;
			    mainDiv = document.createElement('div');
			    mainDiv.id = 'mainDiv';
		        
			    mainDivContainer = document.createElement('div');
			    mainDivContainer.id = 'mainDivContainer';

		        loadScript();		    
		        document.body.prepend(mainDivContainer);
		        document.getElementById('mainDivContainer').appendChild(mainDiv);
		        logoutOnlyToggle();
	        } else {
	        	getFollowers();
	        	reloadUserInfoDiv(userInfo);
	        }
	        setTimeout(() => {
			    $('html, body').animate({
			        scrollTop: $("#map").offset().top - 111
			    }, 2000);	        	
	        }, 1700)
	        document.getElementById('submitbtn').disabled = false;
	    })
	    .catch((err) => {
	    	document.getElementById('submitbtn').disabled = false;
	    });	
}


document.getElementById('screenName').addEventListener('focus', (e) => {
	if (e.target.value == "Screen name does not exist") {
		e.target.value = '';
	}
	document.getElementById('submitbtn').disabled = false;
})

function logoutOnlyToggle() {
	var elements = document.getElementsByClassName('toggle');
	for (element of elements) {
		element.classList.toggle('logoutonly');
	}
}


function initMap() {
    map = new google.maps.Map(
        document.getElementById('map'), {
        zoom: 2.6, 
        center: {lat: 0, lng: 15},
        mapTypeId: 'hybrid',
        zoomOnClick: false
        });

    let caller = userInfo;

	createUserInfoDiv(caller);
	createLegend();

    geocoder = new google.maps.Geocoder();
    geocodeAddress(caller, true)
    for (user of data) {
		if (user.location) {
			geocodeAddress(user, false);
			yesLocations.push(user);
		} else {
			noLocations.push(user);
		}
    }
  setTimeout(() => {
  	markerModifier();
	for (markerDatum of markersData) {
		let marker = createMarker(markerDatum.coordinates, markerDatum.screenName, markerDatum.original, markerDatum.location, markerDatum.name);
		markersList.push(marker);
	}
  	  markerCluster = new MarkerClusterer(map, markersList, {
  	  	imagePath: "/images-cluster/m"
  	  });
  }, 2500);
    displayYesAndNoLocations(yesLocations, noLocations);

    let mapElement = document.getElementById('map');
    
    mapElement.style.padding = "10px 10px 10px 10px";

    mapElement.style.border = "4px solid #292F33";

    document.getElementById('currentDisplay').textContent = "Currently Displaying: Followers";
}

function removeYesAndNoLocations() {
	document.getElementById('ulNo').remove();
	document.getElementById('ulYes').remove();
}

function markerModifier() {
	let lat = markersData.map((ele) => {
		return ele.coordinates.lat;
	});
	let lng = markersData.map((ele) => {
		return ele.coordinates.lng;
	});
	lat.forEach((ele, index) => {
		if (lat.includes(ele, index+1)) {
	    	if (!latindices.includes(index)) {
	        	latindices.push(index);
			}
		}
	});
	lng.forEach((ele, index) => {
		if (lng.includes(ele, index+1)) {
	    	if (!lngindices.includes(index)) {
	        	lngindices.push(index);
			}
		}
	});
	latindices.forEach((ele,index) => {
		lngindices.forEach((ele1,index1) => {
			if (ele == ele1) {
				totalindices.push(ele);
			}
		})
	});
	for (index of totalindices) {
		let lat = markersData[index].coordinates.lng;
		let lng = markersData[index].coordinates.lng;

		markersData[index].coordinates.lat = lat + Math.random();
		markersData[index].coordinates.lng = lng + Math.random();
	}
}

function getFollowing() {
	if (!fetching) {
		fetching = true;

		fetch(`https://map-twit-be.herokuapp.com/following/${userInfo["screenName"]}`)
		  .then((res) => res.json())
		  .then((res) => {
		    data = res;
		  })
		  .then(() => {
		  	reset();
		  	reloadMarkers();
		    document.getElementById('currentDisplay').textContent = "Currently displaying: Following"
		  })
		  .catch((err) => console.log(err));

		setTimeout(() => {
			fetching = false;
		}, 3000);
	}
}

function getFollowers() {
	if (!fetching) {	
		fetching = true;

		fetch(`https://map-twit-be.herokuapp.com/followers/${userInfo["screenName"]}`)
		  .then((res) => res.json())
		  .then((res) => {
		    data = res;
		  })
		  .then(() => {
		  	reset();
			reloadMarkers();
		    document.getElementById('currentDisplay').textContent = "Currently displaying: Followers"
		  })
		  .catch((err) => console.log(err));

		setTimeout(() => {
			fetching = false;
		}, 3000);
	}
}

function reset() {
	markerCluster.clearMarkers();

	removeListeners();
    removeMarkers();

	geocoder = '';
	yesLocations = [];
	noLocations = [];
	markersList = [];
	listenerList = [];
	markersData = [];

	latindices = [];
	lngindices = [];
	totalindices = [];
}

function removeListeners() {
  for (listener of listenerList) {
    google.maps.event.removeListener(listener);
  }
}

function removeMarkers() {
  for (marker of markersList) {
    marker.setMap(null);
  }
}

function reloadMarkers() {
  let caller = userInfo;
  geocoder = new google.maps.Geocoder();
  geocodeAddress(caller, true)

  for (user of data) {
    if (user.location) {
      geocodeAddress(user, false)
      yesLocations.push(user);
    } else {
      noLocations.push(user);
    }
  }
  setTimeout(() => {
  	markerModifier();
	for (markerDatum of markersData) {
		let marker = createMarker(markerDatum.coordinates, markerDatum.screenName, markerDatum.original, markerDatum.location, markerDatum.name);
		markersList.push(marker);
	} 
  	  markerCluster = new MarkerClusterer(map, markersList, {imagePath: "/images-cluster/m"});
  }, 2500);

    displayYesAndNoLocations(yesLocations, noLocations);
}

function geocodeAddress(user, original) {
	  geocoder.geocode({"address": user.location}, (results, status) => {
	    if (status == "OK") {
	      let lat = results[0].geometry.location.lat();
	      let lng = results[0].geometry.location.lng();
	      let coordinates = { lat , lng };
	      var marker = {
	      	coordinates: coordinates,
	      	screenName: user.screenName,
	      	original: original,
	      	location: user.location,
	      	name: user.name
	      };
	      markersData.push(marker);
	    }
	  });
}

function createMarker(coordinates, screenName, original, address, name) {
  var marker = new google.maps.Marker({
          position: coordinates, 
          map: map,
          title: '',
          icon: {
            url: (original?'/images/Picture2.png':'/images/Picture1.png')
          }, 
          label: {
            color: "white", 
            fontWeight: "bold", 
            fontSize: "14px", 
            text: `@${screenName}`
            }
          });

    var infowindow = new google.maps.InfoWindow({
      content: createPopup(screenName, name, address)
    });
    //adds popup
    e1 = google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,this);
    }.bind(marker));

    //adds larger size and foreground presence when hover over icon
    e2 = google.maps.event.addListener(marker, 'mouseover', function(e) {
      this.setZIndex(199);
      this.setIcon((original?'/images/Picture2-large.png':'/images/Picture1-large.png'));
    }.bind(marker));

    //reverts to normal size and background presence when leave icon
    e3 = google.maps.event.addListener(marker, 'mouseout', function(e) {
      this.setZIndex(0);
      this.setIcon((original?'/images/Picture2.png':'/images/Picture1.png'));
    }.bind(marker));

    listenerList.push(e1);
    listenerList.push(e2);
    listenerList.push(e3);

    return marker;
}

function createPopup(screenName, name, address) {
	return ('<div class="popup">' + 
      `<p>Name: <span>${name}</p></span>` +
      `<p>ScreenName: <span>@${screenName}</p></span>` + 
      `<p>Location: <span>${address}</p></span>` +
      '</div>');
}

function displayYesAndNoLocations(usersYes, usersNo) {
	let yesLocationsDiv = document.getElementById('yes-locations');

	yesLocationsDiv.style.cssFloat = "left";

	yesLocationsDiv.childNodes[0].innerHTML = `
	  <h3>Yes Locations Given :  ${usersYes.length}</h3>`;

	let noLocationsDiv = document.getElementById('no-locations');

	noLocationsDiv.style.cssFloat = "left";

	noLocationsDiv.childNodes[0].innerHTML = `
	  <h3>No Locations Given :  ${usersNo.length}</h3>`;
	
	if (!initialYesNoDisplayComplete) {
		var ulYes = document.createElement('ul');
		var ulNo = document.createElement('ul');

		ulYes.id = "ulYes";
		ulNo.id = "ulNo";	
		yesLocationsDiv.appendChild(ulYes);
		noLocationsDiv.appendChild(ulNo);		
	}
	initialYesNoDisplayComplete = true;

	var ulYes = document.getElementById('ulYes');
	var ulNo = document.getElementById('ulNo');

	ulYes.innerHTML = '';
	ulNo.innerHTML = '';

	for (userYes of usersYes) {
	  var liYes = document.createElement('li');
	  liYes.classList.add('followInfo');
	  liYes.textContent = `${userYes.name}, @${userYes.screenName} : ${userYes.location}`
	  ulYes.appendChild(liYes);
	}
	for (userNo of usersNo) {
	  var liNo = document.createElement('li');
	  liNo.classList.add('followInfo');
	  liNo.textContent = `${userNo.name}, @${userNo.screenName} : No Location Given`
	  ulNo.appendChild(liNo);
	}
}

function createLegend() {
	var iconBase = '/images/';
	var icons = {
	  user: {
	    name: 'You',
	    icon: iconBase + 'Legend2.png'
	  },
	  ff: {
	    name: 'Followers/Following',
	    icon: iconBase + 'Legend1.png'
	  }
	};
	var legend = document.getElementById('legend');
	for (key in icons) {
	  var type = icons[key];
	  var name = type.name;
	  var icon = type.icon;
	  var div = document.createElement('div');
	  div.classList.add('icon');
	  div.innerHTML = '<img src="' + icon + '">' + name;
	  legend.appendChild(div);
	}
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
}

function createUserInfoDiv(caller) {
	let userImgDiv = document.createElement('div');
	let userInfoDiv = document.createElement('div');
	let userNamesDiv = document.createElement('div');
	userImgDiv.id = 'userImg';
	userInfoDiv.id = "userInfo";
	userNamesDiv.id = "userNames";
	
	mainDiv.appendChild(userImgDiv);
	mainDiv.appendChild(userInfoDiv);
	mainDiv.appendChild(userNamesDiv);

	let userImg = `
	<img id="profileImg" src="${caller.img}">`;

	let userInfo = `
	<p class="countHeader">Following<br />
		<span class="countHeading">${caller.followingCount}</span>
	</p>
	<p class="countHeader">Followers<br />
		<span class="countHeading">${caller.followersCount}</span>
	</p>`;

	let userNames = `
		<p id="nameHeading">${caller.name}</p>
		<p id="screenNameHeading">@${caller.screenName}</p>`;

	userInfoDiv.innerHTML = userInfo;
	userImgDiv.innerHTML = userImg;
	userNamesDiv.innerHTML = userNames; 

	createOptionButtons();
}

function reloadUserInfoDiv(user) {
	let userImgDiv = document.getElementById('userImg');
	let userInfoDiv = document.getElementById('userInfo');
	let userNamesDiv = document.getElementById('userNames');

	let userImg = `
	<img id="profileImg" src="${user.img}">`;

	let userInfo = `
	<p class="countHeader">Following<br />
		<span class="countHeading">${user.followingCount}</span>
	</p>
	<p class="countHeader">Followers<br />
		<span class="countHeading">${user.followersCount}</span>
	</p>`;

	let userNames = `
		<p id="nameHeading">${user.name}</p>
		<p id="screenNameHeading">@${user.screenName}</p>`;

	userInfoDiv.innerHTML = userInfo;
	userImgDiv.innerHTML = userImg;
	userNamesDiv.innerHTML = userNames; 
}

function createOptionButtons() {
	let btnContainer = document.createElement('div');
	btnContainer.id = "btnContainer";

	// document.getElementById("mapContainer").appendChild(btnContainer);
	document.getElementById("mapContainer").insertBefore(btnContainer, document.getElementById("map"));
	let followingButton = document.createElement('a');
	let followerButton = document.createElement('a');

	followingButton.href = "";
	followerButton.href = "";

	followingButton.textContent = 'View Following';
	followerButton.textContent = 'View Followers';

	followingButton.id = "followingBtn";
	followerButton.id = "followerBtn";

	followingButton.classList.add('btn');
	followingButton.classList.add('btn-space');
	followerButton.classList.add('btn');
	followerButton.classList.add('btn-space');

	followingButton.addEventListener('click', (e) => {
		e.preventDefault();
		getFollowing();
	})

	followerButton.addEventListener('click', (e) => {
		e.preventDefault();
		getFollowers();
	})

	btnContainer.appendChild(followingButton);
	btnContainer.appendChild(followerButton);
}

function loadScript() {
  let script = document.createElement('script');
  script.id = "map-script";
  script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBqxXFzcN7RF7voWzx5zE88QV3XQEB7bMo&callback=initMap";
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
}