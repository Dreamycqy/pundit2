angular.module('Pundit2.Annotators')

.directive('imageBit', function(ImageAnnotator, $injector, Config, $document, $window) {
    return {
        restrict: 'A',
        scope: {
            fragments: '@'
        },
        link: function(scope, element) {
            // var numberOfImageBits = scope.fragments.split(",").length;
            // element.addClass('pnd-image-numbers-' + numberOfImageBits);

            scope.bitId = new Date().getTime() + Math.floor(Math.random() * 100000);
            scope.isHigh = false;
            
            scope.high = function() {
                element.addClass('pnd-image-highlight');
            };
            scope.clear = function() {
                element.removeClass('pnd-image-highlight');
            };

            scope.hide = function() {
                element.addClass('pnd-image-hidden');
            };
            scope.show = function() {
                element.removeClass('pnd-image-hidden');
            };

            scope.ghost = function() {
                element.addClass('pnd-image-ghosted');
            };
            scope.expo = function() {
                element.removeClass('pnd-image-ghosted');
            };

            // ImageAnnotator.updateFragmentBit(scope, 'add');

            element.on('$destroy', function() {
                // ImageAnnotator.updateFragmentBit(scope, 'remove');
            });

        } // link()
    };
});