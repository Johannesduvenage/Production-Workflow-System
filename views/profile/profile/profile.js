(function(){

	"use strict";

	var profileModule = angular.module("AlphaApp");

	profileModule.component("profileDisplay", {
		templateUrl: "views/profile/profile/profile.html",
		controllerAs: "model",
		bindings: {
			currentAuth: "=",
			user: "=getUser"
		},
		controller: function(){
			var model = this;

			model.$onInit = function(){
				console.log(model.user);
			};
		}
	});

}());