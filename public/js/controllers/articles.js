angular.module('mean.articles').controller('ObjectsShowController', ['$http', '$scope', '$routeParams', '$location', 'Global', 'Objects', 'Reference', function ($http, $scope, $routeParams, $location, Global, Objects, Reference) {
    $scope.global = Global;
    $scope.addMode = false;
    $scope.idView = !!$routeParams.id;
    $scope.autocomplete = [];

    function setupObject () {
        if($routeParams.id) {
            $scope.editMode = false;
            Objects.get({id: $routeParams.id}, function(objectData){ 
                $scope.obj = objectData.obj;
            }); 
        }else{
            $scope.obj = $scope.obj || {};
            $scope.editMode = true;
        }
    }

    setupObject();
    
    $scope.editToggle = function () {
        $scope.editMode = !$scope.editMode;  
    }

    $scope.addReferenceName = function () {
        $scope.addingMode = true;
        $scope.addedRefName = "";
    };

    $scope.saveNewRef = function () {
        $scope.obj.references  = $scope.obj.references || [];
        var chosen = _.find($scope.autocomplete, function (autoElement) {return autoElement.name === $scope.addedRefName; });
        if(chosen){
            $scope.obj.references.push(chosen);
        }else{
            if(confirm('This is a new object which will be created when you save.  Are you okay with this?')){
                $scope.obj.references.push({name: $scope.addedRefName});
            }
        }
        
        $scope.addingMode = false;
    };

    $scope.typeaheadFn = function(query, callback) {
        $http.get('/object_search?term=' + query + "&limit=5").success(function(objectsData) {
            $scope.autocomplete = _.pluck(objectsData.objs.hits, "_source");
            callback(_.pluck($scope.autocomplete, "name")); // This will automatically open the popup with retrieved results
        });
    }

    $scope.removeReference = function (ref) {
        $scope.obj.references = _.reject($scope.obj.references, function (reference) { return reference.name === ref.name; })
    }

    $scope.saveObject = function () {
        function objResponse(responseObj) {
            $location.path('/objects');
        }

        if ($routeParams.id){
            Objects.update({id: $routeParams.id}, $scope.obj, objResponse);
        }else{
            Objects.save($scope.obj, objResponse);
        }
    }

    //how do i get rid of this duplication
    $scope.deleteObject = function (object) {
        Objects.delete({id: object._id}, function () {
            console.log("deleted object");
            $location.path("/objects");
        })
    }
}]);

angular.module('mean.articles').controller('ObjectsIndexController', ['$scope', '$routeParams', '$location', 'Global', 'Objects', function ($scope, $routeParams, $location, Global, Objects) {
    $scope.global = Global;

    function refreshObjects() {
        Objects.query({}, function (objectsData) {
            $scope.objects = objectsData.objs;
        });
    }
    
    refreshObjects();

    $scope.deleteObject = function (object) {
        Objects.delete({id: object._id}, function () {
            console.log("deleted object");
            refreshObjects();
        })
    }
}]);