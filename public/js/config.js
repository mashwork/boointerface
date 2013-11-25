//Setting up route
window.app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
            .when('/objects',       { templateUrl: 'views/objects/list.html' })
            .when('/objects/create', { templateUrl: 'views/objects/view.html' })
            .when('/object/:id',    { templateUrl: 'views/objects/view.html' })
            .when('/',              { templateUrl: 'views/index.html' })
            .otherwise({ redirectTo: '/' });
    }
]);

//Setting HTML5 Location Mode
window.app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix("!");
    }
]);