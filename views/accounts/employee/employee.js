(function(){
		
		var EmployeeModule = angular.module("AlphaApp");

		EmployeeModule.component("employeeDashboard", {
			templateUrl: "views/accounts/employee/employee.html",
			controllerAs: "model",
			bindings: {
				currentAuth: "=",
				user: "=getEmp",
				files: "=getFiles",
				msgsRec: "=getMsgsRecieved",
				msgsSent: "=getMsgsSent"
			},
			controller: function($sessionStorage, $firebaseArray, $location, DTOptionsBuilder, $scope){
				var model = this;
				model.completed = 0;
				model.notcompleted = 0;

				model.$onInit = function(){
					if(model.user.role !== "EMPLOYEE")
						$location.path("/security/login");
					else
					{
						if($sessionStorage.currentTab)
							model.active = $sessionStorage.currentTab;
						else
							model.active = 0;

						model.dtOptionsFiles = DTOptionsBuilder.newOptions() .withOption('order', [2, 'desc']);
						model.dtFiles = {};
					}
					model.calc();
					model.date = Date.now() + 86400000;
				};
				model.calc = function(){
					model.completed = 0;
					model.notcompleted = 0;
					model.date = Date.now() + 86400000;
					for(var i=0;i<model.files.length;i++){
						if(model.files[i].total === model.files[i].progress)
							model.completed++;
						else
							model.notcompleted++;
					}
				};
				model.setActiveTab = function(index){
					model.active = index;
					$sessionStorage.currentTab = index;
					model.date = Date.now() + 86400000;
				};

				model.viewFileData = function(file) {
					$location.path("/quality-check/" + file.assignedToCompany + "/" + file.clientUID + "/" + file.assignedToEmployee + "/" + file.$id);
				};
			}
		});

}());