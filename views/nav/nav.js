(function(){
		
	var navModule = angular.module("AlphaApp");
	
	navModule.component("navComponent", {
		templateUrl: "views/nav/nav.html",
		controllerAs: "model",
		bindings: {
			getUser: "<",
			backtohome: "<"
		},
		controller: function(){
			var model = this;
			
			model.$onInit = function(){
				model.username = model.getUser;
				if(model.backtohome === undefined)
					model.backtohome = false;
			};
		}
	});
	
}());