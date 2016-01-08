angular.module('Pundit2.AnnotationSidebar')

.constant('ANNOTATIONSIDEBARDEFAULTS', {

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar
     *
     * @description
     * `object`
     *
     * Configuration object for AnnotationSidebar module. By default,
     * AnnotationSidebar directive is collapsed and can be expanded. It
     * also contains filters that can be used to show or hide annotations.
     */


    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.isAnnotationSidebarExpanded
     *
     * @description
     * `boolean`
     *
     * Initial state of the sidebar, expanded or collapsed
     *
     * Default value:
     * <pre> isAnnotationSidebarExpanded: 'false' </pre>
     */
    isAnnotationSidebarExpanded: false,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.isFiltersShowed
     *
     * @description
     * `boolean`
     *
     * Initial state of the list of the filers, shown or hidden
     *
     * Default value:
     * <pre> isFiltersShowed: 'false' </pre>
     */
    isFiltersShowed: false,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.annotationsRefresh
     *
     * @description
     * `number`
     *
     * Delay in ms for the refresh of the annotations
     *
     * Default value:
     * <pre> annotationsRefresh: 300 </pre>
     */
    annotationsRefresh: 300,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.bodyClass
     *
     * @description
     * `string`
     *
     * Class added to the body when there is the sidebar in the page
     *
     * Default value:
     * <pre> bodyClass: 'pnd-annotation-sidebar-active' </pre>
     */
    bodyClass: 'pnd-annotation-sidebar-active',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.bodyExpandedClass
     *
     * @description
     * `string`
     *
     * Class added to the body when the sidebar is expanded
     *
     * Default value:
     * <pre> bodyExpandedClass: 'pnd-annotation-sidebar-expanded' </pre>
     */
    bodyExpandedClass: 'pnd-annotation-sidebar-expanded',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.bodyCollapsedClass
     *
     * @description
     * `string`
     *
     * Class added to the body when the sidebar is collpsed
     *
     * Default value:
     * <pre> bodyCollapsedClass: 'pnd-annotation-sidebar-collapsed' </pre>
     */
    bodyCollapsedClass: 'pnd-annotation-sidebar-collapsed',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.sidebarExpandedClass
     *
     * @description
     * `string`
     *
     * Class added to the sidebar when it is expanded
     *
     * Default value:
     * <pre> sidebarExpandedClass: pnd-annotation-sidebar-expanded' </pre>
     */
    sidebarExpandedClass: 'pnd-annotation-sidebar-expanded',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.sidebarCollapsedClass
     *
     * @description
     * `string`
     *
     * Class added to the sidebar when it is collapsed
     *
     * Default value:
     * <pre> sidebarCollapsedClass: 'pnd-annotation-sidebar-collapsed' </pre>
     */
    sidebarCollapsedClass: 'pnd-annotation-sidebar-collapsed',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.inputIconSearch
     *
     * @description
     * `string`
     *
     * Icon shown in the search input when it's empty
     *
     * Default value:
     * <pre> inputIconSearch: 'pnd-icon-search' </pre>
     */
    inputIconSearch: 'pnd-icon-search',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.inputIconFilter
     *
     * @description
     * `string`
     *
     * Icon shown in the filter input when it's empty
     *
     * Default value:
     * <pre> inputIconFilter: 'pnd-icon-filter' </pre>
     */
    inputIconFilter: 'pnd-icon-filter',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.inputIconClear
     *
     * @description
     * `string`
     *
     * Icon shown in the search input when it has some content
     *
     * Default value:
     * <pre> inputIconClear: 'pnd-icon-close' </pre>
     */
    inputIconClear: 'pnd-icon-close',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.annotationsPanelActive
     *
     * @description
     * `boolean`
     *
     * Panel active by default when opening the sidebar
     *
     * Default value:
     * <pre> annotationsPanelActive: 'true' </pre>
     */
    annotationsPanelActive: true,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.suggestionsPanelActive
     *
     * @description
     * `boolean`
     *
     * Panel active by default when opening the sidebar
     *
     * Default value:
     * <pre> suggestionsPanelActive: 'false' </pre>
     */
    suggestionsPanelActive: false,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.annotationHeight
     *
     * @description
     * `number`
     *
     * The height of the annotations in the sidebar for positioning
     *
     * Default value:
     * <pre> annotationHeight: 25 </pre>
     */
    annotationHeight: 25,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.startTop
     *
     * @description
     * `number`
     *
     * First top position of annotations in the sidebar
     *
     * Default value:
     * <pre> startTop: 55 </pre>
     */
    startTop: 55,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.maxHits
     *
     * @description
     * `number`
     *
     * Number of annotation operations for time
     *
     * Default value:
     * <pre> maxHits: 8 </pre>
     */
    maxHits: 8,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.bufferDelay
     *
     * @description
     * `number`
     *
     * Delay in ms for the refresh of the buffer
     *
     * Default value:
     * <pre> bufferDelay: 80 </pre>
     */
    bufferDelay: 80,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.bufferDelay
     *
     * @description
     * `boolean`
     *
     * undefined / true / false
     *
     * Default value:
     * <pre> bufferDelay: undefined </pre>
     */
    preventDelay: undefined,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.clientDomTemplate
     *
     * @description
     * `string`
     *
     * The Client will append the content of this template to the DOM to bootstrap this component
     *
     * Default value:
     * <pre> clientDomTemplate: 'src/AnnotationSidebar/ClientAnnotationSidebar.tmpl.html' </pre>
     */
    clientDomTemplate: 'src/AnnotationSidebar/ClientAnnotationSidebar.tmpl.html',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#AnnotationSidebar.debug
     *
     * @description
     * `boolean`
     *
     * Active debug log
     *
     * Default value:
     * <pre> debug: false </pre>
     */
    debug: false
})

