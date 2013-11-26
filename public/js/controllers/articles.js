angular.module('mean.articles').controller('ObjectsShowController', ['$scope', '$routeParams', '$location', 'Global', 'Objects', function ($scope, $routeParams, $location, Global, Objects) {
    $scope.global = Global;
    $scope.addMode = false;
    $scope.idView = !!$routeParams.id;

    console.log("$routeParams.id = %j", $routeParams.id);
    if($routeParams.id) {
        $scope.editMode = false;
        console.log("$routeParams.id = %j", $routeParams.id)
        Objects.get({id: $routeParams.id}, function(objectData){ 
            $scope.obj = objectData.obj;
            console.log("objectData = %j", objectData);
            console.log("$scope.obj = %j", $scope.obj);
        }); 
    }else{
        $scope.obj = { referenceNames: [] };
        $scope.editMode = true;
    }

    $scope.editToggle = function () {
        $scope.editMode = !$scope.editMode;  
    }

    
    $scope.addReferenceName = function () {
        $scope.addingMode = true;
        $scope.addedRefName = "";
    };

    $scope.saveNewRef = function () {
        $scope.obj.referenceNames.push($scope.addedRefName);
        $scope.addingMode = false;
    };

    $scope.saveObject = function () {

        console.log("the obj = %j", $scope.obj);

        function objResponse(responseObj) {
            $location.path('/objects');
        }

        if ($routeParams.id){
            Objects.update({id: $routeParams.id}, $scope.obj, objResponse);
        }else{
            Objects.save($scope.obj, objResponse);
        }
    }
}]);

angular.module('mean.articles').controller('ObjectsIndexController', ['$scope', '$routeParams', '$location', 'Global', 'Objects', function ($scope, $routeParams, $location, Global, Objects) {
    $scope.global = Global;
    Objects.query({}, function (objectsData) {
        $scope.objects = objectsData.objs;
    });

    $scope.deleteObject = function (object) {
        Objects.delete({id: object._id}, function () {
            console.log("deleted object");
        })
    }
}]);