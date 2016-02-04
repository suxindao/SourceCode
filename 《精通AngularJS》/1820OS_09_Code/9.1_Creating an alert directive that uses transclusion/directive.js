angular.module('alert-directive', [])

.controller('alertCtrl', function($scope, $location) {
    $scope.alerts = [{
        type: "success",
        msg: "成功！很好地完成了提交。"
    }, {
        type: "info",
        msg: "信息！请注意这个信息。"
    }, {
        type: "warning",
        msg: "警告！请不要提交。"
    }, {
        type: "danger",
        msg: "错误！请进行一些更改。"
    }];

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    }
})

.directive('alert', function() {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        template: 
                  '<div class="alert alert-{{type}}">' 
                  + '<button type="button" class="close" ng-click="close()">&times;</button>' 
                  + '<div ng-transclude></div>' 
                  + '</div>',
        scope: {
            type: '=',
            close: '&'
        }
    };
});
