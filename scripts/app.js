(function () {
	
	"use strict";
	// Initialize Firebase
	  var config = {
	    apiKey: "AIzaSyDV4Obu7YCbgiGVqH7yaUf_wcDXsxSuLRc",
	    authDomain: "alphaqa-4a235.firebaseapp.com",
	    databaseURL: "https://alphaqa-4a235.firebaseio.com",
	    storageBucket: "alphaqa-4a235.appspot.com",
	    messagingSenderId: "721486348017"
	  };
	  firebase.initializeApp(config);
	
	
	var app = angular.module("AlphaApp", ['ngRoute', 
								   'firebase', 
								   'ngAnimate', 
								   'ngSanitize', 
								   'ui.bootstrap', 
								   'datatables', 
								   'ng.deviceDetector',
								   'uiGmapgoogle-maps',
								   'cgBusy',
								   'ngFileUpload',
								   'ngStorage',
								   'ngColorThief',
								   'duScroll',
								  ]);
	
	
	app.run(function($rootScope, $location){
		$rootScope.$on("$routeChangeError", function(e, next, prev, err){
			if(err === "AUTH_REQUIRED")
				$location.path("/security/login");
		});
	});
	
	
	app.config(function ($routeProvider) {
		
		$routeProvider
			.when("/security/login", {
				template: "<login-component current-auth='$resolve.currentAuth'></login-component>",
				resolve: {
					currentAuth: function(auth){
						return auth.$waitForSignIn();
					}
				}
			})	
			.when("/security/register", {
				template: "<register-component current-auth='$resolve.currentAuth'></register-component>",
				resolve: {
					currentAuth: function(auth) {
						return auth.$waitForSignIn();
					}
				}
			})
			.when("/accounts/admin/dashboard", {
				template: "<admin-component uv-users='$resolve.getUnverifiedUsers' v-users='$resolve.getVerifiedUsers' device='$resolve.getDeviceTrackingDetails' company-info='$resolve.getCompanies' current-auth='$resolve.currentAuth' get-msgs-recieved='$resolve.getMessagesRecieved' get-msgs-sent='$resolve.getMessagesSent'></admin-component>",
				resolve: {
					currentAuth: function(auth){
						return auth.$requireSignIn();
					},
					getUnverifiedUsers: function(auth, DbReference, $firebaseArray){
						return auth.$requireSignIn().then(function(){
							return $firebaseArray(DbReference.getUnverifiedUsers()).$loaded();
						});
					},
					getVerifiedUsers: function(auth, DbReference, $firebaseArray){
						return auth.$requireSignIn().then(function(){
							return $firebaseArray(DbReference.getVerifiedUsers()).$loaded();
						});
					},
					getDeviceTrackingDetails: function(auth, DbReference, $firebaseArray) {
						return auth.$requireSignIn().then(function(){
							return $firebaseArray(DbReference.getDeviceLogs()).$loaded();
						});
					},
					getCompanies: function(auth, DbReference, $firebaseArray){
						return auth.$requireSignIn().then(function(){
							return $firebaseArray(DbReference.getCompany()).$loaded();
						});
					}
				}
			})
			.when("/accounts/client", {
				template: "<client-component get-client='$resolve.getUser' get-msgs-recieved='$resolve.getMessagesRecieved' get-companies='$resolve.getCompanies' get-files-client='$resolve.getFilesByClient' other-calc='$resolve.getCalculations' get-msgs-sent='$resolve.getMessagesSent' current-auth='$resolve.currentAuth'></client-component>",
				resolve: {
					currentAuth: function(auth){
						return auth.$requireSignIn();
					},
					getUser: function(auth, $firebaseObject, DbReference){
						return auth.$requireSignIn().then(function(){
								var uidKey = auth.$getAuth();
								return $firebaseObject(DbReference.getUser(uidKey.uid)).$loaded();
						});
					},
					getCompanies: function(auth, $firebaseArray, DbReference){
						return auth.$requireSignIn().then(function(){
							return $firebaseArray(DbReference.getCompany()).$loaded();
						});
					},
					getFilesByClient: function(auth, $firebaseArray, DbReference){
						return auth.$requireSignIn().then(function(){
							var uidKey = auth.$getAuth();
							return $firebaseArray(DbReference.getUser(uidKey.uid).child("files"));
						});
					},
					getCalculations: function(auth, DbReference, GetSize) {
						return auth.$requireSignIn().then(function(){
							var uidKey = auth.$getAuth();
							return GetSize(DbReference.getUser(uidKey.uid).child("files")).$loaded();
						});
					},
					getMessagesRecieved: function(auth, DbReference, $firebaseArray) {
						return auth.$requireSignIn().then(function(){
							var uidKey = auth.$getAuth();
							return $firebaseArray(DbReference.messageReference(uidKey.uid).child("recieved")).$loaded();
						});
					},
					getMessagesSent: function(auth, DbReference, $firebaseArray) {
						return auth.$requireSignIn().then(function(){
							var uidKey = auth.$getAuth();
							return $firebaseArray(DbReference.messageReference(uidKey.uid).child("sent")).$loaded();
						});
					}
				}
			})
			.when("/accounts/employee", {
				template: "<employee-dashboard get-emp='$resolve.getUser' get-files='$resolve.getFiles' current-auth='$resolve.currentAuth' get-msgs-recieved='$resolve.getMessagesRecieved' get-msgs-sent='$resolve.getMessagesSent'></employee-dashboard>",
				resolve: {
					currentAuth: function(auth){
						return auth.$requireSignIn();
					},
					getUser: function(auth, $firebaseObject, DbReference){
						return auth.$requireSignIn().then(function(){
								var uidKey = auth.$getAuth();
								return $firebaseObject(DbReference.getUser(uidKey.uid)).$loaded();
						});
					},
					getFiles: function(auth, $firebaseArray, $firebaseObject, DbReference) {
						return auth.$requireSignIn().then(function(){
							var uidKey = auth.$getAuth();
								return $firebaseObject(DbReference.getUser(uidKey.uid)).$loaded().then(function(response){
										return $firebaseArray(DbReference.getFilesEmployee(response.company, response.$id).orderByChild("assignedToEmployee").equalTo(response.$id)).$loaded();
								}); 
						});
					},
					getMessagesRecieved: function(auth, DbReference, $firebaseArray) {
						return auth.$requireSignIn().then(function(){
							var uidKey = auth.$getAuth();
							return $firebaseArray(DbReference.messageReference(uidKey.uid).child("recieved")).$loaded();
						});
					},
					getMessagesSent: function(auth, DbReference, $firebaseArray) {
						return auth.$requireSignIn().then(function(){
							var uidKey = auth.$getAuth();
							return $firebaseArray(DbReference.messageReference(uidKey.uid).child("sent")).$loaded();
						});
					}
				}
			})
			.when("/accounts/projectmanager", {
					template: "<project-manager current-auth='$resolve.currentAuth' get-pm='$resolve.getUser' get-msgs-recieved='$resolve.getMessagesRecieved' get-msgs-sent='$resolve.getMessagesSent'></project-manager>",
					resolve: {
						currentAuth: function(auth){
							return auth.$requireSignIn();
						},
						getUser: function(auth, $firebaseObject, DbReference){
							return auth.$requireSignIn().then(function(){
									var uidKey = auth.$getAuth();
									return $firebaseObject(DbReference.getUser(uidKey.uid)).$loaded();
							});
						},
						getMessagesRecieved: function(auth, DbReference, $firebaseArray) {
							return auth.$requireSignIn().then(function(){
								var uidKey = auth.$getAuth();
								return $firebaseArray(DbReference.messageReference(uidKey.uid).child("recieved")).$loaded();
							});
						},
						getMessagesSent: function(auth, DbReference, $firebaseArray) {
							return auth.$requireSignIn().then(function(){
								var uidKey = auth.$getAuth();
								return $firebaseArray(DbReference.messageReference(uidKey.uid).child("sent")).$loaded();
							});
						}
					}
			})
			.when("/accounts/profile", {
					template: "<profile-display current-auth='$resolve.currentAuth' get-user='$resolve.getUser'></profile-display>",
					resolve: {
						currentAuth: function(auth){
							return auth.$requireSignIn();
						},
						getUser: function(auth, $firebaseObject, DbReference){
							return auth.$requireSignIn().then(function(){
									var uidKey = auth.$getAuth();
									return $firebaseObject(DbReference.getUser(uidKey.uid)).$loaded();
							});
						}
					}
			})
			.when("/quality-check/:company/:clientid/:empid/:fid", {
				template: "<file-fetch current-auth='$resolve.currentAuth' get-user='$resolve.getUser'></file-fetch>",
				resolve: {
					currentAuth: function(auth){
						return auth.$requireSignIn();
					},
					getUser: function(auth, $firebaseObject, DbReference){
							return auth.$requireSignIn().then(function(){
									var uidKey = auth.$getAuth();
									return $firebaseObject(DbReference.getUser(uidKey.uid)).$loaded();
							});
						}
				}
			})
			.when("/security/logout", {
				template: "<logout></logout>"
			})
			.otherwise({redirectTo: "/security/login"});

			
	});
	
}());