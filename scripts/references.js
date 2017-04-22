(function(){
	
	var referencesModule = angular.module("AlphaApp");
	
	referencesModule.factory("DbReference", function(rootRef, auth, deviceDetector){
		return {
			getUnverifiedUsers: function(){
				return rootRef.child("unverifiedUsers");
			},
			getVerifiedUsers: function(){
				return rootRef.child("users");
			},
			getUser: function(uidKey){
				return rootRef.child("users").child(uidKey);
			},
			getDeviceLogs: function(){
				return rootRef.child("logs").child("DeviceTracking");	
			},
			getDeviceDetails: function(){
				return deviceDetector;
			},
			getCompany: function(){
				return rootRef.child("companies");
			},
			getFileLogs: function(filename){
				return rootRef.child("logs").child("FileLogs").child(filename);
			},
			getCompanyFileUnAssigned: function(companyname, fUID){
				return rootRef.child("companies").child(companyname).child("files").child("uncompleted").child(fUID);
			},
			getCompanyFileAssigned: function(companyname, fUID){
				return rootRef.child("companies").child(companyname).child("files").child("assigned").child(fUID);
			},
			getFileDataRef: function(fUID){
				return rootRef.child("FileData").child(fUID);
			},
			getMessagesRef: function(emailId){
				return rootRef.child("Messages").child(emailId);
			},
			getCompanyByName: function(companyUID) {
				return rootRef.child('companies').child(companyUID);
			},
			getClientFile: function(uid, fuid){
				return rootRef.child("users").child(uid).child("files").child(fuid);
			},
			getFilesEmployee: function(companyName) {
				return rootRef.child("companies").child(companyName).child("files").child("assigned");
			},
			messageReference: function(uid){
				return rootRef.child("messages").child(uid);
			},
			feedback: function(uid){
				return rootRef.child("feedback").child(uid);
			},
			companyFeedback: function(companyName){
				return rootRef.child("companies").child(companyName).child("rating");
			}
		}
	});
	
}());