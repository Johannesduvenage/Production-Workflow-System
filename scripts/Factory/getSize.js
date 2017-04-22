(function(){
		
		var GetSizeModule = angular.module("AlphaApp");

		GetSizeModule.factory("GetSize", function($firebaseArray){
			return $firebaseArray.$extend({
				uploadsize: function(){
					var total = 0;

					angular.forEach(this.$list, function(rec){
						total += (rec.sizeDatasheet + rec.sizeLovsheet);
					});

					if(total < 1024)
						return total.toFixed(1) + " KB ";
					else{
						total = total / 1024;
						if(total < 1024)
							return total.toFixed(1) + " MB ";
						else {
							total = total / 1024;
							return total.toFixed(1) + " GB ";
						}
					}
					return total;
				},
				getCompletedFilesNumber: function(){
					var total = 0;
					angular.forEach(this.$list, function(rec){
							if(rec.progress == rec.total){
								total += 1;
							}
					});
					return total;
				},
				getNotCompletedFilesNumber: function(){
					var total = 0;
					angular.forEach(this.$list, function(rec){
							if(rec.progress != rec.total){
								total += 1;
							}
					});
					return total;
				}
			});
		});

}());