angular.module('mean.articles').controller('ObjectsShowController', [
    '$http', '$scope', '$routeParams', '$location', 'Global', 'Objects', 'ObjectSearch', 'Reference', 
    function ($http, $scope, $routeParams, $location, Global, Objects, ObjectSearch, Reference) {
        $scope.global = Global;
        $scope.addMode = false;
        $scope.idView = !!$routeParams.id;
        $scope.autocomplete = [];
        $scope.addedRefName = {};
        $scope.addingMode = {};
        $scope.types = [{name: "from", full_name: "Belong to"}, {name: "to", full_name: "Has"}];

        function setupObject () {
            if($routeParams.id) {
                $scope.editMode = false;
                Objects.get({id: $routeParams.id}, function(objectData){ 

                    $scope.obj = objectData.obj;
                    console.log("$scope.obj = %j", $scope.obj);
                }); 
            }else{
                $scope.obj = $scope.obj || {};
                $scope.editMode = true;
            }
        }

        $scope.toggleTwitterBoolean = function () {
            $scope.toggleTwitterBool = !$scope.toggleTwitterBool;
        } 

        setupObject();
        
        $scope.editToggle = function () {
            $scope.editMode = !$scope.editMode;  
        };

        $scope.addReferenceName = function (type) {
            $scope.addingMode[type] = true;
            $scope.addedRefName[type] = "";
        };

        $scope.saveNewRef = function (fieldName) {


            $scope.obj[fieldName]  = $scope.obj[fieldName] || [];
            var chosen = _.find($scope.autocomplete, function (autoElement) {return autoElement.name === $scope.addedRefName[fieldName]; });
            if(chosen){

                $scope.obj[fieldName].push(chosen);
            }else{
                if(confirm('This is a new object which will be created when you save.  Are you okay with this?')){
                    $scope.obj[fieldName].push({name: $scope.addedRefName[fieldName]});
                }
            }

            $scope.addingMode[fieldName] = false;
        };

        $scope.typeaheadFn = function(query, callback, field) {
            ObjectSearch.query({term: query, limit: 5}, function (objectsData) {

                $scope.autocomplete = _.pluck(objectsData.objs.hits, "_source");
                callback(_.pluck($scope.autocomplete, "name")); // This will automatically open the popup with retrieved results
            });
        }

        $scope.removeReference = function (ref, type) {
            $scope.obj[type] = _.reject($scope.obj[type], function (reference) { return reference.name === ref.name; });
        }

        $scope.saveObject = function () {
            function objResponse(responseObj) {
                console.log("responseObj = %j", responseObj);
                $location.path('/objects');
            }

            if ($routeParams.id){
                console.log("$scope.obj = %j", $scope.obj);
                Objects.update({id: $routeParams.id}, _.omit($scope.obj, '_id'), objResponse);
            }else{
                console.log("$scope.obj = %j", $scope.obj);
                Objects.save($scope.obj, objResponse);
            }
        }

        //how do i get rid of this duplication
        $scope.deleteObject = function (object) {
            Objects.delete({id: object._id}, function () {
                $location.path("/objects");
            })
        }
    }
]);

angular.module('mean.articles').controller('ObjectsIndexController', [
    '$scope', '$routeParams', '$location', 'Global', 'Objects', 'ObjectSearch', 'Reference',
    function ($scope, $routeParams, $location, Global, Objects, ObjectSearch, Reference) {
        $scope.global = Global;
        $scope.term = "";

        function refreshObjects() {
            Objects.query({}, function (objectsData) {
                var allObjects = objectsData.objs;
                Reference.query({}, function (refData) {
                    $scope.data = {};
                    $scope.data.nodes = _.reduce(
                        allObjects,
                        function (aggObj, obj) {
                            aggObj[obj.name] = { id: obj._id, name: obj.name };
                            return aggObj;
                        },
                        {}
                    );

                    $scope.data.links = _.map(refData.references, function (link) {
                        return {source: link.to.name, target: link.from.name, type: "is"}; 
                    });
                });
            });
        }

        refreshObjects();

        $scope.searchObjects = function  () {
            ObjectSearch.query({term: $scope.term, limit: 5}, function (objectsData) {
                $scope.objects = _.pluck(objectsData.objs.hits, "_source");
            });
        }

        $scope.deleteObject = function (object) {
            Objects.delete({id: object._id}, function () {
                refreshObjects();
            })
        }
    }
]);