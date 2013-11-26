//Articles service used for articles REST endpoint
angular.module('mean.articles')
	.factory("Objects", ['$resource', function($resource) {
	    return $resource('objects/:id', 
	    	{ id: '@id'}, 
	    	{
	        	update: { method: 'PUT' },
	        	query:  { method: "GET", isArray:false}
	    	}
	    );
	}])
	.factory('Reference', ['$resource', function($resource) {
	    return $resource('references/:id', 
	    	{ id: '@id'}, 
	    	{
	        	update: { method: 'PUT' },
	        	query:  { method: "GET", isArray:false}
	    	}
	    );
	}]);