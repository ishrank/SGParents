var firebaseRef; 

function createFirebaseRef(firebaseURL){
	firebaseRef = new Firebase(firebaseURL);
	return firebaseRef;
}

function writeContent(){
	var cur_loc = navigator.geolocation.getCurrentPosition(position);
}

function position(currentPosition){
	var lat = currentPosition.coords.latitude;
	var lon = currentPosition.coords.longitude;
	var author = document.getElementById("author").value;
	var contents = document.getElementById("contents").value;

	writeToFirebase(author, contents, lat, lon, Date());
}

function writeToFirebase(author, content, lat, lon, cur_date){
	//console.log(author + " " + contents + " " + lat + " " + lon + " " + cur_date);
	var firebaseMessages = firebaseRef.child("Messages");

	var jsonData = {};
	jsonData["author"] = author;
	jsonData["lat"] = lat;
	jsonData["lon"] = lon;
	jsonData["content"] = content;
	jsonData["timestamp"] = cur_date;

	console.log(jsonData);
	firebaseMessages.push(jsonData);
}

function readContents(){
	var firebaseMessages = firebaseRef.child("Messages");
	firebaseMessages.once("value", function(snapShotData){
		snapShotData.forEach(function (data){
			console.log(data.val().author);
		});
	});
}

function calculateDistance(){
	var cur_loc = navigator.geolocation.getCurrentPosition(returnCurrentPosition);
}

function returnCurrentPosition(position){
	var result = getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude, "1.290018", "103.804586");
	document.getElementById("distance").value = result;
	console.log(result);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
  Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
  Math.sin(dLon/2) * Math.sin(dLon/2)
  ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
	return deg * (Math.PI/180);
}