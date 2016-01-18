var x = document.getElementById("Main");
var current_loc_marker;
var map;

//Function that starts the application
function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
	} else { 
		x.innerHTML = "Geolocation is not supported by this browser.";
	}
}

//Add the custom "Current Location" button onto the map
function addYourLocationButton (map, marker) 
{
    var controlDiv = document.createElement('div');

    var firstChild = document.createElement('button');
    firstChild.style.backgroundColor = '#fff';
    firstChild.style.border = 'none';
    firstChild.style.outline = 'none';
    firstChild.style.width = '28px';
    firstChild.style.height = '28px';
    firstChild.style.borderRadius = '2px';
    firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    firstChild.style.cursor = 'pointer';
    firstChild.style.marginRight = '10px';
    firstChild.style.padding = '0';
    firstChild.title = 'Your Location';
    controlDiv.appendChild(firstChild);

    var secondChild = document.createElement('div');
    secondChild.style.margin = '5px';
    secondChild.style.width = '18px';
    secondChild.style.height = '18px';
    secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png)';
    secondChild.style.backgroundSize = '180px 18px';
    secondChild.style.backgroundPosition = '0 0';
    secondChild.style.backgroundRepeat = 'no-repeat';
    firstChild.appendChild(secondChild);

    google.maps.event.addListener(map, 'center_changed', function () {
        secondChild.style['background-position'] = '0 0';
    });

    firstChild.addEventListener('click', function () {
        var imgX = '0',
            animationInterval = setInterval(function () {
                imgX = imgX === '-18' ? '0' : '-18';
                secondChild.style['background-position'] = imgX+'px 0';
            }, 500);

        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                map.setCenter(latlng);
                changeMarkerPosition(current_loc_marker, position.coords.latitude, position.coords.longitude);
                clearInterval(animationInterval);
                secondChild.style['background-position'] = '-144px 0';
            });
        } else {
            clearInterval(animationInterval);
            secondChild.style['background-position'] = '0 0';
        }
    });

    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
}

function addInfoWindowListernerToMarker(my_marker){
	google.maps.event.addListener(my_marker, 'click', function(event){
			var info_body = "<b>"+this.title + " (" + this.type + ")</b><br>" + this.details + "<br><b>" + this.url + "</b>";
			var infoWindow = new google.maps.InfoWindow({
				content: info_body,
			});
			infoWindow.open(map,this);
	});
}

function changeMarkerPosition(my_marker, new_lat, new_lon){
	my_marker.setPosition(new google.maps.LatLng(new_lat, new_lon));
}

//Main function that creates the map, connects to Firebase and adds the markers
function showPosition(position){
	
	var latlong ; //= new google.maps.LatLng(position.coords.latitude, position.coords.longitude);	
	var browser_url = window.location.href;

	if (browser_url.indexOf("debug") != -1){
		console.log(browser_url);
		latlong = new google.maps.LatLng("1.290018", "103.804586"); //Random Singapore position to test when I'm not there
	}else{ 
		latlong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	}

	var mapProp;
	mapProp = {
		center:latlong, 
		zoom:15,
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById("mapholder"),mapProp);
	
	//Push the Legend Div to the bottom right and then add content to it
	map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(document.getElementById('legend'));

	var legend = document.getElementById('legend');

	var div_PlayArea = document.createElement('div');
	div_PlayArea.innerHTML = "<img src='http://maps.google.com/mapfiles/ms/icons/blue-dot.png'>" + "Play";
	legend.appendChild(div_PlayArea);

	var div_NursingArea = document.createElement('div');
	div_NursingArea.innerHTML = "<img src='http://maps.google.com/mapfiles/ms/icons/pink-dot.png'>" + "Nursing";
	legend.appendChild(div_NursingArea);

	var div_FoodAndPlayArea = document.createElement('div');
	div_FoodAndPlayArea.innerHTML = "<img src='http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'>" + "Food And Play";
	legend.appendChild(div_FoodAndPlayArea);

	var div_GeneralArea = document.createElement('div');
	div_GeneralArea.innerHTML = "<img src='http://maps.google.com/mapfiles/ms/icons/red-dot.png'>" + "Other";
	legend.appendChild(div_GeneralArea);


	//Create a marker in green to show the current location
	current_loc_marker = new google.maps.Marker({
			position:latlong,
			map: map,
			icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
		});

	google.maps.event.addListener(current_loc_marker, 'click', function(event){
			var info_body = "<b>Current Location</b>";
			var infoWindow = new google.maps.InfoWindow({
				content: info_body,
			});
			infoWindow.open(map,this);
		});

	addYourLocationButton(map, current_loc_marker);

	//Create Firebase reference
	var myDataRef = new Firebase('https://fiery-fire-3697.firebaseio.com/');

	//Wait to get data from firebase and then create markers for all the locations
	//as the events come from Firebase
	myDataRef.on('child_added', function(snapshot) {
    var message = snapshot.val();
    //console.log(message.name + " |  " + message.details + " | " + message.type + " | " + message.lat + " | " + message.lon);

    var outletLoc = new google.maps.LatLng(message.lat, message.lon);
    var icon_type = "";
    var location_type = "";

    if (message.type == "Nursing"){
    	icon_type = "http://maps.google.com/mapfiles/ms/icons/pink-dot.png";
    	location_type = "Nursing Area";
    } else if (message.type == "Play"){
			icon_type = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
			location_type = "Play Area";
    } else if (message.type == "Food and Play"){
    	icon_type = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
			location_type = "Food And Play Area";
    } else {
    	icon_type = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    	location_type = message.type;
    }
    
		var marker = new google.maps.Marker({
			position:outletLoc,
			map: map,
			title: message.name,
			details: message.details,
			url: message.url,
			type: location_type,
			icon: icon_type,
		});

		addInfoWindowListernerToMarker(marker);

  });
}
