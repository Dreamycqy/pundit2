angular.module('Pundit2.Annomatic')

.controller('AnnomaticPanelCtrl', function($scope, Annomatic, Consolidation, ItemsExchange,
    TextFragmentAnnotator, XpointersHelper, AnnotationSidebar,
    $window, $q) {

    //TODO hujiawei targets是所有满足css class条件的div的about属性值的集合
    //TODO hujiawei $scope.targets只是在方法getSuggestions中被调用了，所以可以方便地自定义逻辑
    //$scope.targets = Consolidation.getAvailableTargets(true);
    $scope.gotAnnotations = false;

    //TODO hujiawei 点击“扫描当前页面”调用的方法
    $scope.getSuggestions = function() {

        if ($scope.gotAnnotations) {
            return;
        }
        $scope.gotAnnotations = true;
        Annomatic.hardReset();
        AnnotationSidebar.toggleLoading();

        var nodes = [], namedClasses = ['author', 'notes', 'content', 'summary']; //XpointersHelper.options.namedContentClasses
        var safeUrl = XpointersHelper.getSafePageContext();

        for (var l = namedClasses.length; l--;) {
            var className = namedClasses[l];
            //nodes.push(angular.element('.' + className));
            angular.forEach(angular.element('.' + className), function(node) {
                  nodes.push(node);
            });
        }

        // for (var len = $scope.targets.length; len--;) {
        //     selectors.push("[about='" + $scope.targets[len] + "']");
        // }
        // selectors.join(',');
        // //TODO hujiawei 旧逻辑是要求html节点有about属性，如果它的css class也满足条件的话那就加入这个节点
        // angular.forEach(angular.element(selectors.join(',')), function(node) {
        //     for (var l = namedClasses.length; l--;) {
        //         if (angular.element(node).hasClass(namedClasses[l])) {
        //             nodes.push(node);
        //             break;
        //         }
        //     }
        // });

        //TODO hujiawei 前面的逻辑主要就是找到那些需要进行分析的html节点集合nodes
        Annomatic.log('Asking for annotations on ' + nodes.length + ' nodes: ', nodes);

        var promises = [];
        for (var n = nodes.length; n--;) {
            promises.push(Annomatic.getAnnotations(nodes[n]));
        }
        $q.all(promises).then(function() {
            // TOOD: add loading check
            AnnotationSidebar.toggleLoading();
            Consolidation.consolidate(ItemsExchange.getItemsByContainer(Annomatic.options.container));
            setTimeout(function() {
                TextFragmentAnnotator.showAll();
            }, 10);
        });
    };

    $scope.getSuggestionsArea = function() {
        Annomatic.getAnnotationByArea();
    };

    $scope.startReview = function() {
        Annomatic.reviewNext(0);
    };

    $scope.saveReview = function() {
        Annomatic.saveAll();
    };

    $scope.Annomatic = Annomatic;

    $scope.$watch(function() {
        return Annomatic.ann.savedById;
    }, function(annotationsList) {
        $scope.annotations = annotationsList;
    });

    // Watching changes on the select
    $scope.$watch('filteredTypes', function(filtered, oldFiltered) {
        if (typeof(filtered) === "undefined" && typeof(oldFiltered) === "undefined") {
            return;
        }
        Annomatic.setTypeFilter(filtered);
    }, true);

    // var annotationsRootNode = angular.element('div.panel-body');

});
