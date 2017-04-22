(function (){

	var authModule = angular.module("AlphaApp");
	
	authModule.factory("auth", function($firebaseAuth, rootRef){
		return $firebaseAuth();
	});
}());