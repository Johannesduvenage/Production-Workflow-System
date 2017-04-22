(function(){

	var todoModule = angular.module("AlphaApp");

	todoModule.component('todoComponent', {
		templateUrl: "views/todo/todo.html",
		controllerAs: "model",
		controller: function(){
			var model = this;
			model.dt = new Date();
			model.options = {
			    minDate: new Date(),
			    showWeeks: true
			  };
			model.$onInit = function(){
					console.log("Todo Component loaded");
			};
			model.today = function(){
				model.dt = new Date();
			}

			model.addTodo = function(e, text){
				console.log(text);
			}
		}
	});
}());