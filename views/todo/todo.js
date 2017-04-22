(function(){

	var todoModule = angular.module("AlphaApp");

	todoModule.component('todoComponent', {
		templateUrl: "views/todo/todo.html",
		controllerAs: "model",
		controller: function($localStorage){
			var model = this;
			model.dt = new Date();
			model.options = {
			    minDate: new Date(),
			    showWeeks: true
			  };

			model.todos = [];
			model.$onInit = function(){
					if($localStorage.todo){
						model.todos = $localStorage.todo;
					}
			};
			model.today = function(){
				model.dt = new Date();
			}

			model.addTodo = function(e, text){
				if(event.keyCode == 13){
					model.todos.push({title: text, status: false}); 
					$localStorage.todo = model.todos;
					model.newTodo = null;
				}
			}
			model.removeTodo = function(i){
				model.todos.splice(i, 1);
				$localStorage.todo = model.todos;
			}
			model.toggleCompleted = function(s, i){
				model.todos[i].status = !s;
				$localStorage.todo = model.todos;
			}
		}
	});
}());