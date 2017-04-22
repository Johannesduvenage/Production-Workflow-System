(function(){
	
	"use strict";

	var MessageModule = angular.module("AlphaApp");

	MessageModule.component("messageComponent", {
			templateUrl: "views/messages/message-component.html",
			controllerAs: "model",
			bindings: {
				user: "=",
				recieved: "=msgsRecieved",
				sent: "=msgsSent"
			},
			controller: function($sessionStorage, $firebaseArray, DbReference, $http, DTOptionsBuilder){
				var model = this;

				model.$onInit = function(){
					model.getUsersList();
					model.dtOptions = DTOptionsBuilder.newOptions() .withOption('order', [2, 'asc']);
				};


				model.getUsersList = function(){
					model.loadUsers = $firebaseArray(DbReference.getVerifiedUsers());

					model.loadUsers.$loaded().then(function(){
						model.usersLoad = [];
						for(var i=0;i<model.loadUsers.length;i++)
						{
							if(model.loadUsers[i].email !== model.user.email)
								model.usersLoad.push(model.loadUsers[i].email);
						}

						$sessionStorage.usersEmail = model.usersLoad;
					});
				};

				model.checkUser = function(useremail){
					if(useremail)
					{
						for(var i=0;i<model.usersLoad.length;i++)
						{
							if(useremail === model.usersLoad[i])
							{
								model.userFlag = true;
								break;
							}
							else
								model.userFlag = false;
						}
					}
					else
						model.userFlag = false;
				};
				model.composeMail = function(){

					var options = {
						hashTracking: false, 
						closeOnOutsideClick: false,
						closeOnEscape: false,
						closeOnCancel: false
					};
					model.composeMailModalRef = $('[data-remodal-id=composeMailModal]').remodal(options);
					model.composeMailModalRef.open();

					model.usersLoad = $sessionStorage.usersEmail;
				};

				model.discard = function(){
					document.getElementById("composeForm").reset();
					model.recipientName = "";
					model.subject = "";
					model.message = "";
					model.userFlag = false;
					model.composeMailModalRef.close();
				};

				model.sendMessage = function(){
						$http({
						    url: "PHPScripts/sentiment_load.php", 
						    method: "GET",
						    params: {text: model.message}
						 }).then(function(rating){
						 		rating = rating.data;
						 		//getting the uid of recipient
								var recipientUID = null;
								for(var j=0;j<model.loadUsers.length;j++)
									if(model.loadUsers[j].email === model.recipientName)
										recipientUID = model.loadUsers[j].uidKey;


								//sending message and storing it in /messages/senderuid/sent
									var messageSendingRef = $firebaseArray(DbReference.messageReference(model.user.uidKey).child("sent"));
									messageSendingRef.$add({
											sender: model.user.email,
											receiver: model.recipientName,
											subject: model.subject,
											message: model.message,
											timestamp: Date.now(),
											analyze: {
												text: rating.messageText,
												category: rating.CategorizedAs,
												categoryAmount: rating.CategorizationAmount,
												NegativeAmount: rating.Negative,
												PositiveAmount: rating.Positive,
												NeutralAmount: rating.Neutral
											} 
									}).then(function(){
										//receiving message and storing it in /messages/receiveruid/received
											var messageReceivingRef = $firebaseArray(DbReference.messageReference(recipientUID).child("recieved"));
											messageReceivingRef.$add({
												sender: model.user.email,
												receiver: model.recipientName,
												subject: model.subject,
												message: model.message,
												timestamp: Date.now(),
												analyze: {
													text: rating.messageText,
													category: rating.CategorizedAs,
													categoryAmount: rating.CategorizationAmount,
													NegativeAmount: rating.Negative,
													PositiveAmount: rating.Positive,
													NeutralAmount: rating.Neutral
												} 
											}).then(function(){
													
													model.subject = "";
													model.message = "";
													$.notify({
															   icon: 'glyphicon glyphicon-ok',
															   title: 'Success',
															   message: 'Message was sent successfully!'
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
											});
									});

						 }).catch(function(err){
						 	console.log("Error : " + err);
						 });
				};


				model.showMessage = function(msg){
					var messageModalRef = angular.element("#msgsModal");
					messageModalRef.modal("show");
					model.message = msg;
				};
			}
	});

}());