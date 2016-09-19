var app = angular.module('app', ['react']);

app.filter("bySearchedText", function() {
    return function (properties, searchedText) {
        return properties.filter(function (item) {
            return item.title.indexOf(searchedText) > -1;
        });
    };
});


app.factory('service', function($http) {
    var promise;
    var jsondata = {
        get: function() {
            if ( !promise ) {
                var promise =  $http.get('dataFactory/mockData.js').success(function(response) {
                    return response.data;
                });
                return promise;
            }
        }
    };
    return jsondata;
});

app.controller('mainCtrl', function (service, $scope, $http, $filter) {
    $scope.properties = [];
    $scope.originalProperties = [];
    $scope.searchedText = '';


    service.get().then(function (response) {
        if (response.data.success === true) {
            var propertiesData = response.data.properties;
            $scope.properties = typeof propertiesData !== 'undefined' ? propertiesData : [];
            $scope.originalProperties = typeof propertiesData !== 'undefined' ? propertiesData.slice(0, propertiesData.length) : [];

        } else {
            $scope.success = response.data.success;
        }
    }, function (response) {
        $scope.data = response.data || "Request failed";
        $scope.status = response.status;
    });


    $scope.orderingCriteria = [
        {id: 1, name: "Ascending price"},
        {id: 2, name: "Descending price"},
        {id: 3, name: "Increasing number of rooms"}
    ];

    $scope.orderingChanged = function(item){

        if (null === item) {
            $scope.properties = $scope.originalProperties;
        } else {
            switch (item.id) {
                case 1:
                    $scope.properties = $filter('orderBy')($scope.properties, 'price');
                    break;
                case 2:
                    $scope.properties = $filter('orderBy')($scope.properties, 'price', true);
                    break;
                case 3:
                    $scope.properties = $filter('orderBy')($scope.properties, 'rooms', true);
                    break;
            }
        }
    };

    $scope.searchTextChanged = function() {
        $scope.properties = $filter('bySearchedText')($scope.originalProperties, $scope.searchedText);
    }
});

app.factory("ListProperties", function ($filter) {
    return React.createClass({

        propTypes: {
            properties: React.PropTypes.array.isRequired
        },

        handleImageErrored: function(event) {
            jQuery(event.target).prop('src', 'http://placehold.it/226x140/cccccc/ffffff&text=No photo');
            jQuery(event.target).css('border', 'double 3px #cccccc');
        },

        render: function () {
            var listItems = [{className: 'my-list'}],
                that = this;

            this.props.properties.forEach(function (item) {
                var title = React.DOM.div({className: 'property-title'}, item.title),
                    price = React.DOM.div({className: 'property-price'}, item.price),
                    headerDiv = React.DOM.div({className: 'property-box-header'}, title, price),
                    rooms = React.DOM.span(null, item.rooms + ' rooms'),
                    surface = React.DOM.span(null, item.surface + ' m2' + ' | '),
                    description = React.DOM.p({className: 'description'}, item.description),
                    mainInfoDiv = React.DOM.div({className: 'main-info-container'}, surface, rooms, description),
                    image = React.DOM.img({
                        src: item.thumb,
                        onError: that.handleImageErrored
                    }),
                    imageDiv = React.DOM.div({className: 'image-container'}, image),
                    mainDiv = React.DOM.div({className: 'property-box-main'}, imageDiv, mainInfoDiv),
                    boxContent = React.DOM.div({className: 'my-property-box'}, headerDiv, mainDiv);

                listItems.push(React.DOM.li(null, boxContent));
            });

            return React.DOM.ul.apply(undefined, listItems);
        }
    });
});

app.directive('listing', function (reactDirective) {
    return reactDirective('ListProperties');
});