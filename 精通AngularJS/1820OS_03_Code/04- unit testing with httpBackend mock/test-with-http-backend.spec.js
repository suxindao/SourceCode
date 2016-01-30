describe('$http basic', function() {

    var $http, $httpBackend, $scope, ctrl;
    beforeEach(module('test-with-http-backend'));
    beforeEach(inject(function(_$http_, _$httpBackend_) {
        $http = _$http_;
        $httpBackend = _$httpBackend_;
    }));
    beforeEach(inject(function(_$rootScope_, _$controller_) {
        $scope = _$rootScope_.$new();
        ctrl = _$controller_('UsersCtrl', {
            $scope: $scope
        });
    }));

    it('should return all users', function() {

        //setup expected requests and responses
        $httpBackend
            .whenGET('http://localhost:3000/databases/ascrum/collections/users')
            .respond([{
                name: 'Pawel'
            }, {
                name: 'Peter'
            }]);

        //invoke code under test
        $scope.queryUsers();

        //simulate response
        $httpBackend.flush();

        //verify results
        expect($scope.users.length).toEqual(2);
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation(); // 确定所有方法都如期执行
        $httpBackend.verifyNoOutstandingRequest(); // 确定测试代码没有处罚任何意外的XHR调用
    });

});
