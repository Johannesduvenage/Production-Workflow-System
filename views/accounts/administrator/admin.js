(function(){

	var adminModule = angular.module("AlphaApp");
	
	adminModule.component("adminComponent", {
		
		templateUrl: "views/accounts/administrator/admin.html",
		bindings: {
			currentAuth: "=",
			uvUsers: "=",
			vUsers: "=",
			device: "=",
			companies: "=companyInfo"
		},
		controllerAs: "model",
		controller: function($location, rootRef, $timeout, DbReference, DTOptionsBuilder, $sessionStorage, $firebaseArray){
			var model = this;
			
			model.getFiles = function()
			{
					model.uncompletedFiles = [];
					model.assignedFiles = [];
					model.completedFiles = [];

					for(var i=0;i<model.companies.length;i++)
					{
							model.uncompletedPromise = $firebaseArray(DbReference.getCompanyByName(model.companies[i].$id).child("files").child("uncompleted")).$loaded();

											model.uncompletedPromise.then(function(uncompletedFiles){
												for(var j=0;j<uncompletedFiles.length;j++)
													model.uncompletedFiles.push(uncompletedFiles[j]);
											});

							model.assignedPromise = $firebaseArray(DbReference.getCompanyByName(model.companies[i].$id).child("files").child("assigned")).$loaded();

											model.assignedPromise.then(function(assignedFiles){
													for(var j=0;j<assignedFiles.length;j++)
														model.assignedFiles.push(assignedFiles[j]);
											});

							model.completedPromise = $firebaseArray(DbReference.getCompanyByName(model.companies[i].$id).child("files").child("completed")).$loaded();

											model.completedPromise.then(function(completedFiles){
													for(var j=0;j<completedFiles.length;j++)
														model.completedFiles.push(completedFiles[j]);
											});

					}
			};

			model.$onInit = function(){
				if(model.currentAuth)
					if(model.currentAuth.email !== "admin@alpha.com")
						$location.path("/security/login");
					else {
						if($sessionStorage.currentTab)
							model.active = $sessionStorage.currentTab;
						else
							model.active = 0;
					}

				model.dtInstanceVUsers = {};
				model.dtInstanceUnUsers = {};
				model.dtInstanceFiles = {};
				model.dtOptionsTracking = DTOptionsBuilder.newOptions() .withOption('order', [6, 'desc']);
				model.dtOptionsVUsers = DTOptionsBuilder.newOptions() .withOption('order', [6, 'desc']);
				model.dtOptionsUnUsers = DTOptionsBuilder.newOptions() .withOption('order', [5, 'desc']);
				model.dtOptionsFiles = DTOptionsBuilder.newOptions() .withOption('order', [3, 'desc']);
				model.getFiles();
			};

			model.setActiveTab = function(index){
				model.active = index;
				$sessionStorage.currentTab = index;
				model.date = Date.now() + 86400000;
			};

			model.verify = function(user){
				var userInfo = {
					company: user.company,
					contact: user.contact,
					eCode: user.eCode,
					email: user.email,
					name: user.name,
					password: user.pass,
					role: user.role,
					timestampReg: user.timestamp,
					timestampVer: Date.now(),
					uidKey: user.uidKey,
					verificationStatus: true
				}
				var ref = rootRef;
				ref.child("users/" + user.uidKey).set(userInfo);
				
				model.uvUsers.$remove(user).then(function(ref){
					
					model.dtInstanceUnUsers.rerender();
					if(user.role === "EMPLOYEE" || user.role === "PROJECT MANAGER")
					{
						var companyRef = DbReference.getCompany();
						companyRef.child(user.company).once("value", function(snapshot){
								if(!snapshot.exists()){
									companyRef.child(user.company).set({
										rating: "Not Rated",
										numberEmployees: 1,
										filesCompleted: 0,
										filesUncompleted: 0
									});
								}
								else if(snapshot.exists())
								{
									var numberofemployees = snapshot.val().numberEmployees + 1;
									companyRef.child(user.company).child("numberEmployees").set(numberofemployees);
								}

								if(user.role === "EMPLOYEE")
									companyRef.child(user.company).child("employees").push({
										uidKey: user.uidKey,
										name: user.name,
										email: user.email,
										ecode: user.eCode
									});
								else if(user.role === "PROJECT MANAGER")
									companyRef.child(user.company).child("projectmanagers").push({
										uidKey: user.uidKey,
										name: user.name,
										email: user.email,
										ecode: user.eCode
									});
							
						});
					}
				});
				
				
				
			};
			model.remove = function(user){
				model.uvUsers.$remove(user).then(function(ref){
					model.dtInstanceUnUsers.rerender();
				});
			};
			
			model.removeVerified = function(user){

				model.vUsers.$remove(user).then(function(ref){
					console.log("After DB");
					console.log(model.vUsers);
					model.dtInstanceVUsers.rerender();
				});

			};
			
			model.renderMap = function(log, geolocation){
				
				model.userTracked = log;
				// Getting lattitude and longitude
				
				var lats = geolocation.loc.split(',')[0];
				var long = geolocation.loc.split(',')[1];
				
				var mapOptions = {
				    center: new google.maps.LatLng(lats, long),
				    zoom: 15,
				    mapTypeId: google.maps.MapTypeId.ROADMAP,
					title: "User was tracked here!",
					visible:true,
					icon:'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
				  };
				
				var map = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions);
				var marker = new google.maps.Marker({
					map: map,
				    position: new google.maps.LatLng(lats, long)
				  });
				
				marker.setMap(map);
				
				var mapModalReference = angular.element("#mapModal");
				mapModalReference.modal("show");
				
				map.setCenter(new google.maps.LatLng(lats, long))
				$timeout(function(){
					 google.maps.event.trigger(map, "resize");
					 map.setCenter(new google.maps.LatLng(lats, long))
				}, 500);
			};
			
		}
		
	});

}());