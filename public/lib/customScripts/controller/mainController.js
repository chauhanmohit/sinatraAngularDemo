'use strict'
app.controller('mainController',['$scope','MapService','$http',function($scope,MapService,$http){
    $scope.location = {} ;
	$scope.newPlaceAddress = "Chicago" ;
	$scope.location.latitude = 41.8838113 ;
	$scope.location.longitude = -87.6317489;
	$scope.limit = 100 ;
	$scope.showLoder = false ;
	
	getData($scope.limit);
        if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
                        console.log(position.coords);
			$scope.location= position.coords;
		});
	}
        
        $scope.getAddress = function(){
            var address = $scope.newPlaceAddress ? $scope.newPlaceAddress : "Chicago" ;
            MapService.geocodeAddress(address).then(function (location) {
                var pos = {"latitude":location.G,"longitude":location.K} ;
                $scope.location = pos ;
                $scope.getDataFromApi($scope.location.latitude,$scope.location.longitude,$scope.limit) ;
            });
        }
                
        $scope.getDataFromApi = function(lat,lang,limit){
	    if (!limit) {
		limit = 100 ;
	    }
	    $scope.showLoder = true ;
            $http.get('/showData?lat='+lat+'&lang='+lang+'&limit='+limit)
            .success(function(res,status,config,header){
                console.log("Data comes in success section");
                $scope.shortlistedData = res ;
		$scope.showLoder = false ;
            }).error(function(err,status,config,header){
                console.log("Error comes in this section");
            });
        }
        
        $scope.showInfo = function(evt, id , loc){
            $scope.des = loc ;
            $scope.showInfoWindow.apply(this, [evt, 'foo']);
        }
	
	function getData(limit){
	    if (!limit) {
		limit = 100
	    }
	    $scope.showLoder = true ;
	    $http.get('/showData?lat='+$scope.location.latitude+'&lang='+$scope.location.longitude+'&limit='+limit)
	    .success(function(res,status,config,header){
                console.log("Data comes in success section");
                $scope.shortlistedData = res ;
		$scope.showLoder = false ;
            }).error(function(err,status,config,header){
                console.log("Error comes in this section");
            });
	}
	
	$scope.$on('mapInitialized', function(event, map) {

		 google.maps.event.addListener(map, "dragend", function() {
		 	var zoomLevel = map.getZoom();
		 	var bounds = map.getBounds();
		 	var ne = bounds.getNorthEast();
		 	var sw = bounds.getSouthWest();
		 	var d = getDistance(map.center, ne);
			var loc = map.center ;	
			$scope.location.latitude = loc.G;
			$scope.location.longitude = loc.K;
			$scope.limit = d ;
			console.log(map.center, ne);
			$scope.getDataFromApi($scope.location.latitude,$scope.location.longitude,$scope.limit) ;
		});

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
			console.log(p1.lat(), p2.lat());
			return d; // returns the distance in meters
		}

	});
}]);
