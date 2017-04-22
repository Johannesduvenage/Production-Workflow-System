(function () {
	
	"use strict";
	
	var registerModule = angular.module("AlphaApp");
	
	registerModule.component("registerComponent", {
		
		templateUrl: "views/security/register/register.html",
		controllerAs: "model",
		bindings: {
			currentAuth: "="
		},
		controller: function (DbReference, $firebaseArray, $location, auth, $http) {
			
			var model = this;
			
			model.header = "Register!";
			
			model.$onInit = function(){
				
					if(model.currentAuth){
						if(model.currentAuth.email === "admin@alpha.com"){
							$location.path("/accounts/admin/dashboard");
						}
					}
					model.registering = false;
			};
			model.signUp = function(){
				
					model.registering = true;
					var userAdd = $firebaseArray(DbReference.getUnverifiedUsers());
				
					auth.$createUserWithEmailAndPassword(model.username, model.password).then(function(firebaseUser){
						
							userAdd.$add({
										uidKey: firebaseUser.uid,
										name: model.namePerson.toUpperCase(),
										email: model.username,
										company: model.companyname.toUpperCase(),
										pass: model.password,
										contact: model.contact,
										role: model.role.toUpperCase(),
										eCode: model.eCode.toUpperCase(),
										verificationStatus: false,
										timestamp: Date.now()
							}).then(function(ref){
								
							    $.notify({
											   icon: 'glyphicon glyphicon-envelope',
											   title: 'Congratulations',
											   message: 'You\'ve successfully registered. We will contact you in a short while'
										 },{
											type: "success",
											z_index: 1031,
											delay: 5000,
											timer: 2000,
											placement: {
											    from: "top",
											    align: "right"
											},
											animate: {
											    enter: 'animated rubberBand',
											    exit: 'animated fadeOutUp'
											},

								   });
								
					 		$location.path("/security/login.html");
						 });
						
					
					}).catch(function(error){
						model.registering = false;
						if(error.code === "auth/email-already-in-use"){
							$.notify({
											   icon: 'glyphicon glyphicon-warning',
											   title: 'Error',
											   message: 'Your email address is already registered.'
										 },{
											type: "danger",
											z_index: 1031,
											delay: 5000,
											timer: 2000,
											placement: {
											    from: "top",
											    align: "right"
											},
											animate: {
											    enter: 'animated rubberBand',
											    exit: 'animated fadeOutUp'
											},

								   });
						}
					});
			};


			model.getRules = function(){
					var uploadModalRef = $('[data-remodal-id=modal]').remodal({hashTracking: false});
					uploadModalRef.open();
			};
		}
		
	});
	
}());