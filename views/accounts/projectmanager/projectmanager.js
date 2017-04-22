(function(){

	"use strict";

	var ProjectManagerModule = angular.module("AlphaApp");

	ProjectManagerModule.component("projectManager", {
		templateUrl: "views/accounts/projectmanager/projectmanager.html",
		controllerAs: "model",
		bindings: {
			currentAuth: "=",
			user: "=getPm",
			msgsRec: "=getMsgsRecieved",
			msgsSent: "=getMsgsSent",
			feeds: '=feedback'
		},
		controller: function($location, $sessionStorage, $firebaseArray, $firebaseObject, DbReference, DTOptionsBuilder){
			var model = this;

			function getEmp()
			{
					// Getting the company information
					model.companyPromise = $firebaseArray(DbReference.getCompanyByName(model.user.company).child("employees")).$loaded();
					model.companyPromise.then(function(emp){
						model.emps = emp;
							model.employeesArray = [];
							for(var i=0;i<model.emps.length;i++)
								model.employeesArray.push(model.emps[i].name);

							model.companyPromise = $firebaseArray(DbReference.getCompanyByName(model.user.company).child("files").child("uncompleted")).$loaded();
							model.companyPromise.then(function(ufile){
								model.uncompletedfiles = ufile;
									model.companyPromise = $firebaseArray(DbReference.getCompanyByName(model.user.company).child("files").child("completed")).$loaded();
									model.companyPromise.then(function(cfile){
											model.completedfiles = cfile;

											model.companyPromise = $firebaseArray(DbReference.getCompanyByName(model.user.company).child("files").child("assigned")).$loaded();
											model.companyPromise.then(function(afile){
												model.assignedfiles = afile;
											})
										});
							});
					});
			};

			model.$onInit = function(){

				if(model.user.role !== "PROJECT MANAGER")
					$location.path("/security/login");
				else
				{
					if($sessionStorage.currentTab)
						model.active = $sessionStorage.currentTab;
					else
						model.active = 0;
				}
				model.dtOptions = DTOptionsBuilder.newOptions() .withOption('order', [2, 'asc']);
				model.dtuncompletedfiles = {};

				model.date = Date.now() + 86400000;

			};

			getEmp();

			model.setActiveTab = function(index){
				model.active = index;
				$sessionStorage.currentTab = index;
				model.date = Date.now() + 86400000;
			};

			model.assignEmp = function(file){
				var assignEmpModalRef = $('[data-remodal-id=assignEmpModal]').remodal({hashTracking: false, closeOnOutsideClick: false});
				assignEmpModalRef.open();
				model.fileObject = file;
			};

			model.getFileLogsNow = function(fUID){
				var fileLogRef = $('[data-remodal-id=fileLogModal]').remodal({
					hashTracking: false
				});
				fileLogRef.open();

				var fileLogs = $firebaseArray(DbReference.getFileLogs(fUID));
				fileLogs.$loaded().then(function(response){
					model.logFile = response;
				}).catch(function(err){
					console.log("Error in fetching : " + fUID);
				});
			};

			model.checkEmp = function(username){
				if(username)
				{
					for(var i=0;i<model.employeesArray.length;i++)
					{
						if(username === model.employeesArray[i])
						{
							model.empFlag = true;
							break;
						}
						else
							model.empFlag = false;
					}
				}
				else
					model.empFlag = false;
			};

			model.getEmp = function(username) {
				if(username)
				{
					model.checkEmp(username);

					if(model.empFlag) {
						for(var i=0;i<model.emps.length;i++)
						{
							if(model.emps[i].name === username) {
								model.emp1name = model.emps[i].name;
								model.emp1code = model.emps[i].ecode;	
								model.emp1uid = model.emps[i].uidKey;

								model.empPromise = $firebaseObject(DbReference.getUser(model.emp1uid)).$loaded();
								model.empPromise.then(function(res){
										model.emp1rating = res.rating;
										model.emp1contact = res.contact;
										model.emp1email = res.email;
								}).catch(function(err){
									console.log("Error : " + err);
								})
								break;
							}
						}
					}
				}
			};

			model.assignFile = function(uid, email) {

				// Adding entry to /companies/companyname/files/assigned
				var assignedFileRef = DbReference.getCompanyFileAssigned(model.user.company, model.fileObject.$id);
				assignedFileRef.set({
					additionalInfo: model.fileObject.additionalInfo,
					assignedToEmployee: uid,
					clientUID: model.fileObject.clientUID,
					datasheetfilename: model.fileObject.datasheetfilename,
					deadline: model.fileObject.deadline,
					lovfilename: model.fileObject.lovfilename,
					progress: model.fileObject.progress,
					sizeDatasheet: model.fileObject.sizeDatasheet,
					sizeLovsheet: model.fileObject.sizeLovsheet,
					total: model.fileObject.total,
					assignedToCompany: model.user.company

				}).then(function(){
						model.uncompletedfiles.$remove(model.fileObject).then(function(res){
							
							assignedFileRef = DbReference.getClientFile(model.fileObject.clientUID, model.fileObject.$id).child("assignedToEmployee");
							assignedFileRef.set(uid).then(function(res){

										//adding log to /log/fileslog/file
				        				var clientFileLogRef = $firebaseArray(DbReference.getFileLogs(model.fileObject.$id));
				        				clientFileLogRef.$add({
				        					timeStamp: Date.now(),
				        					log: "File was assigned to Employee : ' " + email + " '"
				        				}).then(function(res){
				        						
				        						$.notify({
												 icon: 'glyphicon glyphicon-ok',
												 title: 'Success',
												 message: 'File: ' + model.fileObject.$id + ' has been successfully assigned!'
												},{
												   type: "success",
												   z_index: 1031,
												   delay: 1000,
												   timer: 1000,
												   animate: {
													  enter: 'animated fadeInUp',
													  exit: 'animated fadeOutUp'
												   },

												});

				        				}).catch(function(err){
				        					console.log("Error in pushing logs");
				        				});
							}).catch(function(err){
								console.log("Error updating data in client side");
							});
						}).catch(function(err){
							console.log("Error in deleting data.");
						});

				}).catch(function(err){
					console.log("Adding node to company/files/assigned failed.");
				});
				
				model.closeAssignModal();
			};

			model.closeAssignModal = function(){
				document.getElementById("assignEmpForm").reset();
				model.emp1name = "";
				model.emp1code = "";	
				model.emp1uid = "";
				model.emp1rating = "";
				model.emp1contact = "";
				model.emp1email = "";
			};
		}
	});

}());