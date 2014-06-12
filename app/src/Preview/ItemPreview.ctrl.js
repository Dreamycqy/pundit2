angular.module('Pundit2.Preview')
    .controller('ItemPreviewCtrl', function($scope, TypesHelper, ItemsExchange, $element, Preview) {
        $scope.typeHidden = true;

        // get the label of a type from his uri
        $scope.getTypeLabel = function(uri) {
            return TypesHelper.getLabel(uri);
        };

        $scope.$watch('uri', function() {
            // TODO: special initialization for certain kind of items, like image fragments?
            $scope.item = ItemsExchange.getItemByUri($scope.uri);

            if(Preview.getItemDashboardSticky() !== null && Preview.getItemDashboardSticky().uri === $scope.uri){
                $scope.isSticky = true;
            } else {
                $scope.isSticky = false;
            }


        });

        $scope.$watch(function() {
            return angular.element($element).find('li.pnd-preview-single-type').css('width');
        }, function() {
            $scope.typeHidden = true;
            var liList;

            // if preview sticky item,
            if($scope.isSticky){
                $scope.typeHiddenPresent = $scope.prev;

            }else{

                liList = angular.element($element).find('div.pnd-preview-item-types').children('ul.pnd-preview-item-types-ul').children('li:not(.pnd-is-sticky)');

                // get <ul> width containing types
                var luWidth = parseInt(angular.element($element).find('div.pnd-preview-item-types').children('ul.pnd-preview-item-types-ul').css('width'), 10);

                // get height (with margin) of single <li> element
                var heightLiSingle = angular.element(liList[0]).outerHeight(true);

                // get div where types are shown
                var divTypes = angular.element('div.pnd-preview-item-types');

                // get padding div below type. It need to calculate the right height for div where types are shown
                var prevDivPadding = 0;
                if(angular.element('.pnd-preview-item-image').length > 0){
                    prevDivPadding = parseInt(angular.element('.pnd-preview-item-image').css('padding-top'), 10);
                } else if(angular.element('.pnd-preview-item-description').length > 0){
                    prevDivPadding = parseInt(angular.element('.pnd-preview-item-description').css('padding-top'), 10);

                }

                // set div types height
                var h = heightLiSingle + prevDivPadding;
                divTypes.css({
                    'height' : h
                });

                $scope.heigthTypesDiv = h;
                checkFitTypes(liList, luWidth);

            }

        });

        // when change width panel where preview is shown...
        $scope.$watch(function() {
            return angular.element('div.pnd-preview').width();
        }, function() {
            // ... update types visible and not
            var liList = angular.element($element).find('div.pnd-preview-item-types').children('ul.pnd-preview-item-types-ul').children('li');
            var luWidth = angular.element($element).find('div.pnd-preview-item-types').children('ul.pnd-preview-item-types-ul').width();
            checkFitTypes(liList, luWidth);


        });

        // check if there is at least a type that doesn't fit in <ul> width
        // set a flag in itemPreview scope
        var checkFitTypes = function(typeList, ulWidth) {
            // store current state. It is used when show types of sticky element
            $scope.prev = $scope.typeHiddenPresent;
            var tmpWidth = 0,
            // offset for caret icon
                offset = 30,
                widthToFit = ulWidth - offset,
                w;

            // for each types
            for(var i = 0; i < typeList.length; i++){
                // get width of <li> element and check if fit in <ul> width
                w = parseInt(angular.element(typeList[i]).css('width'), 10) + tmpWidth;
                if(w > widthToFit){

                    $scope.typeHiddenPresent = true;
                    return true;

                } else {
                    tmpWidth = w;
                }
            }

            $scope.typeHiddenPresent = false;
            return false;
        };


        // hide/show types
        $scope.showAlltypes = function() {
            // get div where types list is shown
            var div = angular.element('div.pnd-preview-item-types');

            // get current height of div where types list is shown
            var divHeight = angular.element('div.pnd-preview-item-types').height();

            // toggle types visibility

            // set height to auto to show all types
            // and set flag typeHidden to show right caret icon
            if(divHeight === $scope.heigthTypesDiv){
                $scope.typeHidden = false;
                div.css({
                    'height' : 'auto'
                });
            } else {
                // set height to fixed height, in this way show only few types
                // and set flag typeHidden to show right caret icon
                $scope.typeHidden = true;
                div.css({
                    'height' : $scope.heigthTypesDiv
                });
            }
        };

    });