angular.module('mean.articles').controller('ObjectsShowController', [
    '$http', '$scope', '$routeParams', '$location', 'Global', 'Objects', 'ObjectSearch', 'Reference', 
    function ($http, $scope, $routeParams, $location, Global, Objects, ObjectSearch, Reference) {
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
        };

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
            ObjectSearch.query({term: query, limit: 5}, function (objectsData) {
                $scope.autocomplete = _.pluck(objectsData.objs.hits, "_source");
                callback(_.pluck($scope.autocomplete, "name")); // This will automatically open the popup with retrieved results
            });
        }

        $scope.removeReference = function (ref) {
            $scope.obj.references = _.reject($scope.obj.references, function (reference) { return reference.name === ref.name; });
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
    }
]);

angular.module('mean.articles').controller('ObjectsIndexController', [
    '$scope', '$routeParams', '$location', 'Global', 'Objects', 'ObjectSearch', 'Reference',
    function ($scope, $routeParams, $location, Global, Objects, ObjectSearch, Reference) {
        $scope.global = Global;

        function refreshObjects() {
            Objects.query({}, function (objectsData) {
                var allObjects = objectsData.objs;
                    Reference.query({}, function (refData) {
                    $scope.data = {};
                    $scope.data.nodes = _.reduce(
                        allObjects,
                        function (aggObj, obj) {
                            aggObj[obj.name] = { name: obj.name };
                            return aggObj;
                        },
                        {}
                    );
                    $scope.data.links = _.map(refData.references, function (link) {return {source: link.to.name, target: link.from.name, type: "is"}; });
                })
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
                console.log("deleted object");
                refreshObjects();
            })
        }
    }
]);