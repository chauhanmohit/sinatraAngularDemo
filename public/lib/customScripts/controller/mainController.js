'use strict'
app.controller('mainController',['$scope','MapService','$http',function($scope,MapService,$http){
    $scope.location = {} ;
    $scope.newPlaceAddress = "Chicago" ;
    $scope.location.latitude = 41.8838113 ;
    $scope.location.longitude = -87.6317489;
    $scope.limit = 100 ;
    $scope.showLoder = false ;
    $scope.dynMarkers = [];
     
    $scope.$on('mapInitialized', function(event, map) {
	var marker ;
	var infowindow ;
	var minZoomLevel = 10;
	getData($scope.limit,map);

  
	$scope.getAddress = function(){
            var address = $scope.newPlaceAddress ? $scope.newPlaceAddress : "Chicago" ;
            MapService.geocodeAddress(address).then(function (location) {
                var pos = {"latitude":location.G,"longitude":location.K} ;
                $scope.location = pos ;
                $scope.getDataFromApi($scope.location.latitude,$scope.location.longitude,$scope.limit) ;
            });
        }
	var allowedBounds = [
		    {lat:42.0203316, lng:-87.6658357},
		    {lat:41.979963, lng:-87.9396229},
		    {lat:41.7843619, lng:-87.8011017},
		    {lat:41.6858761, lng:-87.7396083},
		    {lat:41.6466334, lng:-87.5283502},
		    {lat:41.8954732, lng:-87.6079243},
		    ] ;
		
	var bermudaTriangle = new google.maps.Polygon({
	    paths: allowedBounds,
	    strokeColor: '#FF0000',
	    strokeOpacity: 0.3,
	    strokeWeight: 2,
	    fillColor: '#FF0000',
	    fillOpacity: 0.15
	});
	bermudaTriangle.setMap(map)
	
	google.maps.event.addListener(map, "dragend", function() {
	    //boundryLimit(map);
	    var zoomLevel = map.getZoom();
	    var bounds = map.getBounds();
	    var ne = bounds.getNorthEast();
	    var sw = bounds.getSouthWest();
	    var d = getDistance(map.center, ne);
	    var loc = map.center ;	
	    $scope.location.latitude = loc.G;
	    $scope.location.longitude = loc.K;
	    $scope.limit = d ;
	    getData($scope.limit,map) ;
	});
	
	google.maps.event.addListener(map, 'zoom_changed', function() {
	    var zoomLevel = map.getZoom();
	    if (zoomLevel < minZoomLevel) map.setZoom(minZoomLevel);
	    var bounds = map.getBounds();
	    var ne = bounds.getNorthEast();
	    var sw = bounds.getSouthWest();
	    var d = getDistance(map.center, ne);
	    var loc = map.center ;	
	    if(zoomLevel) {
		$scope.location.latitude = loc.G;
		$scope.location.longitude = loc.K;
		$scope.limit = d ;
		getData($scope.limit,map) ;
	    }
	});

	var boundryLimit = function(){
	    var allowedBounds = new google.maps.LatLngBounds(
		    new google.maps.LatLng(41.8985364, -87.7919738),
		    new google.maps.LatLng(42.0230494, -87.7957267),
		    new google.maps.LatLng(42.0205603, -87.6951688),
		    new google.maps.LatLng(41.6480887, -87.5369138)
		) ;
	    if (allowedBounds.contains(map.getCenter())) return;
	    var c = map.getCenter(),
		x = c.lng(),
		y = c.lat(),
		maxX = allowedBounds.getNorthEast().lng(),
		maxY = allowedBounds.getNorthEast().lat(),
		minX = allowedBounds.getSouthWest().lng(),
		minY = allowedBounds.getSouthWest().lat();
       
	    if (x < minX) x = minX;
	    if (x > maxX) x = maxX;
	    if (y < minY) y = minY;
	    if (y > maxY) y = maxY;
       
	    map.setCenter(new google.maps.LatLng(y, x));
	}
	
	var rad = function(x) {
		return x * Math.PI / 180;
	};

	var getDistance = function(p1, p2) {
		var R = 6378137; // Earth?s mean radius in meter
		var dLat = rad(p2.G - p1.G);
		var dLong = rad(p2.K - p1.K);
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
			Math.sin(dLong / 2) * Math.sin(dLong / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = (R * c) ;
		return d; // returns the distance in meters
	}
	
		
	
    });
    

	
    function getData(limit,evtmap){
	if (!limit) {
	    limit = 100
	}
	var map = evtmap ;
	$scope.showLoder = true ;
	$http.get('/showData?lat='+$scope.location.latitude+'&lang='+$scope.location.longitude+'&limit='+limit)
	.success(function(res,status,config,header){
	    //console.log("the data is as follows", res, res.length);
	    //$scope.shortlistedData = res ;
	    for(var i=0; i<res.length; i++){
		var latLng = new google.maps.LatLng(res[i].latitude, res[i].longitude);
		var image = res[i].primary_type == 'ASSAULT' ? 'img/matrimonial.png' : res[i].primary_type == 'NARCOTICS' ? 'img/medical.png' : res[i].primary_type == 'BATTERY' ? 'img/local-services.png' : 'img/saloon.png' ;
		var marker = new google.maps.Marker({
				        map:map,
					position:latLng,
					icon: image,
					}) ;
		var infowindow = new google.maps.InfoWindow(); 
		bindInfoWindow(marker, map,infowindow, res[i]);
		$scope.dynMarkers.push(marker);
	    }
	    $scope.markerClusterer = new MarkerClusterer(map, $scope.dynMarkers, {});
	    $scope.showLoder = false ;
	}).error(function(err,status,config,header){
	    console.log("Error comes in this section");
	});
    }

    function bindInfoWindow(marker, map, infowindow, content) {
	google.maps.event.addListener(marker, 'click', function(e) {
	    var data = getContent(content);
	    infowindow.close();
	    infowindow.setContent(data);
	    infowindow.open(map, marker);
	});
    }
    
    function getContent(data) {
	var infoData = '<div class="CustomData">'+
                                '<div class="row">'+
                                    '<div class="col-sm-6"><strong>Arrest</strong>:</div>'+
                                    '<div class="col-sm-3">'+ data.arrest + '</div>'+
                                '</div>' +
                                '<div class="row">'+
                                    '<div class="col-sm-6"><strong>Beat</strong>:</div>'+
                                    '<div class="col-sm-3">'+ data.beat + '</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-sm-6"><strong>Case Number</strong>:</div>'+
                                    '<div class="col-sm-3">'+ data.case_number + '</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-sm-6"><strong>Date</strong>:</div>'+
                                    '<div class="col-sm-3">'+ data.date + '</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-sm-6"><strong>Description</strong>:</div>'+
                                    '<div class="col-sm-3">'+ data.description + '</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-sm-6"><strong>Domestic</strong>:</div>'+
                                    '<div class="col-sm-3">'+ data.domestic + '</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-sm-6"><strong>Fbi Code</strong>:</div>'+
                                    '<div class="col-sm-3">'+ data.fbi_code + '</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-sm-6"><strong>Description</strong>:</div>'+
                                    '<div class="col-sm-3">'+ data.description + '</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-sm-6"><strong>Primary Type</strong>:</div>'+
                                    '<div class="col-sm-3">'+ data.primary_type + '</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<div class="col-sm-6"><strong>Year</strong>:</div>'+
                                    '<div class="col-sm-3">'+ data.arrest + '</div>'+
                                '</div>'+
                            '</div>';
	return infoData ;
    }
    
}]);
