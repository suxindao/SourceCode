angular.module('if-directive', [])

.directive('if', function() {
    return {
        transclude: 'element',
        priority: 500,
        compile: function(element, attr, transclude) {
            return function postLink(scope, element, attr) {
                var childElement, childScope;

                scope.$watch(attr['if'], function(newValue) {
                    if (childElement) {
                        childElement.remove();
                        childScope.$destroy();
                        childElement = undefined;
                        childScope = undefined;
                    }

                    if (newValue) {
                        childScope = scope.$new();
                        childElement = transclude(childScope, function(clone) {
                            element.after(clone);
                        })
                    }
                })
            }
        }
    };
});
