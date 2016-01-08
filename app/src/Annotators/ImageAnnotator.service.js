/**
* Created by detox on 02/12/15.
*/
angular.module('Pundit2.Annotators')

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
    addIcon: false,
})

.service('ImageAnnotator', function(NameSpace, BaseComponent, $location,
                                    Consolidation, XpointersHelper, ImageFragmentAnnotatorHelper,EventDispatcher, $q, $rootScope, ItemsExchange, Config, $compile) {

    // Create the component and declare what we deal with: text
    var ia = new BaseComponent('ImageAnnotator');

    ia.label = "image";
    ia.type = NameSpace.types[ia.label];
    ia.labelIF = "imagePart";
    ia.typeIF = NameSpace.fragments[ia.labelIF];

    var fragmentIds = {},
        fragmentsRefs = {},
        fragmentsRefsById = {},
        i = 0,
        fragmentById = [],
        tempFragmentIds = {},
        lastTemporaryConsolidable,
        temporaryConsolidated = {},
        imgConsClass = "pnd-cons-img",
        imgIgnore = "pnd-ignore";
    //var svgTimeout;

    // TODO: Move this to XpointersHelper .something() ?
    var activateFragments = function() {
         var deferred = $q.defer();

        var consolidated = angular.element('.pnd-cons:not(.ng-scope)');
        $compile(consolidated)($rootScope);
        $rootScope.$$phase || $rootScope.$digest();

         deferred.resolve();
         return deferred.promise;
    };


    var consolidateTemporarySelection = function() {
        for (var uri in temporaryConsolidated) {
            var temporaryFragmentId = temporaryConsolidated[uri].fragmentId,
                temporaryFragmentUri = ia.getFragmentUriById(temporaryFragmentId);

            Consolidation.updateItemListAndMap(ItemsExchange.getItemByUri(temporaryFragmentUri), 'text');
            ia.placeIconByFragmentId(temporaryFragmentId);

            angular.element('.' + temporaryFragmentId)
                .removeClass(XpointersHelper.options.textFragmentHiddenClass)
                .removeAttr('temp-fragments')
                .removeClass('pnd-cons-temp');
            delete temporaryConsolidated[uri];
        }
        lastTemporaryConsolidable = undefined;
    };

    ia.isConsolidable = function(item) {
        var xpointerURI;

        if (!angular.isArray(item.type)) {
            ia.log("Item not valid: malformed type" + item.uri);
            return false;
        } else if (item.type.length === 0) {
            ia.log("Item not valid: types len 0" + item.uri);
            return false;
        } else if ((item.type.indexOf(ia.type) === -1) && (item.type.indexOf(ia.typeIF) === -1)) {
            ia.log("Item not valid: not have type image " + item.uri);
            return false;
        } else {
            if (item.type.indexOf(ia.type) !== -1) {
                xpointerURI = item.xpointer;
            } else if (item.type.indexOf(ia.typeIF) !== -1) {
                xpointerURI = item.parentItemXP;
            }
            if (!XpointersHelper.isValidXpointerURI(xpointerURI)) {
                ia.log("Item not valid: not a valid xpointer uri: " + xpointerURI);
                return false;
            } else if (!XpointersHelper.isValidXpointer(xpointerURI)) {
                ia.log("Item not valid: not consolidable on this page: " + xpointerURI);
                return false;
            }


        }

        // TODO: it's a valid image fragment if:
        // - one of its types is the fragment-image type [done]
        // - has a part of
        // - .selector contains something
        // ... etc etc
        ia.log("Item valid: " + item.label);
        return true;
    };

    ia.consolidate = function(items) {
        ia.log('Consolidating!');
        var deferred = $q.defer();

        /*
         if (!angular.isObject(items)) {
         imageAnnotator.err('Items not valid: malformed object', items);
         return deferred.resolve();
         }
         */
        var updateDOMPromise,
            consolidatePromise,
            compilePromise,
            uri,
            currentUri,
            xpointers = [],
            parentItemXPList = {};

        for (uri in items) {
            if (items[uri].type.indexOf(ia.type) !== -1) {
                currentUri = items[uri].xpointer;
            } else if (items[uri].type.indexOf(ia.typeIF) !== -1) {
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

        $q.all([updateDOMPromise, compilePromise]).then(function() {
            ia.log(ia.label + ' consolidation: done!');
            deferred.resolve();
        });

        return deferred.promise;

        /*  for (uri in xpaths) {
         // TODO So bad! Add span (like Pundit1) and use it as reference
         // TODO Move DOM manipulation in Xpointer service
         var imgReference = angular.element(xpaths[uri].startNode);
         imgReference.addClass(imgConsClass);


         // if (uri in parentItemXPList){
         //     for (polyIF in parentItemXPList[uri]){
         //         ImageFragmentAnnotatorHelper.drawPolygonOverImage(parentItemXPList[uri][polyIF],  imgReference);
         //     }
         // }
         }*/
    };

    // Called by TextFragmentBit directives: they will wrap every bit of annotated content
    // for every xpointer we save an array of those bits. Each bit can belong to more
    // than one xpointer (overlaps!)
    ia.updateFragmentBit = function(bit, action) {
        var fragments = bit.fragments,
            id = bit.bitId;

        // Fragment ids are split by a comma, gather them back in a array. Otherwise
        // they are a string
        if (fragments.match(/,/)) {
            fragments = fragments.split(',');
        } else {
            fragments = [fragments];
        }

        for (var l = fragments.length; l--;) {
            var current = fragmentById[fragments[l]];
            switch (action) {
                case 'add':
                    if (typeof current === 'undefined') {
                        ia.err("fragmentById[" + fragments[l] + "] is undefined - skipping ia.addFragmentBit()");
                        continue;
                    }
                    if (typeof current.bitsObj[id] === 'undefined') {
                        current.bits.push(bit);
                        current.bitsObj[id] = bit;
                    }
                    break;
                case 'remove':
                    if (typeof current === 'undefined') {
                        continue;
                    }
                    if (typeof current.bitsObj[id] !== 'undefined') {
                        var indexFind = current.bits.map(function(e) {
                            return e.bitId;
                        }).indexOf(id);
                        if (indexFind !== -1) {
                            current.bits.splice(indexFind, 1);
                        }
                        delete current.bitsObj[id];
                    }
                    break;
                case 'update':
                    if (typeof current === 'undefined') {
                        if (typeof bitsQueque[fragments[l]] === 'undefined') {
                            bitsQueque[fragments[l]] = [bit];
                        } else {
                            bitsQueque[fragments[l]].push(bit);
                        }
                        continue;
                    }
                    if (typeof current.bitsObj[id] === 'undefined') {
                        current.bits.push(bit);
                        current.bitsObj[id] = bit;
                    }
                    break;
            }
        }
        ia.log('Update consolidated fragment bit references', fragments);
    };

    ia.getFragmentReferenceByUri = function(uri) {
        if (typeof(fragmentsRefs[uri]) !== 'undefined') {
            return fragmentsRefs[uri];
        }
    };

    ia.getFragmentIdByUri = function(uri) {
        if (typeof(fragmentIds[uri]) !== 'undefined') {
            return fragmentIds[uri];
        }
    };

    ia.getFragmentUriById = function(id) {
        if (typeof(fragmentById[id]) !== 'undefined') {
            return fragmentById[id].uri;
        }
    };

    ia.getBitsById = function(id) {
        if (typeof(fragmentById[id]) !== 'undefined') {
            return fragmentById[id].bits;
        }
    };

    ia.highlightByUri = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            ia.log('Not highlighting given URI: fragment id not found');
            return;
        }
        ia.highlightById(fragmentIds[uri][0]);
    };

    ia.highlightById = function(id) {
        for (var l = fragmentById[id].bits.length; l--;) {
            fragmentById[id].bits[l].high();
        }
        ia.log('Highlighting fragment id=' + id + ', # bits: ' + fragmentById[id].bits.length);
    };


    ia.clearHighlightByUri = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            ia.log('Not clearing highlight on given URI: fragment id not found');
            return;
        }
        ia.clearHighlightById(fragmentIds[uri]);
    };

    ia.clearHighlightById = function(id) {
        for (var l = fragmentById[id].bits.length; l--;) {
            fragmentById[id].bits[l].clear();
        }
        ia.log('Clear highlight on fragment id=' + id + ', # bits: ' + fragmentById[id].bits.length);
    };

    // Hides and shows a single fragment (identified by its item's URI)
    ia.showByUri = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            ia.log('Not showing fragment for given URI: fragment id not found');
            return;
        }
        var id = fragmentIds[uri];
        for (var l = fragmentById[id].bits.length; l--;) {
            fragmentById[id].bits[l].show();
        }
    };

    ia.hideByUri = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            ia.log('Not hiding fragment for given URI: fragment id not found');
            return;
        }
        var id = fragmentIds[uri];
        for (var l = fragmentById[id].bits.length; l--;) {
            fragmentById[id].bits[l].hide();
        }
    };

    // Hides and shows every fragment
    ia.hideAll = function() {
        for (var uri in fragmentIds) {
            ia.hideByUri(uri);
        }
    };

    ia.showAll = function() {
        for (var uri in fragmentIds) {
            ia.showByUri(uri);
        }
    };

    // Ghost and remove ghost from a single fragment (identified by its item's URI)
    ia.ghostByUri = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            ia.log('Fragment id not found');
            return;
        }
        var id = fragmentIds[uri];
        for (var l = fragmentById[id].bits.length; l--;) {
            fragmentById[id].bits[l].ghost();
        }
    };

    ia.ghostRemoveByUri = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            ia.log('Fragment id not found');
            return;
        }
        var id = fragmentIds[uri];
        for (var l = fragmentById[id].bits.length; l--;) {
            fragmentById[id].bits[l].expo();
        }
    };

    // Hides and shows every fragment
    ia.ghostAll = function() {
        for (var uri in fragmentIds) {
            ia.ghostByUri(uri);
        }
    };

    ia.ghostRemoveAll = function() {
        for (var uri in fragmentIds) {
            ia.ghostRemoveByUri(uri);
        }
    };

    // The orchestrator will be called by the consolidation service as single point of
    // interaction when it comes to deal with fragments. Let's subscribe the text type.
    ia.wipe = function() {
        fragmentIds = {};
        fragmentsRefs = {};
        fragmentsRefsById = {};
        fragmentById = {};

        bitsQueque = {};

        // Replace wrapped nodes with their content
        var bits = angular.element('.' + XpointersHelper.options.wrapNodeClass);
        angular.forEach(bits, function(node) {
            var parent = node.parentNode;
            while (node.firstChild) {
                parent.insertBefore(node.firstChild, node);
            }
            angular.element(node).remove();
        });

        // Finally merge splitted text nodes
        XpointersHelper.mergeTextNodes(angular.element('body')[0]);
        /* var imgCons = angular.element('.' + imgConsClass);
         imgCons.removeClass(imgConsClass);
         */ // imgCons.siblings('svg.pnd-polygon-layer').remove();
    };

    ia.wipeItem = function(item) {
        var fragmentId = fragmentIds[item.uri][0];
        ia.wipeFragmentIds([fragmentId]);

    };

    var wipeReference = function(elem, fragmentId, mod) {
        var node = elem[0],
            prev = node.previousElementSibling,
            next = node.nextElementSibling,
            jPrev,
            jNext,
            fragments,
            elemFragments = elem.attr('fragments'),
            cleanElemFragments = elemFragments.replace(fragmentId, '').split(',').filter(function(s) {
                return s.length > 0;
            }).join(','),
            elemTempFragments = elem.attr('temp-fragments'),
        // cleanTempFragmentsA = [],
            cleanElemFragmentsA = cleanElemFragments.split(','),
            mergeWithPrev = false,
            frIntersectWithPrev = false,
            mergeWithNext = false,
            frIntersectWithNext = false,
            elemRemoved = false,
            fragmentIntersection;

        if (typeof elemTempFragments !== 'undefined') {
            elemTempFragments = elemTempFragments.replace(fragmentId, '').split(',').filter(function(s) {
                return s.length > 0;
            }).join(',');
            elemTempFragments = elemTempFragments.length === 0 ? undefined : elemTempFragments;
        }

        // #1 TEXT<SPAN>TEXT
        if ((prev === null || prev.nodeType === 3) && (next === null || next.nodeType === 3)) {
            if (elemFragments === fragmentId) {
                if (node.firstChild !== null && node.parentNode !== null && node.parentNode !== null) {
                    node.parentNode.insertBefore(node.firstChild, node);
                }
                elem.remove();
                elemRemoved = true;
            }
        } else {
            // Now we're going to check if we need to merge element span with
            // either previous span or next span or both.
            // First we check prev sibling, if it's present and it's an element node..
            if (prev !== null && prev.nodeType === 1) {
                jPrev = angular.element(prev);
                // .. and if it has "pnd-cons" class we have to check if has the same fragment id(s)
                if (jPrev.hasClass(XpointersHelper.options.wrapNodeClass)) {
                    fragments = jPrev.attr('fragments');
                    if (fragments === cleanElemFragments) {
                        mergeWithPrev = true;
                    } else {
                        // Check if prev fragments list intersects with current element fragments list purged by fragmentId
                        fragmentIntersection = fragments.split(',').filter(function(n) {
                            return cleanElemFragmentsA.indexOf(n) !== -1;
                        });
                        frIntersectWithPrev = fragmentIntersection.length !== 0;
                    }
                }
            }
            // now we do the same check for next sibling.
            if (next !== null && next.nodeType === 1) {
                jNext = angular.element(next);
                if (jNext.hasClass(XpointersHelper.options.wrapNodeClass)) {
                    fragments = jNext.attr('fragments');
                    if (fragments === cleanElemFragments) {
                        mergeWithNext = true;
                    } else {
                        // Check if next fragments list intersects with current element fragments list purged by fragmentId
                        fragmentIntersection = fragments.split(',').filter(function(n) {
                            return cleanElemFragmentsA.indexOf(n) !== -1;
                        });
                        frIntersectWithNext = fragmentIntersection.length !== 0;
                    }
                }
            }
        }

        if (!elemRemoved) {
            if (mergeWithPrev || mergeWithNext) {
                // Crete new node.
                var wrapNode = XpointersHelper.createWrapNode(XpointersHelper.options.wrapNodeName, XpointersHelper.options.wrapNodeClass, cleanElemFragmentsA),
                    modObj = {},
                    temp,
                    tempFragments = [],
                    elementsToRemove = [];
                if (mergeWithPrev) {
                    wrapNode.jElement.text(jPrev.text());
                    elementsToRemove.push(jPrev);
                    jPrev.attr('fragments').split(',').map(function(k) {
                        modObj[k] = true;
                    });
                    temp = jPrev.attr('temp-fragments');
                    if (typeof temp !== 'undefined') {
                        tempFragments = tempFragments.concat(temp.split(','));
                    }
                }
                wrapNode.jElement.append(elem.text());
                elementsToRemove.push(elem);
                if (mergeWithNext) {
                    wrapNode.jElement.append(jNext.text());
                    elementsToRemove.push(jNext);
                    jNext.attr('fragments').split(',').map(function(k) {
                        modObj[k] = true;
                    });
                    temp = jNext.attr('temp-fragments');
                    if (typeof temp !== 'undefined') {
                        tempFragments = tempFragments.concat(temp.split(','));
                    }
                }
                elem.after(wrapNode.jElement);
                if (tempFragments.length > 0) {
                    var tempObj = {};
                    tempFragments.forEach(function(e) {
                        tempObj[e] = true;
                    });
                    tempFragments = Object.keys(tempObj);
                    wrapNode.jElement.attr('temp-fragments', tempFragments.join(','));
                    wrapNode.jElement.addClass(XpointersHelper.options.tempWrapNodeClass);
                }
                elementsToRemove.forEach(function(e) {
                    e.remove();
                });
                angular.extend(mod, modObj);
            } else if (!frIntersectWithNext && !frIntersectWithNext) {
                if (elemFragments === fragmentId) {
                    if (node.firstChild !== null && node.parentNode !== null) {
                        node.parentNode.insertBefore(node.firstChild, node);
                    }
                    elem.remove();
                } else {
                    elem
                        .attr('fragments', cleanElemFragments)
                        .removeClass(fragmentId);

                    if (typeof elemTempFragments !== 'undefined') {
                        elem.attr('temp-fragments', elemTempFragments)
                            .addClass(XpointersHelper.options.tempWrapNodeClass);
                    } else {
                        elem.removeClass(XpointersHelper.options.tempWrapNodeClass)
                            .removeAttr('temp-fragments');
                    }

                    elem.attr('class').split(' ').forEach(function(c) {
                        if (c.indexOf('pnd-imagefragment-numbers') !== -1) {
                            elem.removeClass(c);
                        }
                    });

                    elem.addClass('pnd-imagefragment-numbers-' + cleanElemFragments.split(",").length);
                }
            } else {
                elem
                    .attr('fragments', cleanElemFragments)
                    .removeClass(fragmentId);

                if (typeof elemTempFragments !== 'undefined') {
                    elem.attr('temp-fragments', elemTempFragments)
                        .addClass(XpointersHelper.options.tempWrapNodeClass);
                } else {
                    elem.removeClass(XpointersHelper.options.tempWrapNodeClass)
                        .removeAttr('temp-fragments');
                }

                elem.attr('class').split(' ').forEach(function(c) {
                    if (c.indexOf('pnd-imagefragment-numbers') !== -1) {
                        elem.removeClass(c);
                    }
                });

                elem.addClass('pnd-imagefragment-numbers-' + cleanElemFragments.split(",").length);
            }
        }
    };

    ia.wipeFragmentIds = function(frIds) {
        var modifiedFragmentsId = {},
            modifiedItemsUri = [];

        for (var i in frIds) {
            var fragmentId = frIds[i],
                uri = fragmentById[fragmentId].uri,
                references = fragmentsRefsById[fragmentId];

            for (var r in references) {
                var elem = references[r];
                wipeReference(elem, fragmentId, modifiedFragmentsId);
            }

            delete fragmentsRefsById[fragmentId];
            delete fragmentById[fragmentId];

            if (fragmentIds[uri][0] === fragmentId) {
                delete fragmentIds[uri];
                delete fragmentsRefs[uri];
            }
        }

        XpointersHelper.mergeTextNodes(angular.element('body')[0]);

        // TODO: refactor!!
        angular.forEach(Object.keys(modifiedFragmentsId), function(fr) {
            var currentUri = fragmentById[fr].uri,
                currentReferences = angular.element('.' + fr),
                referencesList = [];

            currentReferences.each(function(i) {
                referencesList.unshift(currentReferences.eq(i));
            });

            fragmentsRefs[currentUri] = referencesList;
            fragmentsRefsById[fr] = referencesList;
        });

        activateFragments();

        for (var fr in modifiedFragmentsId) {
            if (typeof fragmentById[fr] === 'undefined') {
                continue;
            }
            modifiedItemsUri.push(fragmentById[fr].uri);
        }
        //TODO call ImageFragmentAnnotator.updateItems
        EventDispatcher.sendEvent('TextFragmentAnnotator.updateItems', modifiedItemsUri);
    };

    ia.svgHighlightByItem = function(item) {
        // TODO check if the svg is yet built
        var currentUri, imgReference, xpaths = [];
        if ((item.type.indexOf(ia.typeIF) !== -1) && (typeof(item.polygon) !== 'undefined')) {
            currentUri = item.parentItemXP;
            xpaths = XpointersHelper.getXPathsFromXPointers([currentUri]);
            if (currentUri in xpaths) {
                imgReference = angular.element(xpaths[currentUri].startNode.firstElementChild);
                ImageFragmentAnnotatorHelper.drawPolygonOverImage(item.polygon, imgReference);
            }
        }
    };

    ia.svgClearHighlightByItem = function( /*item*/ ) {
        angular.element('.' + imgConsClass).siblings('span.pnd-cons-svg').remove();
        // var currentUri, imgReference, xpaths = [];
        // if ((item.type.indexOf(ia.typeIF) !== -1) && (typeof(item.polygon) !== 'undefined')){
        //     currentUri = item.parentItemXP;
        //     xpaths = XpointersHelper.getXPathsFromXPointers([currentUri]);
        //     if (currentUri in xpaths) {
        //         imgReference = angular.element(xpaths[currentUri].startNode.firstElementChild);
        //         imgReference.siblings('svg.pnd-polygon-layer').remove();
        //     }
        // }
    };

    ia.highlightById = function(id) {
        for (var l = fragmentById[id].bits.length; l--;) {
            fragmentById[id].bits[l].high();
        }
        ia.log('Highlighting fragment id=' + id + ', # bits: ' + fragmentById[id].bits.length);
    };

    ia.clearHighlightById = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            ia.log('Not clearing highlight on given URI: fragment id not found');
            return;
        }
        ia.clearHighlightById(fragmentIds[uri]);
    };

    ia.highlightByUri = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            ia.log('Not highlighting given URI: fragment id not found');
            return;
        }
        ia.highlightById(fragmentIds[uri][0]);
    };

    ia.clearHighlightByUri = function(uri) {
        if (typeof(fragmentIds[uri]) === 'undefined') {
            ia.log('Not clearing highlight on given URI: fragment id not found');
            return;
        }
        ia.clearHighlightById(fragmentIds[uri]);
    };

    Consolidation.addAnnotator(ia);

    EventDispatcher.addListener('XpointersHelper.NodeAddedImg', function(e) {
        var elementInfo = e.args,
            elementFragments = elementInfo.fragments,
            elementReferce = elementInfo.reference,
            currentFragment, currentIcon;

        var patt = new RegExp(/imgf\-[0-9]+/);
        for (var i in elementFragments) {
            currentFragment = elementFragments[i];
            if (!patt.test(currentFragment)) {
                return;
            }
            if (typeof fragmentsRefsById[currentFragment] === 'undefined') {
                fragmentsRefsById[currentFragment] = [elementReferce];

            } else {
                fragmentsRefsById[currentFragment].push(elementReferce);
            }
        }

        $compile(elementReferce)($rootScope);
    });

    EventDispatcher.addListener('Consolidation.consolidateAll', function(e) {
        var myItemsList = ItemsExchange.getItemsByContainer(Config.modules.MyItemsContainer.container);
        if (ia.options.addIcon === false &&
            ia.options.addOnlyMyItemsIcon) {
            angular.forEach(myItemsList, function(item) {
                placeMyItemsIconByUri(item.uri);
            });
        }
    });

    EventDispatcher.addListener('XpointersHelper.temporaryWrap', function(e) {
        var wrapInfo = e.args,
            fragments = wrapInfo.fragments,
            newFragmentUri = wrapInfo.uri,
            newFragmentId = fragments[0];

        var bits = [],
            bitsObj = {};

        if (typeof bitsQueque[newFragmentId] !== 'undefined') {
            angular.forEach(bitsQueque[newFragmentId], function(bit) {
                bits.push(bit);
                bitsObj[bit.bitId] = bit;
            });
            delete bitsQueque[newFragmentId];
        }

        fragmentIds[newFragmentUri] = typeof fragmentIds[newFragmentUri] === 'undefined' ? [newFragmentId] : fragmentIds[newFragmentUri].push(newFragmentId);
        fragmentById[newFragmentId] = {
            uri: newFragmentUri,
            bits: bits,
            bitsObj: bitsObj,
            item: ItemsExchange.getItemByUri(newFragmentUri)
        };

        angular.forEach(fragments, function(fr) {
            if (typeof fragmentById[fr] === 'undefined') {
                ia.err('Something wrog with this fragment ' + fr);
                return;
            }

            var currentUri = fragmentById[fr].uri,
                currentReferences = angular.element('.' + fr),
                referencesList = [];

            currentReferences.each(function(i) {
                referencesList.unshift(currentReferences.eq(i));
            });

            fragmentsRefs[currentUri] = referencesList;
            fragmentsRefsById[fr] = referencesList;
        });

        activateFragments();
    });

    EventDispatcher.addListeners([
        'AnnotationsCommunication.annotationSaved',
        'AnnotationsCommunication.editAnnotation'
    ], function() {
        consolidateTemporarySelection();
    });
    $rootScope.$on('annomatic-run', function() {
        annomaticIsRunning = true;
    });
    $rootScope.$on('annomatic-stop', function() {
        annomaticIsRunning = false;
    });

    ia.log('Component up and running');
    return ia;
});


