(function(){
	
	var logOutModule = angular.module("AlphaApp");
	
	logOutModule.component("logout", {
		controller: function(auth, $timeout, $location, $sessionStorage, $localStorage){
			auth.$signOut();
			$sessionStorage.$reset();
			$localStorage.$reset();
			
			$timeout(function(){
				$location.path("/security/login");
			}, 500);	
		}
	});
	
}());