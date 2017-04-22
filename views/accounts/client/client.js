(function(){
	
	"use strict";
	
	var clientModule = angular.module("AlphaApp");
	
	clientModule.component("clientComponent", {
		
		templateUrl: "views/accounts/client/client.html",
		controllerAs: "model",
		bindings: {
			currentAuth: "=",
			getClient: "=",
			companies: "=getCompanies",
			clientFiles: "=getFilesClient",
			other: "=otherCalc",
			msgsRec: "=getMsgsRecieved",
			msgsSent: "=getMsgsSent"
		},
		controller: function($location, Upload, $http, $firebaseArray, DbReference, $sessionStorage, DTOptionsBuilder, GetSize){
			var model = this;

			model.$onInit = function(){
				if(model.getClient.role !== "CLIENT")
					$location.path("/security/login");
				else
					model.user = model.getClient;
				
				model.selected = undefined;
				
				model.companyNames = [];
				for(var i=0;i<model.companies.length;++i)
					model.companyNames.push(model.companies[i].$id);
				
				model.isOpened = false;
				model.successDatasheet = false;

				if($sessionStorage.currentTab)
					model.active = $sessionStorage.currentTab;
				else
					model.active = 0

				model.dtOptions = DTOptionsBuilder.newOptions() .withOption('order', [2, 'asc']);
				//Saving the date object to use it in expressions
				model.date = Date.now() + 86400000;

			};
			
			/* For date pop up */
			model.disabled = function(data) {
			    var date = data.date,
				 mode = data.mode;
			    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
			  };

			model.openCalender = function(){
				model.isOpen = true;
			};
			model.dateOptions = {
			    dateDisabled: model.disabled,
			    formatYear: 'yy',
			    maxDate: new Date(2020, 5, 22),
			    minDate: new Date(),
			    startingDay: 1
			  };
			/*end of date pop up*/
			model.onUpload = function(){
				model.status = false;
				var options = {
					hashTracking: false, 
					closeOnOutsideClick: false,
					closeOnConfirm: true,
					closeOnCancel: false,
					closeOnEscape: false
				};
				var uploadModalRef = $('[data-remodal-id=modal]').remodal(options);
				uploadModalRef.open();


				/* Uploading Datasheet File */
				Upload.upload({
		            url: 'PHPScripts/upload.php',
		            data: {file: model.datasheetFile}
		        }).then(function (datasheetresp) {
		        	model.successDatasheet = true;

		        	model.datasheetData = datasheetresp.data;

		        		/* Upload Lov File */
				        Upload.upload({
				            url: 'PHPScripts/upload.php',
				            data: {file: model.lovFile}
				        }).then(function (lovresp) {
				        	model.successLov = true;
				        	model.lovData = lovresp.data;

				        		if(model.successDatasheet && model.successLov)
						        {
						        	var deadlinedate = new Date(model.dt);
						        	deadlinedate = deadlinedate.getTime() + 50000;

						        	var clientFileRef = DbReference.getUser(model.user.uidKey).child("files").child(model.fUID.toUpperCase());
						        	
				        			if(model.additionalInfo === undefined)
				        				model.additionalInfo = "No Additional Information needed!";

				        			// Adding the data to /user/client UID/files node
				        			clientFileRef.set({
				        				datasheetfilename: model.datasheetFile.name,
				        				lovfilename: model.lovFile.name,
				        				deadline: deadlinedate,
				        				assignedToCompany: model.selected,
				        				assignedToEmployee: "No",
				        				sizeDatasheet: model.datasheetFile.size,
				        				sizeLovsheet: model.lovFile.size,
				        				additionalInfo: model.additionalInfo,
				        				progress: 0,
				        				total: model.datasheetData.length
				        			}).then(function(){

				        				//adding log to /log/fileslog/file
				        				var clientFileLogRef = $firebaseArray(DbReference.getFileLogs(model.fUID.toUpperCase()));
				        				clientFileLogRef.$add({
				        					timeStamp: Date.now(),
				        					log: "Files were uploaded."
				        				}).then(function(){

				        						// adding data to /company/companyname/files
				        						var companyFilesRef = DbReference.getCompanyFileUnAssigned(model.selected, model.fUID.toUpperCase());
				        						companyFilesRef.set({
				        							datasheetfilename: model.datasheetFile.name,
							        				lovfilename: model.lovFile.name,
							        				deadline: deadlinedate,
							        				assignedToEmployee: "No",
							        				assignedToCompany: model.selected,
							        				sizeDatasheet: model.datasheetFile.size,
							        				sizeLovsheet: model.lovFile.size,
							        				additionalInfo: model.additionalInfo,
							        				clientUID: model.user.uidKey,
							        				progress: 0,
							        				total: model.datasheetData.length
				        						}).then(function(){

				        							//adding log to /log/fileslog/file of assigning to the company
							        				clientFileLogRef.$add({
							        					timeStamp: Date.now(),
							        					log: "File was successfully assigned to " + model.selected
							        				}).then(function(){

				        									//Finally saving the datasheet to /FilesData/FileUID/uncompleted
				        									var dataRef = DbReference.getFileDataRef(model.fUID.toUpperCase()).child("uncompleted");
				        									for(var index=0;index<model.datasheetData.length;index++)
				        										dataRef.push(model.datasheetData[index]);

				        									//Finally saving the LOV to /FilesData/FileUID/uncompleted
				        									var lovRef = DbReference.getFileDataRef(model.fUID.toUpperCase()).child("LOV");
				        									lovRef.set(model.lovData);

			        										//adding log to /log/fileslog/file
			        										clientFileLogRef.$add({
									        					timeStamp: Date.now(),
									        					log: "Data was extracted, transformed and loaded."
									        				}).then(function(){
			        											model.status = true;
									        				});

							        				});
				        						});
				        				});
				        			}).catch(function(err){
				        				console.log(err);
				        			});

						        }

				        }, function (lovresp) {
				            console.log('LOV FILE Error status: ' + lovresp.status);
				        }, function (evt) {
				            model.progressLov = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
				        });
				        /* End of Lov File */

		        }, function (datasheetresp) {
		            console.log('DATASHEET FILE Error status: ' + datasheetresp.status);
		        }, function (evt) {
		            model.progressDatasheet = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
		        });
		        /* End of uploading datasheet file */

		        

		        /* Uploading image Zip */
		        Upload.upload({
		            url: 'PHPScripts/upload.php',
		            data: {file: model.imageZipFile}
		        }).then(function (resp) {
		        	if(resp.data === "ZipExtractError")
		        		console.log("Error occured during extracting of the file.");
		        	else
		        		model.successImages = true;

		        }, function (resp) {
		            console.log('ZIP Error status: ' + resp.status);
		        }, function (evt3) {
		            model.progressImages = Math.min(100, parseInt(100.0 * evt3.loaded / evt3.total));
		        });
		        /* End of Image Zip */

		        
			};
			
			model.companySelectedVerify = function(company){

				if(company)
				{
					var flag = false;
					for(var i=0; i < model.companyNames.length; i++) {
					   if (company.match(model.companyNames[i])) {
						  model.companyFlag = true;
						   break;
					   }else{
						   model.companyFlag = false;
					   }
				    }
				}
				else
					model.companyFlag = false;
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

			model.setActiveTab = function(index){
				model.active = index;
				$sessionStorage.currentTab = index;
				model.date = Date.now() + 86400000;
			};

			model.checkFUID = function(fUID){
				if(fUID)
				{
					for(var i=0;i<model.clientFiles.length;i++)
					{
						if(model.clientFiles[i].$id === fUID.toUpperCase())
						{
							model.fUIDFlag = true;
							break;
						}
						else
							model.fUIDFlag = false;
					}
				}
			};



			model.downloadFile = function(fuid, cuid){
				model.downloadStatus = $http.get("PHPScripts/downloadExcelOutput.php");
				window.location.href = "PHPScripts/downloadExcelOutput.php?filename="+fuid+"&companyname="+cuid;
			};

			model.giveFeedback = function(file){
				model.companyFeedback = null;
				model.rateCompany = null;
				model.employeeFeedback = null;
				model.rateEmployee = null;

				model.fileFeedbackSave = file;
				model.filename1 = file.$id;
				model.feedbackModalRef = angular.element("#feedbackModal");
				model.feedbackModalRef.modal("show");
			};

			model.giveFeedbackData = function(){

				var giveFeedbackEmp = $firebaseArray(DbReference.feedback(model.fileFeedbackSave.assignedToEmployee));
				giveFeedbackEmp.$add({
					companyRatingText: model.companyFeedback,
					companyRatingValue: model.rateCompany,
					employeeRatingText: model.employeeFeedback,
					employeeRatingValue: model.rateEmployee,
					forFile: model.filename1,
					givenByName: model.user.name,
					givenByUID: model.user.$id,
					givenByCompany: model.user.company,
					timestamp: Date.now()
				});

				var giveFeedbackCompany = $firebaseArray(DbReference.companyFeedback(model.fileFeedbackSave.assignedToCompany));
				giveFeedbackCompany.$add({
					companyRatingText: model.companyFeedback,
					companyRatingValue: model.rateCompany,
					employeeRatingText: model.employeeFeedback,
					employeeRatingValue: model.rateEmployee,
					forFile: model.filename1,
					givenByName: model.user.name,
					givenByUID: model.user.$id,
					givenByCompany: model.user.company,
					timestamp: Date.now()
				});
				model.feedbackModalRef.modal("hide");
			};
		}
		
	});
	
}());