.service('AnnotationSidebar', function(ANNOTATIONSIDEBARDEFAULTS, $rootScope, $filter, $timeout, $injector,
    BaseComponent, EventDispatcher, AnnotationsExchange, Annomatic, Consolidation, TypesHelper,
    BrokenHelper, ItemsExchange, NotebookExchange, TextFragmentAnnotator, NameSpace,
    PageItemsContainer, XpointersHelper, Analytics, Config, ImageAnnotator) {

    var annotationSidebar = new BaseComponent('AnnotationSidebar', ANNOTATIONSIDEBARDEFAULTS);

    var state = {
        isSidebarExpanded: annotationSidebar.options.isAnnotationSidebarExpanded,
        isFiltersExpanded: annotationSidebar.options.isFiltersShowed,
        isLoading: false,
        allAnnotations: {},
        filteredAnnotations: {},
        isAnnotationsPanelActive: annotationSidebar.options.annotationsPanelActive,
        isSuggestionsPanelActive: annotationSidebar.options.suggestionsPanelActive
    };

    var annotationsByDate = [],
        annotationsByPosition = [];

    var tempBrokenList = {};
    var firstSendBrokenAlert = true;

    var isEntitiesActive = annotationSidebar.isEntitesActive = PageItemsContainer.options.active;

    // Contains the list of elements relating to the annotations on the page
    var annotationsFilters = {
        authors: {},
        notebooks: {},
        predicates: {},
        types: {},
        broken: {}
    };

    var clientMode = Config.clientMode,
        Dashboard = clientMode === 'pro' ? $injector.get('Dashboard') : undefined;

    // TODO: take startPosition from element in sidebar
    var startPosition = annotationSidebar.options.startTop,
        toolbarHeight = clientMode === 'pro' ? $injector.get('Toolbar').options.toolbarHeight : 0;

    // Contains the values ​​of active filters
    annotationSidebar.filters = {
        freeText: {
            filterName: 'freeText',
            filterLabel: 'Free text',
            expression: ''
        },
        authors: {
            filterName: 'authors',
            filterLabel: 'Author',
            expression: []
        },
        notebooks: {
            filterName: 'notebooks',
            filterLabel: 'Notebooks',
            expression: []
        },
        fromDate: {
            filterName: 'fromDate',
            filterLabel: 'From date',
            expression: ''
        },
        toDate: {
            filterName: 'toDate',
            filterLabel: 'To date',
            expression: ''
        },
        predicates: {
            filterName: 'predicates',
            filterLabel: 'Predicates',
            expression: []
        },
        types: {
            filterName: 'types',
            filterLabel: 'Types',
            expression: []
        },
        broken: {
            filterName: 'broken',
            filterLabel: 'Broken',
            expression: ''
        }
    };

    if (isEntitiesActive) {
        annotationsFilters.entities = {};
        annotationSidebar.filters.entities = {
            filterName: 'entities',
            filterLabel: 'Entities',
            expression: []
        };
    }

    annotationSidebar.minHeightRequired = startPosition;

    // TODO add single filter add to annotationsFilters
    var resetPartialsAndAnnotationsList = function() {
        for (var i in annotationsFilters) {
            for (var j in annotationsFilters[i]) {
                annotationsFilters[i][j].partial = 0;
                annotationsFilters[i][j].annotationsList = {};
            }
        }
    };

    var getDashboardHeight = function() {
        return clientMode === 'pro' ? Dashboard.getContainerHeight() : 0;
    };

    var sortByKey = function(array, key) {
        return array.sort(function(a, b) {
            var x = a[key];
            var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    };

    var isValidDate = function(date) {
        return !isNaN(Date.parse(date));
    };

    var findFirstConsolidateItem = function(currentAnnotation) {
        var currentItem,
            targetList = clientMode === 'v2' ? currentAnnotation.hasTarget : currentAnnotation.entities;

        for (var t in targetList) {
            currentItem = ItemsExchange.getItemByUri(targetList[t]);
            if (typeof currentItem !== 'undefined' &&
                Consolidation.isConsolidated(currentItem)) {
                return currentItem;
            }
        }
    };

    var orderAndSetPos = function(optId, optHeight) {
        var annotations = (annotationSidebar.needToFilter() ? state.filteredAnnotations : state.allAnnotations);
        var currentTop;

        startPosition = annotationSidebar.options.startTop;

        if (typeof(optId) !== 'undefined' && typeof(optHeight) === 'number') {
            if (typeof state.allAnnotations[optId] !== 'undefined') {
                state.allAnnotations[optId].height = optHeight;
            }
        } else {
            annotationsByPosition.sort(function(a, b) {
                return a.top - b.top;
            });
        }

        angular.forEach(annotationsByPosition, function(annotation) {
            if (typeof annotations[annotation.id] !== 'undefined') {
                currentTop = annotation.top;

                if (currentTop > startPosition) {
                    annotation.realTop = currentTop;
                    startPosition = currentTop + annotation.height;
                } else {
                    annotation.realTop = startPosition;
                    startPosition += annotation.height;
                }
            }
        });

        annotationSidebar.minHeightRequired = startPosition + annotationSidebar.options.annotationHeight;
    };

    var setAnnotationPosition = function(annotation, dashboardHeight, optCheck, optId, optHeight) {
        var annotationHeight = 0,
            firstValid,
            currentItem;

        var top, imgRef, fragRefs, fragRef, xpathTemp;

        firstValid = annotation.firstConsolidableItem;
        annotationHeight = annotationSidebar.options.annotationHeight;

        if (typeof(firstValid) === 'undefined') {
            if (optCheck && optId === annotation.id) {
                annotationHeight = optHeight;
            }

            top = -3;
        } else {
            currentItem = firstValid;

            if (currentItem.isTextFragment()) {
                top = -1;
                fragRefs = TextFragmentAnnotator.getFragmentReferenceByUri(firstValid.uri);
                fragRef = typeof fragRefs !== 'undefined' ? fragRefs[fragRefs.length - 1] : undefined;

                if (typeof(fragRef) !== 'undefined' && typeof(fragRef.offset()) !== 'undefined') {
                    top = fragRef.offset().top - toolbarHeight - dashboardHeight;
                    // annotationSidebar.log("curr fr "+currentFragment + " alt "+ angular.element('.'+currentFragment).offset().top );
                } else {
                    annotationSidebar.log("Something wrong with the fragments of this annotation: ", annotation);
                }
            } else if (currentItem.isImage()) {
                top = -1;
                fragRefs = ImageAnnotator.getFragmentReferenceByUri(firstValid.uri);
                fragRef = typeof fragRefs !== 'undefined' ? fragRefs[fragRefs.length - 1] : undefined;

                if (typeof(fragRef) !== 'undefined' && typeof(fragRef.offset()) !== 'undefined') {
                    top = fragRef.offset().top - toolbarHeight - dashboardHeight;
                    // annotationSidebar.log("curr fr "+currentFragment + " alt "+ angular.element('.'+currentFragment).offset().top );
                } else {
                    annotationSidebar.log("Something wrong with the fragments of this annotation: ", annotation);
                }
            } else if (currentItem.isImageFragment()) {
                top = -1;
                xpathTemp = XpointersHelper.xPointerToXPath(currentItem.parentItemXP);
                imgRef = angular.element(xpathTemp.startNode.firstElementChild);

                if (typeof(imgRef.offset()) !== 'undefined') {
                    top = imgRef.offset().top - toolbarHeight - dashboardHeight;
                }
            } else if (currentItem.isWebPage()) {
                top = -2;
            }

            if (optCheck && optId === annotation.id) {
                annotationHeight = optHeight;
            }
        }

        annotation.top = top;
        annotation.height = annotationHeight;
    };

    var setAnnotationsPosition = function() {
        var annotations = (annotationSidebar.needToFilter() ? state.filteredAnnotations : state.allAnnotations),
            dashboardHeight = getDashboardHeight();

        if (Object.keys(annotations).length === 0) {
            return;
        }

        angular.forEach(annotations, function(annotation) {
            setAnnotationPosition(annotation, dashboardHeight);
        });

        orderAndSetPos();
    };

    var setAnnotationPositionAndHighlight = function() {
        var annotations = (annotationSidebar.needToFilter() ? state.filteredAnnotations : state.allAnnotations),
            currentItem,
            currentTop;

        TextFragmentAnnotator.hideAll();

        if (Object.keys(annotations).length === 0) {
            return;
        }

        startPosition = annotationSidebar.options.startTop;

        angular.forEach(annotationsByPosition, function(annotation) {
            // Skip annotations not included in the current view
            if (typeof annotations[annotation.id] !== 'undefined') {
                // Set position
                currentTop = annotation.top;

                if (currentTop > startPosition) {
                    annotation.realTop = currentTop;
                    startPosition = currentTop + annotation.height;
                } else {
                    annotation.realTop = startPosition;
                    startPosition += annotation.height;
                }

                // Set annotation in page (text fragment hightlight)
                for (var i in annotation.items) {
                    currentItem = annotation.items[i];
                    if (currentItem.isProperty() === false) {
                        if (Consolidation.isConsolidated(currentItem)) {
                            TextFragmentAnnotator.showByUri(currentItem.uri);
                        }
                    }
                }
            }
        });

        annotationSidebar.minHeightRequired = startPosition + annotationSidebar.options.annotationHeight;
    };

    var setBrokenInfo = function(annotation) {
        var isBroken = annotation.isBroken(),
            isBrokenYet = annotation.isBrokenYet;

        annotation.broken = isBroken;

        if (typeof(isBrokenYet) === 'string' && isBrokenYet === 'true') {
            isBrokenYet = true;
        } else {
            isBrokenYet = false;
        }

        // Add fixed annotation to BrokenHelper
        if (isBrokenYet && !isBroken) {
            BrokenHelper.addAnnotation(annotation.id, false);
        }

        // Add broken annotation to BrokenHelper
        if (!isBrokenYet && isBroken) {
            BrokenHelper.addAnnotation(annotation.id, true);
        }

        // Update annotationsFilters
        if (isBroken) {
            tempBrokenList[annotation.id] = annotation;
            // annotationsFilters.broken['uri:broken'].annotationsList[annotation.id] = annotation;
        }
    };

    var removeBroken = function(list, brokenList) {
        angular.forEach(brokenList, function(annotation) {
            if (typeof list[annotation.id] !== 'undefined') {
                delete list[annotation.id];
            }
        });

        return list;
    };

    var inizializeSemanticAnnotationFilters = function(annotation) {
        if (clientMode !== 'pro') {
            return;
        }

        var uriList = {};

        // Predicates
        angular.forEach(annotation.predicates, function(predicateUri) {
            if (typeof(uriList[predicateUri]) === 'undefined') {
                uriList[predicateUri] = {
                    uri: predicateUri
                };
                if (typeof(annotationsFilters.predicates[predicateUri]) === 'undefined') {
                    annotationsFilters.predicates[predicateUri] = {
                        uri: predicateUri,
                        label: annotation.items[predicateUri].label,
                        active: false,
                        partial: 1,
                        annotationsList: {}
                    };
                } else {
                    annotationsFilters.predicates[predicateUri].partial++;
                }
                annotationsFilters.predicates[predicateUri].annotationsList[annotation.id] = annotation;
            }
        });

        // Entities
        if (isEntitiesActive) {
            angular.forEach(annotation.entities, function(entUri) {
                if (typeof(uriList[entUri]) === 'undefined') {
                    uriList[entUri] = {
                        uri: entUri
                    };
                    if (typeof(annotationsFilters.entities[entUri]) === 'undefined') {
                        annotationsFilters.entities[entUri] = {
                            uri: entUri,
                            label: annotation.items[entUri].label, // TODO add check ?
                            active: false,
                            partial: 1,
                            annotationsList: {}
                        };
                    } else {
                        annotationsFilters.entities[entUri].partial++;
                    }
                    annotationsFilters.entities[entUri].annotationsList[annotation.id] = annotation;
                }
            });
        }

        // Types
        angular.forEach(annotation.items, function(singleItem) {
            angular.forEach(singleItem.type, function(typeUri) {
                if (typeof(uriList[typeUri]) === 'undefined') {
                    uriList[typeUri] = {
                        uri: typeUri
                    };
                    if (typeof(annotationsFilters.types[typeUri]) === 'undefined') {
                        annotationsFilters.types[typeUri] = {
                            uri: typeUri,
                            label: TypesHelper.getLabel(typeUri),
                            active: false,
                            partial: 1,
                            annotationsList: {}
                        };
                    } else {
                        annotationsFilters.types[typeUri].partial++;
                    }
                    annotationsFilters.types[typeUri].annotationsList[annotation.id] = annotation;
                }
            });
        });

        // FreeText 
        annotation.allLabels = '';

        for (var i in annotation.items) {
            var label = annotation.items[i].label,
                description = annotation.items[i].description;

            label = label.toLowerCase();
            description = typeof description !== 'undefined' ? description.toLowerCase() : '';
            annotation.allLabels = annotation.allLabels.concat(' ', label, description);
        }
        for (var subject in annotation.graph) {
            for (var predicate in annotation.graph[subject]) {
                for (var object in annotation.graph[subject][predicate]) {
                    var currentObject = annotation.graph[subject][predicate][object];
                    if (currentObject.type === 'literal') {
                        var literal = currentObject.value;
                        literal = literal.toLowerCase();
                        annotation.allLabels = annotation.allLabels.concat(' ', literal);
                    }
                }
            }
        }
    };

    var inizializeAuthorAndNotebookFilter = function(annotation) {
        if (clientMode !== 'pro') {
            return;
        }

        // Annotation authors
        if (typeof(annotationsFilters.authors[annotation.creator]) === 'undefined') {
            annotationsFilters.authors[annotation.creator] = {
                uri: annotation.creator,
                label: annotation.creatorName,
                active: false,
                partial: 1,
                annotationsList: {}
            };
        } else {
            annotationsFilters.authors[annotation.creator].partial++;
        }
        annotationsFilters.authors[annotation.creator].annotationsList[annotation.id] = annotation;

        // Annotation notebook
        var notebookId = annotation.isIncludedIn;
        var notebookUri = annotation.isIncludedInUri;
        if (typeof(annotationsFilters.notebooks[notebookUri]) === 'undefined') {
            var notebookName = "Downloading in progress";
            var cancelWatchNotebookName = $rootScope.$watch(function() {
                return NotebookExchange.getNotebookById(notebookId);
            }, function(nb) {
                if (typeof(nb) !== 'undefined') {
                    notebookName = nb.label;
                    annotationsFilters.notebooks[notebookUri].label = notebookName;
                    cancelWatchNotebookName();
                }
            });

            annotationsFilters.notebooks[notebookUri] = {
                uri: notebookUri,
                label: notebookName,
                notebookId: notebookId,
                active: false,
                partial: 1,
                annotationsList: {}
            };
        } else {
            annotationsFilters.notebooks[notebookUri].partial++;
        }
        annotationsFilters.notebooks[notebookUri].annotationsList[annotation.id] = annotation;
    };

    var inizializeCommentFilter = function(annotation) {
        if (clientMode !== 'pro') {
            return;
        }
        annotation.allLabels = annotation.graph[NameSpace.rdf.value][0].value;
    };

    // Updates the list of filters and annotation positions when the consolidation is completed
    var initializeFiltersAndPositions = function() {
        if (Object.keys(state.allAnnotations).length === 0) {
            return;
        }

        var dashboardHeight = getDashboardHeight();

        resetPartialsAndAnnotationsList();

        annotationsFilters.broken['uri:broken'] = {
            annotationsList: {}
        };
        BrokenHelper.resetQueques();

        startPosition = annotationSidebar.options.startTop;

        angular.forEach(state.allAnnotations, function(annotation) {
            var isMotivationAccepted = annotation.motivatedBy in NameSpace.motivation;
            annotation.firstConsolidableItem = findFirstConsolidateItem(annotation);
            setBrokenInfo(annotation);
            inizializeAuthorAndNotebookFilter(annotation);
            if (isMotivationAccepted === false) {
                annotation.motivatedBy = 'linking';
            }
            if (annotation.motivatedBy === 'linking') {
                inizializeSemanticAnnotationFilters(annotation);
            } else {
                inizializeCommentFilter(annotation);
            }
            setAnnotationPosition(annotation, dashboardHeight);
        });

        orderAndSetPos();
        if (BrokenHelper.getBrokenAnnotations().length && firstSendBrokenAlert) {
            EventDispatcher.sendEvent('Pundit.alert', {
                title: 'Broken annotations!',
                id: "WARNING",
                timeout: 12000,
                message: "It looks like some annotations on the page are broken: this can happen if the <strong>text of the page has changed in the last days</strong>.<br /><br />See if you can fix the broken annotations by editing them.<br /><br />Broken annotations are shown on the top right of the sidebar and are highlighted in red.<br /><a href=\"javascript:void(0)\" data-inner-callback=\"0\">Click here</a> to open first broken annotation",
                callbacks: [
                    function() {
                        var ba = BrokenHelper.getBrokenAnnotations();
                        if (ba.length > 0) {
                            var currentElement = angular.element('annotation-details[id="' + ba[0] + '"] .pnd-annotation-details-header');
                            if (!annotationSidebar.isAnnotationSidebarExpanded()) {
                                if (annotationSidebar.isFiltersExpanded()) {
                                    annotationSidebar.toggleFiltersContent();
                                }
                                annotationSidebar.toggle();
                                $timeout(function() {
                                    var dashboardHeight = getDashboardHeight();
                                    angular.element('body').animate({
                                        scrollTop: currentElement.offset().top - dashboardHeight - 60
                                    }, 'slow');
                                }, 100);
                            }
                            EventDispatcher.sendEvent('AnnotationSidebar.toggleAnnotation', ba[0]);
                        }
                        return true; // makes allert close immediatelly.
                    }
                ]
            });
            firstSendBrokenAlert = false;
        }
        BrokenHelper.sendQueques();

        annotationsFilters.broken['uri:broken'].annotationsList = removeBroken(angular.extend({}, state.allAnnotations), tempBrokenList);
    };

    var findBackward = function(index, annotations) {
        if (index === 0) {
            return index;
        }

        var val = annotations[index].created;

        for (var i = index - 1; i > 0; i--) {
            if (annotations[i].created !== val) {
                return i + 1;
            }
        }

        return 0;
    };

    var findForward = function(index, annotations) {
        if (index === annotations.length - 1) {
            return index;
        }

        var val = annotations[index].created;

        for (var i = index + 1; i < annotations.length; i++) {
            if (annotations[i].created !== val) {
                return i - 1;
            }
        }

        return annotations.length - 1;
    };

    var findDateFromIndex = function(val, start, end, annotations) {
        var index = (start + end) / 2;
        index = parseInt(index, 10);

        if (start === end) {
            return findBackward(start, annotations);
        }
        if (start === end - 1) {
            if (annotations[start].created < val) {
                return end;
            } else {
                return findBackward(start, annotations);
            }
        }

        if (annotations[index].created === val) {
            return findBackward(index, annotations);
        } else if (annotations[index].created < val) {
            start = index;
        } else {
            end = index;
        }

        return findDateFromIndex(val, start, end, annotations);
    };


    var findDateToIndex = function(val, start, end, annotations) {
        var index = (start + end) / 2;
        index = parseInt(index, 10);

        if (start === end) {
            return findForward(start, annotations);
        }
        if (start === end - 1) {
            if (annotations[end].created <= val) {
                return findForward(end, annotations);
            } else {
                return start;
            }
        }

        if (annotations[index].created === val) {
            return findForward(index, annotations);
        } else if (annotations[index].created < val) {
            start = index;
        } else {
            end = index;
        }

        return findDateToIndex(val, start, end, annotations);
    };


    var filterAnnotationsByDate = function(dateFrom, dateTo) {
        var results = {};

        var isValidFrom = isValidDate(dateFrom),
            isValidTo = isValidDate(dateTo);

        var annStartIndex,
            annEndIndex;

        if (annotationsByDate.length === 0) {
            return results;
        }

        if (!isValidFrom && !isValidTo) {
            return results;
        }

        if (!isValidFrom) {
            dateFrom = annotationsByDate[0].created;
        } else {
            dateFrom = dateFrom + 'T00:00:00';
        }

        if (!isValidTo) {
            dateTo = annotationsByDate[annotationsByDate.length - 1].created;
        } else {
            dateTo = dateTo + 'T23:59:59';
        }

        if (dateFrom > dateTo) {
            return results;
        }

        annStartIndex = findDateFromIndex(dateFrom, 0, annotationsByDate.length - 1, annotationsByDate);
        annEndIndex = findDateToIndex(dateTo, annStartIndex, annotationsByDate.length - 1, annotationsByDate);

        for (var i = annStartIndex; i <= annEndIndex; i++) {
            if (typeof annotationsByDate[i] !== 'undefined') {
                results[annotationsByDate[i].id] = annotationsByDate[i];
            }
        }

        annotationSidebar.log('DateFrom ' + dateFrom + ' DateTo ' + dateTo);

        return results;
    };

    var intersection = function(a, b) {
        var results = {};

        if (Object.keys(a).length < Object.keys(b).length) {
            for (var i in a) {
                if (typeof b[i] !== 'undefined') {
                    results[i] = a[i];
                }
            }
        } else {
            for (var j in b) {
                if (typeof a[j] !== 'undefined') {
                    results[j] = b[j];
                }
            }
        }

        return results;
    };

    var multipleIntersection = function(obj) {
        var firstTime = true;
        var results = {};

        for (var i in obj) {
            if (Object.keys(obj[i]).length > 0) {
                if (firstTime) {
                    results = obj[i];
                    firstTime = false;
                } else {
                    results = intersection(results, obj[i]);
                }
            }
        }

        return results;
    };

    var getAnnotationsOfSpecificFilter = function(filterKey, activeItems) {
        var results = {};
        for (var i in activeItems) {
            if (typeof annotationsFilters[filterKey][activeItems[i]] !== 'undefined') {
                angular.extend(results, annotationsFilters[filterKey][activeItems[i]].annotationsList);
            }
        }

        return results;
    };

    var filterAnnotationsByLabel = function(label, annotationsList) {
        if (label === '') {
            return annotationsList;
        }

        var str = label.toLowerCase().replace(/\s+/g, ' '),
            strParts = str.split(' '),
            reg = new RegExp(strParts.join('.*'));

        var results = {};

        angular.forEach(annotationsList, function(annotation) {
            if (annotation.allLabels.toLowerCase().match(reg) !== null) {
                results[annotation.id] = annotation;
            }
        });

        return results;
    };

    var isFilterUriActive = function(filter, uri) {
        var res = annotationSidebar.filters[filter].expression.indexOf(uri);
        return res !== -1;
    };

    var updatePartialFiltersCount = function(annotationsFilters, subFiltersSet, filteredAnnotations) {
        var subFiltersSetCopy = {},
            filtersIntersection,
            filtersKeys;

        angular.forEach(annotationsFilters, function(filter, filterKey) {
            for (var uri in filter) {
                if (isFilterUriActive(filterKey, uri) === false) {
                    for (var i in subFiltersSet) {
                        subFiltersSetCopy[i] = subFiltersSet[i];
                    }

                    subFiltersSetCopy[filterKey] = getAnnotationsOfSpecificFilter(filterKey, [uri]);

                    filtersIntersection = multipleIntersection(subFiltersSetCopy);
                    filtersKeys = Object.keys(filtersIntersection);
                    filter[uri].partial = filtersKeys.length;
                } else {
                    filtersIntersection = intersection(filter[uri].annotationsList, filteredAnnotations);
                    filtersKeys = Object.keys(filtersIntersection);
                    filter[uri].partial = filtersKeys.length;
                }
            }
        });

        annotationSidebar.log('Updated annotationsFilters with partial counting ', annotationsFilters);
    };

    var wipePartialFilterCount = function() {
        var filter;
        angular.forEach(annotationsFilters, function(filterGroup) {
            for (var i in filterGroup) {
                filter = filterGroup[i];
                filter.partial = 0;
            }
        });
    };

    var getFilteredAnnotations = function(activeFilters, annotationsFilters) {
        var exceptionsCheckList = ['freeText', 'fromDate', 'toDate', 'broken'],
            exceptionsCheckIndex = -1;

        var atLeastOneActiveFilter = false,
            subActiveFiltersList = [],
            subFiltersSet = {},
            currentAnnotationsList;

        var fromDate = activeFilters.fromDate.expression,
            toDate = activeFilters.toDate.expression;

        var freeTextSearchLabel = activeFilters.freeText.expression,
            brokenValue = annotationSidebar.filters.broken.expression;

        var results = {};

        angular.forEach(activeFilters, function(filter, key) {
            exceptionsCheckIndex = exceptionsCheckList.indexOf(key);

            // if there aren't subfilter active or we should skip a specific subfilter 
            if (exceptionsCheckIndex !== -1 || filter.expression.length === 0) {
                if (exceptionsCheckIndex === -1) {
                    subFiltersSet[key] = {};
                }
                return;
            }

            subActiveFiltersList = filter.expression;
            currentAnnotationsList = getAnnotationsOfSpecificFilter(key, subActiveFiltersList);

            subFiltersSet[key] = currentAnnotationsList;

            if (subActiveFiltersList.length > 0) {
                atLeastOneActiveFilter = true;
            }
        });

        if (brokenValue === 'hideBroken') {
            subFiltersSet.broken = annotationsFilters.broken['uri:broken'].annotationsList;
            atLeastOneActiveFilter = true;
        }

        if (isValidDate(fromDate) || isValidDate(toDate)) {
            subFiltersSet.date = filterAnnotationsByDate(fromDate, toDate);
            atLeastOneActiveFilter = true;
        }

        if (freeTextSearchLabel !== '') {
            subFiltersSet.freeText = filterAnnotationsByLabel(freeTextSearchLabel, state.allAnnotations);
            atLeastOneActiveFilter = true;
        }

        if (typeof subFiltersSet.freeText !== 'undefined' &&
            Object.keys(subFiltersSet.freeText).length === 0) {
            results = {};
            wipePartialFilterCount(annotationsFilters);
        } else {
            results = atLeastOneActiveFilter ? multipleIntersection(subFiltersSet) : angular.extend({}, state.allAnnotations);
            updatePartialFiltersCount(annotationsFilters, subFiltersSet, results);
        }

        EventDispatcher.sendEvent('AnnotationSidebar.filteredAnnotationsUpdate');
        annotationSidebar.log(Object.keys(results).length + ' multi result ', results);

        return results;
    };

    annotationSidebar.resetVisibility = function() {
        angular.forEach(state.allAnnotations, function(annotation) {
            annotation.visible = true;
        });
    };

    // Expands or collapses the sidebar
    annotationSidebar.toggle = function() {
        state.isSidebarExpanded = !state.isSidebarExpanded;
        EventDispatcher.sendEvent('AnnotationSidebar.toggle', state.isSidebarExpanded);
    };

    annotationSidebar.toggleLoading = function() {
        state.isLoading = !state.isLoading;
        EventDispatcher.sendEvent('AnnotationSidebar.toggleLoading', state.isLoading);
    };

    // Show / hide the list of the filters in the sidebar
    annotationSidebar.toggleFiltersContent = function() {
        state.isFiltersExpanded = !state.isFiltersExpanded;
        EventDispatcher.sendEvent('AnnotationSidebar.toggleFiltersContent', state.isFiltersExpanded);
        Analytics.track('buttons', 'click', 'sidebar--' + (state.isFiltersExpanded ? 'showFilters' : 'filters--hide'));
    };
    // Check if the sidebar is expanded
    annotationSidebar.isAnnotationSidebarExpanded = function() {
        return state.isSidebarExpanded;
    };
    // Check if the list of the filters is visible
    annotationSidebar.isFiltersExpanded = function() {
        return state.isFiltersExpanded;
    };

    annotationSidebar.isAnnotationsPanelActive = function() {
        return state.isAnnotationsPanelActive;
    };
    annotationSidebar.activateAnnotationsPanel = function() {
        if (state.isFiltersExpanded) {
            annotationSidebar.toggleFiltersContent();
        }

        if (state.isSuggestionsPanelActive) {
            Annomatic.stop();
            EventDispatcher.sendEvent('AnnotationSidebar.activateAnnotationsPanel');
            Consolidation.wipe();
            Consolidation.consolidateAll();
        }

        state.isAnnotationsPanelActive = true;
        state.isSuggestionsPanelActive = false;
    };

    annotationSidebar.isSuggestionsPanelActive = function() {
        return state.isSuggestionsPanelActive;
    };
    annotationSidebar.activateSuggestionsPanel = function() {
        if (state.isAnnotationsPanelActive) {
            if (state.isFiltersExpanded) {
                state.isFiltersExpanded = false;
            }
            Consolidation.wipe();
            EventDispatcher.sendEvent('Pundit.preventDelay', true);
            Annomatic.run();
        }

        state.isSuggestionsPanelActive = true;
        state.isAnnotationsPanelActive = false;
    };

    annotationSidebar.getAllAnnotations = function() {
        return state.allAnnotations;
    };

    annotationSidebar.getAllAnnotationsPositioned = function() {
        return annotationsByPosition;
    };

    // Get the object of filtered annotations
    annotationSidebar.getAllAnnotationsFiltered = function(filters) {
        var activeFilters = typeof filers !== 'undefined' ? filters : annotationSidebar.filters;

        state.filteredAnnotations = getFilteredAnnotations(activeFilters, annotationsFilters);
        setAnnotationPositionAndHighlight();

        return state.filteredAnnotations;
    };

    annotationSidebar.getAnnotationsFilters = function() {
        return annotationsFilters;
    };

    annotationSidebar.getMinDate = function() {
        var firstAnnotation = annotationsByDate[0],
            minDate;

        if (typeof firstAnnotation !== 'undefined') {
            minDate = firstAnnotation.created;
        }

        return minDate;
    };

    annotationSidebar.getMaxDate = function() {
        var lastAnnotation = annotationsByDate[annotationsByDate.length - 1],
            maxDate;

        if (typeof lastAnnotation !== 'undefined') {
            maxDate = lastAnnotation.created;
        }

        return maxDate;
    };

    annotationSidebar.getLoadingStatus = function() {
        return state.isLoading;
    };

    annotationSidebar.setAllPosition = function(id, height) {
        orderAndSetPos(id, height);
    };

    annotationSidebar.setAnnotationHeight = function(optId, optHeight) {
        if (typeof(optId) !== 'undefined' && typeof(optHeight) === 'number') {
            if (typeof state.allAnnotations[optId] !== 'undefined') {
                state.allAnnotations[optId].height = optHeight;
            }
        }
    };

    annotationSidebar.setAnnotationsPosition = function() {
        setAnnotationsPosition();
    };

    // Check if some filters are active
    annotationSidebar.needToFilter = function() {
        for (var f in annotationSidebar.filters) {
            var current = annotationSidebar.filters[f].expression;
            if (typeof(current) === 'string' && current !== '') {
                return true;
            } else if (angular.isArray(current) && current.length > 0) {
                return true;
            }
        }
        return false;
    };

    // Activate / Disable a specific filter
    annotationSidebar.toggleActiveFilter = function(list, uri) {
        annotationsFilters[list][uri].active = !annotationsFilters[list][uri].active;
        Analytics.track('buttons', 'click', 'sidebar--filters--filtersPanel--' + list + '--' + (annotationsFilters[list][uri].active ? 'active' : 'inactive'));
    };

    annotationSidebar.setFilter = function(filterKey, uriValue) {
        var currentIndex;
        var currentElementInList;
        var currentFilter = annotationSidebar.filters[filterKey].expression;
        if (typeof(currentFilter) === 'string') {
            annotationSidebar.filters[filterKey].expression = uriValue;
        } else if (typeof(currentFilter) === 'object') {
            currentIndex = annotationSidebar.filters[filterKey].expression.indexOf(uriValue);
            currentElementInList = annotationsFilters[filterKey][uriValue];
            if (currentIndex === -1 && typeof(currentElementInList) !== 'undefined') {
                currentElementInList.active = true;
                annotationSidebar.filters[filterKey].expression.push(uriValue);
            }
        }
    };

    // Disable a specific filter 
    annotationSidebar.removeFilter = function(filterKey, uriValue) {
        var currentIndex;
        var currentFilter = annotationSidebar.filters[filterKey].expression;
        if (typeof(currentFilter) === 'string') {
            annotationSidebar.filters[filterKey].expression = '';
        } else if (typeof(currentFilter) === 'object') {
            currentIndex = annotationSidebar.filters[filterKey].expression.indexOf(uriValue);
            if (currentIndex !== -1) {
                annotationsFilters[filterKey][uriValue].active = false;
                annotationSidebar.filters[filterKey].expression.splice(currentIndex, 1);
            }
        }
    };

    // Clear all active filters
    annotationSidebar.resetFilters = function() {
        angular.forEach(annotationSidebar.filters, function(filter) {
            if (typeof(filter.expression) === 'string') {
                filter.expression = '';
            } else if (typeof(filter.expression) === 'object') {
                for (var f in annotationsFilters[filter.filterName]) {
                    annotationsFilters[filter.filterName][f].active = false;
                }
                filter.expression = [];
            }
        });

        Analytics.track('buttons', 'click', 'sidebar--filters--removeAllFilters');
    };

    annotationSidebar.showAnnotation = function(annId) {
        // TODO: nain nain nain!!!
        angular.element('annotation-details[id="' + annId + '"] .pnd-annotation-details-header').trigger('click');
    };

    EventDispatcher.addListeners(
        [
            'Consolidation.consolidateAll',
            'AnnotationSidebar.forceUpdate',
            'Pundit.forceUpdate'
        ],
        function(e) {
            if (Consolidation.getConsolidationRequestNumber() !== 0 &&
                e.name !== 'Pundit.forceUpdate') {
                annotationSidebar.log('Waiting for consolidation');
                return;
            }
            annotationSidebar.log('Update annotations in sidebar');

            var annotations = AnnotationsExchange.getAnnotations();
            var annotationsList = AnnotationsExchange.getAnnotationsHash();

            annotationsByPosition = angular.extend([], annotations);
            annotationsByDate = angular.extend([], annotations);
            annotationsByDate = sortByKey(annotationsByDate, 'created');
            state.allAnnotations = angular.extend({}, annotationsList);
            // TODO: inizialize as first operation
            initializeFiltersAndPositions();
        });

    EventDispatcher.addListener('ResizeManager.resize', function() {
        if (state.isLoading === false) {
            setAnnotationsPosition();
            annotationSidebar.log('Position annotations on resize');
        }
    });

    // TODO: find a better flow for user experience
    EventDispatcher.addListener('MyItems.itemAdded', function() {
        annotationSidebar.resetFilters();
    });

    EventDispatcher.addListener('Client.hide', function( /*e*/ ) {
        if (state.isSidebarExpanded) {
            annotationSidebar.toggle();
        }
    });

    annotationSidebar.log('Component running');
    return annotationSidebar;
});