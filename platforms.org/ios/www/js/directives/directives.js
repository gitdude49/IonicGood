angular.module('starter.directives', [])
    .directive("picture", function () {
        return {
            restrict: "E",
            scope: {
                data: "=",
                checked: "="
            },
            controller: function ($scope, imageService) {
                $scope.img = null;
                imageService.getImageThumbnail($scope.data).then(function (data) {
                    $scope.img = data;
                }, function (error) {
                    console.error(error);
                })
            },
            template: '<div class="picture" ng-class="{\'checked\':checked}" style="background-image: url({{img}})"></div>'
        }
    })