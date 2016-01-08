angular.module('Pundit2.Annotators')

// TODO: linting, refactoring and so on .. 

.constant('IMAGEANNOTATORDEFAULTS', {
    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#ImageAnnotator
     *
     * @description
     * `object`
     *
     * Configuration object for Image Annotator module.
     */

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TextFragmentAnnotator.addIcon
     *
     * @description
     * `boolean`
     *
     * Add or not the icon to the text fragments
     *
     * Default value:
     * <pre> addIcon: 'true' </pre>
     */
    addIcon: false
})

.service('ImageAnnotator', function(NameSpace, BaseComponent, $location,
    Consolidation, XpointersHelper, ImageFragmentAnnotatorHelper, EventDispatcher, $q, $rootScope, ItemsExchange, Config, $compile) {

    // Create the component and declare what we deal with: text
    var imageAnnotator = new BaseComponent('ImageAnnotator');

    imageAnnotator.label = 'image';
    imageAnnotator.type = NameSpace.types[imageAnnotator.label];
    imageAnnotator.labelIF = 'imagePart';
    imageAnnotator.typeIF = NameSpace.fragments[imageAnnotator.labelIF];

    var fragmentIds = {},
        fragmentsRefs = {},
        fragmentsRefsById = {},
        i = 0,
        fragmentById = [],
        tempFragmentIds = {},
        lastTemporaryConsolidable,
        temporaryConsolidated = {},
        imgConsClass = 'pnd-cons-img';

    imageAnnotator.isConsolidable = function(item) {
        var xpointerURI;

        if (!angular.isArray(item.type)) {
            imageAnnotator.log('Item not valid: malformed type' + item.uri);
            return false;
        } else if (item.type.length === 0) {
            imageAnnotator.log('Item not valid: types len 0' + item.uri);
            return false;
        } else if ((item.type.indexOf(imageAnnotator.type) === -1) && (item.type.indexOf(imageAnnotator.typeIF) === -1)) {
            imageAnnotator.log('Item not valid: not have type image ' + item.uri);
            return false;
        } else {
            if (item.type.indexOf(imageAnnotator.type) !== -1) {
                xpointerURI = item.xpointer;
            } else if (item.type.indexOf(imageAnnotator.typeIF) !== -1) {
                xpointerURI = item.parentItemXP;
            }
            if (!XpointersHelper.isValidXpointerURI(xpointerURI)) {
                imageAnnotator.log('Item not valid: not a valid xpointer uri: ' + xpointerURI);
                return false;
            } else if (!XpointersHelper.isValidXpointer(xpointerURI)) {
                imageAnnotator.log('Item not valid: not consolidable on this page: ' + xpointerURI);
                return false;
            }
        }

        // TODO: it's a valid image fragment if:
        // - one of its types is the fragment-image type [done]
        // - has a part of
        // - .selector contains something
        // ... etc etc
        imageAnnotator.log('Item valid: ' + item.label);
        return true;
    };

    imageAnnotator.consolidate = function(items) {
        imageAnnotator.log('Consolidating!');

        if (!angular.isObject(items)) {
            imageAnnotator.err('Items not valid: malformed object', items);
            return deferred.resolve();
        }

        var updateDOMPromise,
            compilePromise,
            uri,
            currentUri,
            xpointers = [],
            parentItemXPList = {};

        for (uri in items) {
            if (items[uri].type.indexOf(imageAnnotator.type) !== -1) {
                currentUri = items[uri].xpointer;
            } else if (items[uri].type.indexOf(imageAnnotator.typeIF) !== -1) {
                currentUri = items[uri].parentItemXP;
            }
            xpointers.push(currentUri);
            if (typeof(items[uri].polygon) !== 'undefined') {
                if (typeof(parentItemXPList[items[uri].parentItemXP]) !== 'undefined') {
                    parentItemXPList[items[uri].parentItemXP].push(items[uri].polygon);
                } else {
                    parentItemXPList[items[uri].parentItemXP] = [items[uri].polygon];
                }
            }
            fragmentIds[uri] = ['imgf-' + i];
            tempFragmentIds[currentUri] = ['imgf-' + i];
            fragmentById['imgf-' + i] = {
                uri: uri,
                bits: [],
                bitsObj: {},
                item: items[uri]
            };
            i++;
        }

        var xpaths = XpointersHelper.getXPathsFromXPointers(xpointers),
            sorted = XpointersHelper.splitAndSortXPaths(xpaths),
            // After splitting and sorting each bit has a list of fragment ids it belongs to.
            // Instead of using classes, these ids will be saved in a node attribute.
            xpathsFragmentIds = XpointersHelper.getClassesForXpaths(xpointers, sorted, xpaths, tempFragmentIds);

        updateDOMPromise = XpointersHelper.updateDOM(sorted, XpointersHelper.options.wrapNodeClass, xpathsFragmentIds);
        updateDOMPromise.then(function() {
            var fragmentId;
            if (Object.keys(fragmentsRefsById).length > 0) {
                for (var uri in fragmentIds) {
                    fragmentId = fragmentIds[uri];
                    fragmentsRefs[uri] = fragmentsRefsById[fragmentId];
                }
            }
        });
    };

    imageAnnotator.getFragmentReferenceByUri = function(uri) {
        if (typeof(fragmentsRefs[uri]) !== 'undefined') {
            return fragmentsRefs[uri];
        }
    };

    imageAnnotator.getFragmentIdByUri = function(uri) {
        if (typeof(fragmentIds[uri]) !== 'undefined') {
            return fragmentIds[uri];
        }
    };

    imageAnnotator.getFragmentUriById = function(id) {
        if (typeof(fragmentById[id]) !== 'undefined') {
            return fragmentById[id].uri;
        }
    };

    imageAnnotator.getBitsById = function(id) {
        if (typeof(fragmentById[id]) !== 'undefined') {
            return fragmentById[id].bits;
        }
    };

    imageAnnotator.highlightByUri = function(uri) {
        // if (typeof(fragmentIds[uri]) === 'undefined') {
        //     imageAnnotator.log('Not highlighting given URI: fragment id not found');
        //     return;
        // }
        imageAnnotator.highlightById(fragmentIds[uri][0]);
    };

    imageAnnotator.highlightById = function(id) {
        // for (var l = fragmentById[id].bits.length; l--;) {
        //     fragmentById[id].bits[l].high();
        // }
        imageAnnotator.log('Highlighting fragment id=' + id + ', # bits: ' + fragmentById[id].bits.length);
    };


    imageAnnotator.clearHighlightByUri = function(uri) {
        // if (typeof(fragmentIds[uri]) === 'undefined') {
        //     imageAnnotator.log('Not clearing highlight on given URI: fragment id not found');
        //     return;
        // }
        imageAnnotator.clearHighlightById(fragmentIds[uri]);
    };

    imageAnnotator.clearHighlightById = function(id) {
        // for (var l = fragmentById[id].bits.length; l--;) {
        //     fragmentById[id].bits[l].clear();
        // }
        imageAnnotator.log('Clear highlight on fragment id=' + id + ', # bits: ' + fragmentById[id].bits.length);
    };

    // Hides and shows a single fragment (identified by its item's URI)
    imageAnnotator.showByUri = function(uri) {
        // if (typeof(fragmentIds[uri]) === 'undefined') {
        //     imageAnnotator.log('Not showing fragment for given URI: fragment id not found');
        //     return;
        // }
        // var id = fragmentIds[uri];
        // for (var l = fragmentById[id].bits.length; l--;) {
        //     fragmentById[id].bits[l].show();
        // }
    };

    imageAnnotator.hideByUri = function(uri) {
        // if (typeof(fragmentIds[uri]) === 'undefined') {
        //     imageAnnotator.log('Not hiding fragment for given URI: fragment id not found');
        //     return;
        // }
        // var id = fragmentIds[uri];
        // for (var l = fragmentById[id].bits.length; l--;) {
        //     fragmentById[id].bits[l].hide();
        // }
    };

    // Hides and shows every fragment
    imageAnnotator.hideAll = function() {
        for (var uri in fragmentIds) {
            imageAnnotator.hideByUri(uri);
        }
    };

    imageAnnotator.showAll = function() {
        for (var uri in fragmentIds) {
            imageAnnotator.showByUri(uri);
        }
    };

    // Ghost and remove ghost from a single fragment (identified by its item's URI)
    imageAnnotator.ghostByUri = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            imageAnnotator.log('Fragment id not found');
            return;
        }
        var id = fragmentIds[uri];
        for (var l = fragmentById[id].bits.length; l--;) {
            fragmentById[id].bits[l].ghost();
        }
    };

    imageAnnotator.ghostRemoveByUri = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            imageAnnotator.log('Fragment id not found');
            return;
        }
        var id = fragmentIds[uri];
        for (var l = fragmentById[id].bits.length; l--;) {
            fragmentById[id].bits[l].expo();
        }
    };

    // Hides and shows every fragment
    imageAnnotator.ghostAll = function() {
        for (var uri in fragmentIds) {
            imageAnnotator.ghostByUri(uri);
        }
    };

    imageAnnotator.ghostRemoveAll = function() {
        for (var uri in fragmentIds) {
            imageAnnotator.ghostRemoveByUri(uri);
        }
    };

    imageAnnotator.wipe = function() {
        // TODO: ... 
    };

    imageAnnotator.wipeItem = function(item) {
        var fragmentId = fragmentIds[item.uri][0];
        // TODO: ... ? 
        // imageAnnotator.wipeFragmentIds([fragmentId]);

    };

    imageAnnotator.svgHighlightByItem = function(item) {
        // TODO check if the svg is yet built
        var currentUri, imgReference, xpaths = [];
        if ((item.type.indexOf(imageAnnotator.typeIF) !== -1) && (typeof(item.polygon) !== 'undefined')) {
            currentUri = item.parentItemXP;
            xpaths = XpointersHelper.getXPathsFromXPointers([currentUri]);
            if (currentUri in xpaths) {
                imgReference = angular.element(xpaths[currentUri].startNode.firstElementChild);
                ImageFragmentAnnotatorHelper.drawPolygonOverImage(item.polygon, imgReference);
            }
        }
    };

    imageAnnotator.svgClearHighlightByItem = function( /*item*/ ) {
        angular.element('.' + imgConsClass).siblings('span.pnd-cons-svg').remove();
        // var currentUri, imgReference, xpaths = [];
        // if ((item.type.indexOf(imageAnnotator.typeIF) !== -1) && (typeof(item.polygon) !== 'undefined')){
        //     currentUri = item.parentItemXP;
        //     xpaths = XpointersHelper.getXPathsFromXPointers([currentUri]);
        //     if (currentUri in xpaths) {
        //         imgReference = angular.element(xpaths[currentUri].startNode.firstElementChild);
        //         imgReference.siblings('svg.pnd-polygon-layer').remove();
        //     }
        // }
    };

    imageAnnotator.highlightById = function(id) {
        for (var l = fragmentById[id].bits.length; l--;) {
            fragmentById[id].bits[l].high();
        }
        imageAnnotator.log('Highlighting fragment id=' + id + ', # bits: ' + fragmentById[id].bits.length);
    };

    imageAnnotator.clearHighlightById = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            imageAnnotator.log('Not clearing highlight on given URI: fragment id not found');
            return;
        }
        imageAnnotator.clearHighlightById(fragmentIds[uri]);
    };

    imageAnnotator.highlightByUri = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            imageAnnotator.log('Not highlighting given URI: fragment id not found');
            return;
        }
        imageAnnotator.highlightById(fragmentIds[uri][0]);
    };

    imageAnnotator.clearHighlightByUri = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            imageAnnotator.log('Not clearing highlight on given URI: fragment id not found');
            return;
        }
        imageAnnotator.clearHighlightById(fragmentIds[uri]);
    };

    Consolidation.addAnnotator(imageAnnotator);

    imageAnnotator.log('Component up and running');
    return imageAnnotator;
});