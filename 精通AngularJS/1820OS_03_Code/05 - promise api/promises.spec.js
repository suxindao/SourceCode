describe('pizza pit', function () {

  var Person = function (name, $log) {

    this.eat = function (food) {
      $log.info(name + " is eating delicious " + food);
    };
    this.beHungry = function (reason) {
      $log.warn(name + " is hungry because: " + reason);
    };
  };

  var $q, $exceptionHandler, $log, $rootScope;
  var servePreparedOrder, promisedOrder, pawel, pete;
  beforeEach(inject(function (_$q_, _$exceptionHandler_, _$log_, _$rootScope_) {
    $q = _$q_;
    $exceptionHandler = _$exceptionHandler_;
    $log = _$log_;
    $rootScope = _$rootScope_;
    pawel = new Person('Pawel', $log);
    pete = new Person('Peter', $log);
  }));

  describe('pizza pit', function () {

    describe('$q used directly', function () {

      it('should illustrate basic usage of $q', function () {

        //differed represents a task that will complete (or fail) in the future
        var pizzaOrderFulfillment = $q.defer(); // 创建一个延时对象

        //the task in the future comes with a promise of task completion (or failrue)
        var pizzaDelivered = pizzaOrderFulfillment.promise; // 保存一个承诺 promise

        pizzaDelivered.then(pawel.eat, pawel.beHungry); // 提供任务成功或失败的执行方法

        pizzaOrderFulfillment.resolve('Margherita'); // 调用延时对象的成功执行方法
        $rootScope.$digest(); // 传播这个结果

        expect($log.info.logs).toContain(['Pawel is eating delicious Margherita']);
      });
    });

    describe('$q used in a service', function () {

      var Restaurant = function ($q, $rootScope) {

        var currentOrder;

        // 返回一个任务，承诺对象 promise
        this.takeOrder = function (orderedItems) {
          currentOrder = {
            deferred:$q.defer(),
            items:orderedItems
          };
          return currentOrder.deferred.promise;
        };

        // 成功递送
        this.deliverOrder = function() {
          currentOrder.deferred.resolve(currentOrder.items);
          $rootScope.$digest();
        };

        // 订单派送失败
        this.problemWithOrder = function(reason) {
          currentOrder.deferred.reject(reason);
          $rootScope.$digest();
        };
      };

      var slice = function(pizza) {
        return "sliced "+pizza;
      };

      var pizzaPit, saladBar;
      beforeEach(function () {
        pizzaPit = new Restaurant($q, $rootScope);
        saladBar = new Restaurant($q, $rootScope);
      });

      // 任务执行失败
      it('should illustrate promise rejection', function () {

        pizzaPit = new Restaurant($q, $rootScope);
        var pizzaDelivered = pizzaPit.takeOrder('Capricciosa');
        pizzaDelivered.then(pawel.eat, pawel.beHungry);

        pizzaPit.problemWithOrder('no Capricciosa, only Margherita left');
        expect($log.warn.logs).toContain(['Pawel is hungry because: no Capricciosa, only Margherita left']);
      });

      // 聚合回调，一个任务上注册多个回调。任务成功后被执行。
      it('should allow callbacks aggregation', function () {

        var pizzaDelivered = pizzaPit.takeOrder('Margherita');
        pizzaDelivered.then(pawel.eat, pawel.beHungry);
        pizzaDelivered.then(pete.eat, pete.beHungry);

        pizzaPit.deliverOrder();
        expect($log.info.logs).toContain(['Pawel is eating delicious Margherita']);
        expect($log.info.logs).toContain(['Peter is eating delicious Margherita']);
      });

      // 链式调用，在 Pizza 送到后切好上桌。此种方法与同步风格代码十分相似。
      // 相同于： pawel.eat(slice(pizzaPit))
      it('should illustrate successful promise chaining', function () {

        var slice = function(pizza) {
          return "sliced "+pizza;
        };

        pizzaPit.takeOrder('Margherita').then(slice).then(pawel.eat);

        pizzaPit.deliverOrder();
        expect($log.info.logs).toContain(['Pawel is eating delicious sliced Margherita']);
      });

      // 失败后抛出的异常会冒泡给第一个捕获(catch)块
      it('should illustrate promise rejection in chain', function () {

        pizzaPit.takeOrder('Capricciosa').then(slice).then(pawel.eat, pawel.beHungry);

        pizzaPit.problemWithOrder('no Capricciosa, only Margherita left');
        expect($log.warn.logs).toContain(['Pawel is hungry because: no Capricciosa, only Margherita left']);
      });

      // 在第一个任务失败后，再失败操作中继续任务的成功操作。
      // 预定另一张 Pizza
      it('should illustrate recovery from promise rejection', function () {

        var retry = function(reason) {
          return pizzaPit.takeOrder('Margherita').then(slice);
        };
        pizzaPit.takeOrder('Capricciosa').then(slice, retry).then(pawel.eat, pawel.beHungry);

        pizzaPit.problemWithOrder('no Capricciosa, only Margherita left');
        pizzaPit.deliverOrder();

        expect($log.info.logs).toContain(['Pawel is eating delicious sliced Margherita']);
      });

      //在失败中抛出另一个错误信息。专用方法：$q.reject
      it('should illustrate explicit rejection in chain', function () {

        var explain = function(reason) {
          return $q.reject('ordered pizza not available');
        };

        pizzaPit.takeOrder('Capricciosa').then(slice, explain).then(pawel.eat, pawel.beHungry);
        pizzaPit.problemWithOrder('no Capricciosa, only Margherita left');

        expect($log.warn.logs).toContain(['Pawel is hungry because: ordered pizza not available']);
      });

      // $q.all([]) 能同时启动多个异步任务，也叫聚合承诺。多有单个承诺都成功履行后，聚合承诺才会执行。
      it('should illustrate promise aggregation', function () {

        var ordersDelivered = $q.all([
          pizzaPit.takeOrder('Pepperoni'),
          saladBar.takeOrder('Fresh salad')
        ]);

        ordersDelivered.then(pawel.eat);

        pizzaPit.deliverOrder();
        saladBar.deliverOrder();
        expect($log.info.logs).toContain(['Pawel is eating delicious Pepperoni,Fresh salad']);
      });

      // 如果有一个单个任务失败，整个聚合承诺就会被拒绝。
      it('should illustrate promise aggregation when one of the promises fail', function () {

        var ordersDelivered = $q.all([
          pizzaPit.takeOrder('Pepperoni'),
          saladBar.takeOrder('Fresh salad')
        ]);

        ordersDelivered.then(pawel.eat, pawel.beHungry);

        pizzaPit.deliverOrder();
        saladBar.problemWithOrder('no fresh lettuce');
        expect($log.warn.logs).toContain(['Pawel is hungry because: no fresh lettuce']);
      });

      // 
      it('should illustrate promise aggregation with $q.when', function () {

        var ordersDelivered = $q.all([
          pizzaPit.takeOrder('Pepperoni'),
          $q.when('home made salad')
        ]);

        ordersDelivered.then(pawel.eat, pawel.beHungry);

        pizzaPit.deliverOrder();
        expect($log.info.logs).toContain(['Pawel is eating delicious Pepperoni,home made salad']);
      });
    });
  });
});