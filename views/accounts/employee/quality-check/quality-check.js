(function(){
	
	var QualityCheckModule = angular.module("AlphaApp");

	QualityCheckModule.filter("commaseperate", function(){
			return function(value) {
				if(value)
					return value.split(",");
				return;
			}
	});

	QualityCheckModule.component("fileFetch", {
			templateUrl: "views/accounts/employee/quality-check/quality-check.html",
			controllerAs: "model",
			bindings: {
				currentAuth: "=",
				user: "=getUser"
			},
			controller: function($routeParams, $firebaseArray,$firebaseObject, DbReference, $location, $localStorage, $scope, $http, $document, $timeout){
				var model = this;

				function enterFileLog(txt) {
					var pushLog = $firebaseArray(DbReference.getFileLogs($routeParams.fid));
								pushLog.$add({
			        					timeStamp: Date.now(),
			        					log: txt
			        				}).then(function(){
										model.fetchObject();
			        				});
				}

				model.$onInit = function(){

					if(model.user.role !== "EMPLOYEE")
						$location.path("/security/login");
					else
					{

						model.fetchObject();
						model.finished = false;

						if($localStorage.fileName)
						{
							var flag = false;
							for(var j=0;j<$localStorage.fileName.length;j++)
								if($localStorage.fileName[j] === $routeParams.fid)
										flag = true;

							if(!flag) {
								enterFileLog("Checking of the file started again.");
								$localStorage.fileName.push($routeParams.fid);
							}
						}
						else
						{
							var arr = [];
							arr.push($routeParams.fid);
							$localStorage.fileName = arr;
							enterFileLog("Checking of the file started.");
						}
					}
				};
				model.goUp = function(){
						var top = 400;
					    var duration = 700; //milliseconds
					    var offset = 30; //pixels; adjust for floating menu, context etc
					    var someElement = angular.element(document.getElementById('top'));
					    $document.scrollToElement(someElement, offset, duration);
				};
				model.fetchObject = function() {
						model.fetchPromise = $firebaseArray(DbReference.getFileDataRef($routeParams.fid).child("uncompleted")).$loaded();
						model.fetchPromise.then(function(res){
								if(res.length === 0) {
									model.finished = true;
									var finishedRef = $('[data-remodal-id=finishedModal]').remodal({hashTracking: false, closeOnConfirm: true, closeOnCancel: false, closeOnEscape: false, closeOnOutsideClick: false});
									finishedRef.open();
								} else {
									model.datasheet = angular.copy(res[0]);
									model.backup = angular.copy(res[0]);
									model.keyVal = model.datasheet.$id;   //to save the key value

									console.log(model.datasheet);
									model.fetchPromise = $firebaseObject(DbReference.getFileDataRef($routeParams.fid).child("LOV")).$loaded();
									model.fetchPromise.then(function(values){
											model.lovObject = values;
									});
								}
						});
				};

				model.saveObject = function(){

					if(model.comment === undefined)
						model.comment = "No comments";

					model.datasheet['QAStatus'] = model.statusValue;
					model.datasheet['QAComment'] = model.comment;
					var addDataRef = $firebaseArray(DbReference.getFileDataRef($routeParams.fid).child("completed"));
						
						addDataRef.$add(model.datasheet).then(function(){
								var refNode = DbReference.getFileDataRef($routeParams.fid).child("uncompleted");
								refNode.child(model.keyVal).remove();
								model.updateFileProgress();
								model.fetchObject();
						});
						
						document.getElementById("response").style.display = "block";
						setTimeout(function() {
							$(".nextProduct").addClass("bounceIn");
							$(".nextProduct").fadeOut("slow");
						}, 2000);

					model.statusValue = null;
					model.fetchPromise = null;
				};

				model.redirectLink = function(){
						$location.path("/accounts/employee");
				};

				model.updateFileProgress = function(){
					var companyFileRef = $firebaseObject(DbReference.getCompanyFileAssigned($routeParams.company, $routeParams.fid));
					companyFileRef.$loaded().then(function(){
						companyFileRef.$bindTo($scope, "CompanyFileProgress").then(function(){
							$scope.CompanyFileProgress.progress += 1;
						});
					});

					var clientFileRef = $firebaseObject(DbReference.getClientFile($routeParams.clientid, $routeParams.fid));
					clientFileRef.$loaded().then(function(){
						clientFileRef.$bindTo($scope, "ClientFileProgress").then(function(){
							$scope.ClientFileProgress.progress += 1;
						});
					});
				};

				model.magnify = function(){
					$('.product_images').magnify();
				};

				model.resetProductModal = function(){
					var productResetRef = $('[data-remodal-id=productResetModal]').remodal({closeOnOutsideClick: false,hashTracking: false});
					productResetRef.open();
					
				};

				model.confirm = function(element){
					model.datasheet[element] = angular.copy(model.backup[element]);
					model.productSelected = "";
				};
				model.discard = function() {
					model.productSelected = null;
				};

				model.productImagesModal = function(){
					var productImageRef = $('[data-remodal-id=productImagesModal]').remodal({hashTracking: false});
					productImageRef.open();
					model.palette = null;
					model.fetchImagePromise = $http.get("PHPScripts/colorDetect.php?image=" + model.datasheet['PRODUCT IMAGES']);

					model.fetchImagePromise.then(function(response){
						model.palette = response.data;
					});

				};

				model.closeModal = function(){
					$('[data-remodal-id=finishedModal]').remodal().close();
					$location.path("/accounts/employee");
				};
			}
	});

}());