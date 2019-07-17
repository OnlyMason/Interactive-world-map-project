var app = angular.module('app', []);

//Use the service for complex logic and creation
app.service('appService', function($http, $q) {
  this.url = 'https://restcountries.eu/rest/v2/all?fields=name;population;capital;alpha2Code;area;region;subregion;currencies';
  //Make the API request to URL and return promise
  this.fetch = function() {
    var defer = $q.defer();
    $http.get(this.url).then(function(response) {
      defer.resolve(response);
    });
    return defer.promise;
  };
  //Generate the tooltip text with given id in countries
  this.showMetaData = function(id, countries) {
    var toolTipText = ''
    for (var i = 0; i < countries.length; i++) {
      if (id === countries[i].alpha2Code) {
        toolTipText +=
          countries[i].name + '<br>' +
          'ISO 2 Code: ' + countries[i].alpha2Code + '<br>' +
          'Area: ' + countries[i].area + '<br>' +
          'Region: ' + countries[i].region + '<br>' +
          'Sub-Region: ' + countries[i].subregion + '<br>' +
          'Currency: ' + countries[i].currencies[0].name + ' - ' + countries[i].currencies[0].symbol;
        break;
      }
    }
    return toolTipText;
  };
});

//Controller 
app.controller('appController', ['$scope', 'appService', function($scope, appService) {
  $scope.filter = '';
  $scope.exactMatch = false;
  $scope.sortKey = 'name';
  $scope.reverse = false;
  $scope.countries = [];
  var id;
  appService.fetch().then(function(response) {
    $scope.countries = response.data;
  });

  //Set the sortKey.  If new sortKey is the same as the current sortkey, reverse the sort order also
  $scope.sortBy = function(sortKey) {
    $scope.reverse = ($scope.sortKey === sortKey) ? !$scope.reverse : false;
    $scope.sortKey = sortKey;
  }
  
  $scope.setColumn = function(sortKey) {
  	if($scope.sortKey === sortKey) {
    	return 'table-headers-selected';
    } else {
    	return 'table-headers';
    }
  }

  /* Called when clicking a country on the map
   *  In this case we are selecting a specific country
   *  So we limit the filter to only exact match of country id*/
  $scope.filterBy = function(filterKey) {
    $scope.filter = filterKey.target.id;
    $scope.exactMatch = true;
  }
	
  $scope.showMetaData = function(country) {
    return appService.showMetaData(country, $scope.countries);
  }
}]);

// Jasmine Specs
describe('Testing the controller', function() {
  beforeEach(module('app'));
  var $controller;
  var $scope = {};
  var sortKey = 'population';

  beforeEach(inject(function(_$controller_) {
    $controller = _$controller_;
    var controller = $controller('appController', {
      $scope: $scope
    });
  }));	
  
  // Verify that the sortBy function is correctly receiving the new sort parameter and resetting the reverse toggle
  it('should set the correct sort key and sort reverse', function() {
    $scope.reverse = true;
    $scope.sortBy(sortKey);
    expect($scope.sortKey).toEqual(sortKey);
    expect($scope.reverse).toBe(false);
  });

// Verify that the sortBy function is correctly toggling the reverse variable when $scope.sortKey is already equal to sortKey
  it('should reverse the sort when receiving the same sort key as current sort key', function() {
  	$scope.reverse = false;
    $scope.sortKey = sortKey;
    $scope.sortBy(sortKey);
    expect($scope.sortKey).toEqual(sortKey);
    expect($scope.reverse).toBe(true);
  });

});

describe('Testing the service', function() {
	var service;
  var $httpBackend;
  var countries = [];
  beforeEach(module('app'));
  
  beforeEach(inject(function(_appService_, _$httpBackend_) {
    service = _appService_;
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET(service.url).respond([{id: 'US'}, {id: 'UK'}]);
  }));

	// Verify that the service was created successfully
  it('service should be defined', function() {
  	expect(service).toBeDefined();
    expect(service.fetch).toBeDefined();
    expect(service.showMetaData).toBeDefined();
  });
  
  // Verify that fetch function returns a response
  it('makes a successful API call', function() {
  	var r;
    service.fetch().then(function(response) {
    	r = response;	
    });
    $httpBackend.flush();
    expect(r.status).toEqual(200);
    expect(r.data.length).toEqual(2);    
  });
});