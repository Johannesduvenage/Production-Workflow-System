(function(){
	
	var authFirebase = angular.module("AlphaApp");
	
	authFirebase.factory("rootRef", function() {
		return firebase.database().ref();
	});
	
}());