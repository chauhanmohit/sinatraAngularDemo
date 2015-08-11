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
                $scope.getDataFromApi($scope.limit) ;
            });
        }
                
        $scope.getDataFromApi = function(limit){
	    if (!limit) {
		limit = 100 ;
	    }
	    $scope.showLoder = true ;
            $http.get('/showData?lat='+$scope.location.latitude+'&lang='+$scope.location.longitude+'&limit='+limit)
	   // $http.get('https://data.cityofchicago.org/resource/6zsd-86xi.json')
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
	    $http.get('/showData?lat=41.883811&lang=-87.631749&limit='+limit)
	    .success(function(res,status,config,header){
                console.log("Data comes in success section");
                $scope.shortlistedData = res ;
		$scope.showLoder = false ;
            }).error(function(err,status,config,header){
                console.log("Error comes in this section");
            });
	}
}]);
