angular.module('Pundit2.AnnotationSidebar')

.controller('AnnotationSidebarCtrl', function($scope, $filter, $timeout, $document, $window,
    EventDispatcher, AnnotationSidebar, Dashboard, Config, Analytics) {

    var bodyClasses = AnnotationSidebar.options.bodyExpandedClass + ' ' + AnnotationSidebar.options.bodyCollapsedClass;
    var sidebarClasses = AnnotationSidebar.options.sidebarExpandedClass + ' ' + AnnotationSidebar.options.sidebarCollapsedClass;

    // var html = angular.element('html');
    var body = angular.element('body');
    var container = angular.element('.pnd-annotation-sidebar-container');
    var header = angular.element('.pnd-annotation-sidebar-header');
    // var content = angular.element('.pnd-annotation-sidebar-content');

    var toolbarHeight = parseInt(angular.element('toolbar nav').css('height'), 10);

    var state = {
        toolbarHeight: toolbarHeight,
        newMarginTopSidebar: 0,
        sidebarCurrentHeight: 0,
        sidebarNewHeight: 0
    };

    var search = {
        iconMagnifier: AnnotationSidebar.options.inputIconSearch,
        iconFilter: AnnotationSidebar.options.inputIconFilter,
        clean: AnnotationSidebar.options.inputIconClear
    };

    var delay;

    $scope.annotationSidebar = AnnotationSidebar;
    $scope.filters = AnnotationSidebar.getFilters();
    $scope.isAnnomaticActive = Config.isModuleActive('Annomatic');
    $scope.isAnnotationSidebarExpanded = AnnotationSidebar.options.isAnnotationSidebarExpanded;
    $scope.isLoadingData = false;
    $scope.isLoading = false;

    $scope.filterTypeExpanded = '';

    $scope.fromMinDate = new Date();
    $scope.toMinDate = new Date();
    $scope.fromMaxDate = new Date();
    $scope.fromToDate = new Date();

    body.css('position', 'static');
    container.css('height', body.innerHeight() + 'px');

    // Start reading the default
    if (AnnotationSidebar.options.isAnnotationSidebarExpanded) {
        body.addClass(AnnotationSidebar.options.bodyExpandedClass);
        container.addClass(AnnotationSidebar.options.sidebarExpandedClass);
    } else {
        body.addClass(AnnotationSidebar.options.bodyCollapsedClass);
        container.addClass(AnnotationSidebar.options.sidebarCollapsedClass);
    }

    // Annotation sidebar height
    var resizeSidebarHeight = function() {
        var minHeightSidebar = AnnotationSidebar.minHeightRequired;
        var bodyHeight = body.innerHeight();
        var documentHeight = $document.innerHeight();
        var difference;

        // TODO: save old documentHeight and reset the view
        state.sidebarNewHeight = Math.max(bodyHeight, documentHeight, minHeightSidebar);
        state.sidebarCurrentHeight = container.innerHeight();

        if (Dashboard.isDashboardVisible()) {
            difference = state.toolbarHeight + Dashboard.getContainerHeight();
        } else {
            difference = state.toolbarHeight;
        }

        state.sidebarNewHeight = state.sidebarNewHeight - difference;

        if (state.sidebarNewHeight !== state.sidebarCurrentHeight) {
            container.css('height', state.sidebarNewHeight + 'px');
        }
    };

    // Temp fix for bs-datepicker issues min value
    var setMin = function(currentMin) {
        var newMinDate = new Date((currentMin && !isNaN(Date.parse(currentMin))) ? Date.parse(currentMin) : 0);
        newMinDate.setDate(newMinDate.getDate() - 1);

        return $filter('date')(newMinDate, 'yyyy-MM-dd');
    };

    $scope.isSuggestionsPanelActive = function() {
        return AnnotationSidebar.isSuggestionsPanelActive();
    };
    $scope.activateSuggestionsPanel = function() {
        AnnotationSidebar.activateSuggestionsPanel();
    };

    $scope.isAnnotationsPanelActive = function() {
        return AnnotationSidebar.isAnnotationsPanelActive();
    };
    $scope.activateAnnotationsPanel = function() {
        AnnotationSidebar.activateAnnotationsPanel();
    };

    $scope.updateSearch = function(freeText) {
        $timeout.cancel(delay);
        delay = $timeout(function() {
            AnnotationSidebar.filters.freeText.expression = freeText;
        }, 1000);
    };

    $scope.isFilterLabelShowed = function(currentInputText) {
        if (typeof(currentInputText) === 'string') {
            return currentInputText.length > 0;
        }
    };

    $scope.toggleFilterList = function(event, filterType) {
        var pndFilterShowClass = 'pnd-annotation-sidebar-filter-show';
        var previousElement = angular.element('.' +pndFilterShowClass);
        var currentElement = angular.element(event.target.parentElement.parentElement);

        $scope.searchAuthors = '';
        $scope.searchNotebooks = '';
        $scope.searchTypes = '';
        $scope.searchPredicates = '';
        $scope.searchEntities = '';

        // Close all filter list and toggle the current
        previousElement.not(currentElement).removeClass(pndFilterShowClass);
        currentElement.toggleClass(pndFilterShowClass);

        if (currentElement.hasClass(pndFilterShowClass)) {
            $scope.filterTypeExpanded = filterType;
        } else {
            $scope.filterTypeExpanded = '';
        }

        if (typeof filterType === 'undefined') {
            filterType = angular.element(event.target).text().trim();
        }
        Analytics.track('buttons', 'click', 'sidebar--filters--filtersPanel--' + filterType);
    };

    $scope.toggleFilter = function(currentFilter, currentUri) {
        var indexFilter = AnnotationSidebar.filters[currentFilter].expression.indexOf(currentUri);
        if (indexFilter === -1) {
            AnnotationSidebar.filters[currentFilter].expression.push(currentUri);
            AnnotationSidebar.toggleActiveFilter(currentFilter, currentUri);
        } else {
            AnnotationSidebar.filters[currentFilter].expression.splice(indexFilter, 1);
            AnnotationSidebar.toggleActiveFilter(currentFilter, currentUri);
        }
    };

    $scope.toggleBrokenAnnotations = function() {
        var trackingFilterLabel = '';
        if (AnnotationSidebar.filters.broken.expression === '') {
            AnnotationSidebar.filters.broken.expression = 'hideBroken';
            trackingFilterLabel = 'hideBroken';
        } else {
            AnnotationSidebar.filters.broken.expression = '';
            trackingFilterLabel = 'showBroken';
        }
        Analytics.track('buttons', 'click', 'sidebar--filters--filtersPanel--' + trackingFilterLabel);
    };

    $scope.setSearchIcon = function(str) {
        if (typeof(str) === 'undefined' || str === '') {
            return search.iconMagnifier;
        } else {
            return search.clean;
        }
    };

    $scope.setFilterIcon = function(str) {
        if (typeof(str) === 'undefined' || str === '') {
            return search.iconFilter;
        } else {
            return search.clean;
        }
    };

    EventDispatcher.addListener('Pundit.loading', function(e) {
        var currentState = e.args;
        if (currentState !== $scope.isLoadingData) {
            AnnotationSidebar.toggleLoading();
            $scope.isLoadingData = currentState;
        }
    });

    EventDispatcher.addListener('AnnotationSidebar.toggleLoading', function(e) {
        $scope.isLoading = e.args;
    });

    // Watch annotation sidebar expanded or collapsed
    EventDispatcher.addListener('AnnotationSidebar.toggle', function(e) {
        var currentState = e.args;
        if (currentState !== $scope.isAnnotationSidebarExpanded) {
            body.toggleClass(bodyClasses);
            container.toggleClass(sidebarClasses);

            AnnotationSidebar.setAnnotationsPosition();

            $scope.isAnnotationSidebarExpanded = currentState;
        }
    });

    // Watch filters expanded or collapsed
    EventDispatcher.addListener('AnnotationSidebar.toggleFiltersContent', function(e) {
        $scope.isFiltersShowed = e.args;
    });

    // Watch annotations
    $scope.$watch(function() {
        return AnnotationSidebar.getAllAnnotations();
    }, function(currentAnnotations) {
        $scope.allAnnotations = currentAnnotations;
        $scope.allAnnotationsLength = Object.keys($scope.allAnnotations).length;
        if (AnnotationSidebar.needToFilter()) {
            $scope.annotations = AnnotationSidebar.getAllAnnotationsFiltered(AnnotationSidebar.filters);
            $scope.annotationsLength = Object.keys($scope.annotations).length;
        } else {
            $scope.annotations = currentAnnotations;
            $scope.annotationsLength = Object.keys($scope.annotations).length;
        }
    });

    $scope.$watch(function() {
        return AnnotationSidebar.getMinDate();
    }, function(minDate) {
        if (typeof(minDate) !== 'undefined') {
            var newMinDate = $filter('date')(minDate, 'yyyy-MM-dd');
            $scope.fromMinDate = setMin(newMinDate);
            if (AnnotationSidebar.filters.fromDate.expression === '') {
                $scope.toMinDate = setMin(newMinDate);
            }
        }
    });
    $scope.$watch(function() {
        return AnnotationSidebar.getMaxDate();
    }, function(maxDate) {
        if (typeof(maxDate) !== 'undefined') {
            var newMaxDate = $filter('date')(maxDate, 'yyyy-MM-dd');
            $scope.toMaxDate = newMaxDate;
            if (AnnotationSidebar.filters.toDate.expression === '') {
                $scope.fromMaxDate = newMaxDate;
            }
        }
    });
    $scope.$watch('annotationSidebar.filters.fromDate.expression', function(currentFromDate) {
        if (typeof(currentFromDate) !== 'undefined') {
            $scope.toMinDate = setMin(currentFromDate);
        } else {
            $scope.toMinDate = setMin($scope.fromMinDate);
        }
    });
    $scope.$watch('annotationSidebar.filters.toDate.expression', function(currentToDate) {
        if (typeof(currentToDate) !== 'undefined') {
            $scope.fromMaxDate = currentToDate;
        } else {
            $scope.fromMaxDate = $scope.toMaxDate;
        }
    });

    $scope.$watch('annotationSidebar.filters', function(currentFilters) {
        if (AnnotationSidebar.filters.freeText.expression === '') {
            $scope.freeText = '';
        }
        $scope.annotations = AnnotationSidebar.getAllAnnotationsFiltered(currentFilters);
        $scope.annotationsLength = Object.keys($scope.annotations).length;
    }, true);

    // TODO Use EventDispatcher
    // Watch dashboard height for top of sidebar
    $scope.$watch(function() {
        return Dashboard.getContainerHeight();
    }, function(dashboardHeight) {
        state.newMarginTopSidebar = state.toolbarHeight + dashboardHeight;
        container.css('margin-top', state.newMarginTopSidebar + 'px');
    });
    $scope.$watch(function() {
        return Dashboard.isDashboardVisible();
    }, function(dashboardVisibility) {
        if (dashboardVisibility) {
            state.newMarginTopSidebar = state.toolbarHeight + Dashboard.getContainerHeight();
            container.css('margin-top', state.newMarginTopSidebar + 'px');
            header.css('top', state.newMarginTopSidebar + 'px');
        } else {
            container.css('margin-top', state.toolbarHeight + 'px');
            header.css('top', state.toolbarHeight + 'px');
        }
    });

    $scope.$watch(function() {
        return AnnotationSidebar.minHeightRequired;
    }, function() {
        resizeSidebarHeight();
    });

    $scope.$watch(function() {
        return $document.innerHeight();
    }, function() {
        resizeSidebarHeight();
    });

    angular.element($window).bind('resize', function() {
        resizeSidebarHeight();
    });

    AnnotationSidebar.log('Controller Run');
});