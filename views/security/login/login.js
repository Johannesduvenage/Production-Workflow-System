(function(){
	
	"use strict";
	
	var loginModule = angular.module("AlphaApp");
	
	
	
	loginModule.component("loginComponent", {
		templateUrl: "views/security/login/login.html",
		bindings: {
			currentAuth: "="
		},
		controllerAs: "model",
		controller: function(auth, $location, DbReference, $firebaseArray, $firebaseObject, $http){
			var model = this;
			var ref = null;
			model.header = "Login!";
			model.$onInit = function(){
				model.login = false;
				
				model.getTrackingDetails();
				
				if(model.currentAuth)
				{
					if(model.currentAuth.email === "admin@alpha.com") {
						$location.path("/accounts/admin/dashboard");
					}
					else
					{
						var userObject = $firebaseObject(DbReference.getUser(model.currentAuth.uid));
						userObject.$loaded().then(function(){
							if(userObject.role === "CLIENT")
								$location.path("/accounts/client");
							else if(userObject.role === "PROJECT MANAGER")
								$location.path("/accounts/projectmanager");
							else if(userObject.role === "EMPLOYEE")
								$location.path("/accounts/employee");
							
						}).catch(function(err){
							console.log("Failed in prefetching user");
						});
					}
				}
			};
			
			model.getTrackingDetails = function(){
				$http.get("https://ipv4.myexternalip.com/json").then(function(response){
					$http.get("https://ipinfo.io/" + response.data.ip ).then(function(response){
						model.geoTrack = response.data;
					});
				});
			};
			
			model.signIn = function(){
					model.login = true;
					auth.$signInWithEmailAndPassword(model.username, model.password).then(function(firebaseUser){
						
						
						if(firebaseUser.email === "admin@alpha.com")
						{
							$location.path("/accounts/admin/dashboard");
						}
						else
						{
							var ref = DbReference.getVerifiedUsers();
							ref.child(firebaseUser.uid).once('value', function(snapshot) {
								if(snapshot.exists())
								{
									var details = DbReference.getDeviceDetails(); //to get the device details
									var logsObject = $firebaseArray(DbReference.getDeviceLogs());
									logsObject.$add({
										os : details.os,
										browser: details.browser,
										device: details.device,
										os_version: details.os_version,
										login_time: Date.now(),
										user: firebaseUser.uid,
										geo: model.geoTrack
									}).then(function(){
										var checkUser = $firebaseObject(ref.child(firebaseUser.uid));
										
										checkUser.$loaded().then(function(){
											
											$.notify({
												 icon: 'glyphicon glyphicon-user',
												 title: 'Welcome',
												 message: 'It\'s so good to have you back here!'
											},{
											   type: "success",
											   z_index: 1031,
											   delay: 800,
											   timer: 800,
											   animate: {
												  enter: 'animated fadeInUp',
												  exit: 'animated fadeOutUp'
											   },

											});
											
											if(checkUser.role === 'CLIENT')
												$location.path("/accounts/client");
											else if(checkUser.role === 'EMPLOYEE')
												$location.path("/accounts/employee");
											else if(checkUser.role === 'PROJECT MANAGER')
												$location.path("/accounts/projectmanager");
										}).catch(function(err){
												console.log("Detecting role of user failed.");
										});
									}).catch(function(err){
										console.log("Device Tracking Error");
									});
									
								}
								else
								{
									$.notify({
											 icon: 'glyphicon glyphicon-remove',
											 title: 'Oops!',
											 message: 'You\'re still not verified. Please wait.'
									    },{
										   type: "warning",
										   z_index: 1031,
										   delay: 1000,
										   timer: 4000,
										   animate: {
											  exit: 'animated fadeOutUp'
										   },

									    });
								}
							});
						}

					  }).catch(function(error){
						model.login = false;
						 model.forget = true;
						 $.notify({
									 icon: 'glyphicon glyphicon-remove',
									 title: 'Oops!',
									 message: 'Authentication failed!'
							    },{
								   type: "danger",
								   z_index: 1031,
								   delay: 1000,
								   timer: 1000,
								   animate: {
									  enter: 'animated shake',
									  exit: 'animated fadeOutUp'
								   },

							    });
					  });
			};
		}
	});
	
}());