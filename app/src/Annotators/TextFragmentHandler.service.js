angular.module('Pundit2.Annotators')

.constant('TEXTFRAGMENTHANDLERDEFAULTS', {
    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TextFragmentHandler
     *
     * @description
     * `object`
     *
     * Configuration for Text Fragment Handler module
     */

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TextFragmentHandler.ignoreClasses
     *
     * @description
     * `array of string`
     *
     * List of classes added to content to ignore it and not annotate it.
     * Any content classed with any of these class will get ignored by the handler.
     * If selection to annotate start, ends or contains one of those classes, nothing will happen
     *
     * Default value:
     * <pre> ignoreClasses: ['pnd-ignore'] </pre>
     */

    ignoreClasses: ['pnd-ignore'],

    // If true, when the user selects something which starts, ends or contains ignored
    // stuff (see ignoreClasses) the selected text will get reseted

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TextFragmentHandler.removeSelectionOnAbort
     *
     * @description
     * `boolean`
     *
     * If true, whet user select some content classed as ignored (see ignoreClasses), selected content will get reseted.
     *
     * Default value:
     * <pre> removeSelectionOnAbort: true </pre>
     */
    removeSelectionOnAbort: true,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TextFragmentHandler.useTemporarySelection
     *
     * @description
     * `boolean`
     *
     * Activate listeners for temporary selections
     *
     * Default value:
     * <pre> useTemporarySelection: false </pre>
     */
    useTemporarySelection: true,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TextFragmentHandler.container
     *
     * @description
     * `string`
     *
     * Name of the container used to store the text fragment in the itemsExchange
     *
     * Default value:
     * <pre> container: 'createdTextFragments' </pre>
     */
    container: 'createdTextFragments',

    // Contextual menu type triggered by the text fragment handler. An Item will
    // be passed as resource

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TextFragmentHandler.cMenuType
     *
     * @description
     * `string`
     *
     * Contextual menu type shown by the text fragment handler
     *
     * Default value:
     * <pre> cMenuType: 'textFragmentHandlerItem' </pre>
     */
    cMenuType: 'textFragmentHandlerItem',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TextFragmentHandler.labelMaxLength
     *
     * @description
     * `number`
     *
     * Maximum characters number of selected text used to create the label for annotation.
     *
     * Default value:
     * <pre> labelMaxLength: 40 </pre>
     */
    labelMaxLength: 40

})

// TODO: remove toolbar and triplecomposer dependency 
.service('TextFragmentHandler', function($rootScope, TEXTFRAGMENTHANDLERDEFAULTS, NameSpace, BaseComponent, TextFragmentAnnotator,
    XpointersHelper, Item, ItemsExchange, Toolbar, TripleComposer, Consolidation, EventDispatcher, $document, $injector, Config) {

    var textFragmentHandler = new BaseComponent('TextFragmentHandler', TEXTFRAGMENTHANDLERDEFAULTS);
    var clientHidden = false;

    var lastTemporaryConsolidable,
        temporaryConsolidated = {};

    var menuType = Config.clientMode === 'pro' ? 'ContextualMenu' : 'AnnotationPopover',
        handlerMenu = $injector.get(menuType);

    // TODO: cambiare nome perche a raffaele da noia.
    var checkTemporaryConsolidated = function(forceWipe) {
        if (typeof forceWipe === 'undefined') {
            forceWipe = false;
        }
        if (Object.keys(temporaryConsolidated).length === 0) {
            return;
        }
        var validUris = {};
        var statements = TripleComposer.getStatements();
        statements.forEach(function(el) {
            if (typeof el.scope === 'undefined') {
                return;
            }
            var triple = el.scope.get();
            if (typeof triple.subject !== 'undefined' && triple.subject !== null && typeof triple.subject.uri !== 'undefined') {
                validUris[triple.subject.uri] = true;
            }
            if (typeof triple.object !== 'undefined' && triple.object !== null && typeof triple.object.uri !== 'undefined') {
                validUris[triple.object.uri] = true;
            }
        });

        for (var uri in temporaryConsolidated) {
            if (forceWipe || typeof validUris[uri] === 'undefined') {
                var temporaryFragmentId = temporaryConsolidated[uri].fragmentId;
                TextFragmentAnnotator.wipeFragmentIds([temporaryFragmentId]);
                ItemsExchange.setItemAsTemporary(uri, false);
                delete temporaryConsolidated[uri];
            }
        }

        if (forceWipe) {
            lastTemporaryConsolidable = undefined;
            ItemsExchange.wipeTemporaryItems();
        }
    };

    var consolidateTemporarySelection = function() {
        for (var uri in temporaryConsolidated) {
            var temporaryFragmentId = temporaryConsolidated[uri].fragmentId,
                temporaryFragmentUri = TextFragmentAnnotator.getFragmentUriById(temporaryFragmentId);

            Consolidation.updateItemListAndMap(ItemsExchange.getItemByUri(temporaryFragmentUri), 'text');
            TextFragmentAnnotator.placeIconByFragmentId(temporaryFragmentId);

            angular.element('.' + temporaryFragmentId)
                .removeClass(XpointersHelper.options.textFragmentHiddenClass)
                .removeAttr('temp-fragments')
                .removeClass('pnd-cons-temp');
            delete temporaryConsolidated[uri];
        }
        lastTemporaryConsolidable = undefined;
    };

    var addTemporarySelection = function() {
        if (typeof lastTemporaryConsolidable !== 'undefined') {
            XpointersHelper.wrapElement(
                lastTemporaryConsolidable.range.commonAncestorContainer,
                lastTemporaryConsolidable.range,
                'span', 'pnd-cons-temp pnd-cons', [lastTemporaryConsolidable.fragmentId],
                true,
                lastTemporaryConsolidable.itemUri
            );
            temporaryConsolidated[lastTemporaryConsolidable.itemUri] = lastTemporaryConsolidable;
            ItemsExchange.setItemAsTemporary(lastTemporaryConsolidable.itemUri, true);
            lastTemporaryConsolidable = undefined;
        }
    };



    // Creates a proper Item from a range .. it must be a valid range, kktnx.
    textFragmentHandler.createItemFromRange = function(range) {
        var values = {};

        values.uri = XpointersHelper.range2xpointer(range);
        values.type = [NameSpace.fragments.text];
        values.description = range.toString();

        values.label = values.description;
        if (values.label.length > textFragmentHandler.options.labelMaxLength) {
            values.label = values.label.substr(0, textFragmentHandler.options.labelMaxLength) + ' ..';
        }

        values.pageContext = XpointersHelper.getSafePageContext();
        values.isPartOf = values.uri.split('#')[0];

        return new Item(values.uri, values);
    };


    // Gets the user's selected range on the page, checking if it's valid.
    // Will return a DIRTY range: a valid range in the current DOM the user
    // is viewing and interacting with
    textFragmentHandler.getSelectedRange = function() {
        var doc = $document[0],
            range;

        if (doc.getSelection().rangeCount === 0) {
            textFragmentHandler.log('getSelection().rangeCount is 0: no selected range.');
            return null;
        }

        range = doc.getSelection().getRangeAt(0);

        // If the selected range is empty (this happens when the user clicks on something)...
        if (range !== null &&
            range.startContainer === range.endContainer &&
            range.startOffset === range.endOffset) {

            textFragmentHandler.log('Range is not null, but start/end containers and offsets match: no selected range.');
            return null;
        }

        textFragmentHandler.log('GetSelectedRange returning a DIRTY range: ' +
            range.startContainer.nodeName + '[' + range.startOffset + '] > ' +
            range.endContainer.nodeName + '[' + range.endOffset + ']');

        return range;
    }; // getSelectedRange()

    textFragmentHandler.wipeTemporarySelection = function() {
        checkTemporaryConsolidated(true);
    };

    // If configured to do so, removes the user's selection from the browser
    var removeSelection = function() {
        if (textFragmentHandler.options.removeSelectionOnAbort) {
            $document[0].getSelection().removeAllRanges();
        }
    };

    // Checks if the node (or any parent) is a node which needs to be ignored
    textFragmentHandler.isToBeIgnored = function(node) {
        var classes = textFragmentHandler.options.ignoreClasses,
            ignoreLen = classes.length;

        // Traverse every parent and check if it has one of the classes we
        // need to ignore. As soon as we find one, return true: must ignore.
        while (node.nodeName.toLowerCase() !== 'body') {
            for (var i = ignoreLen; i--;) {
                if (angular.element(node).hasClass(classes[i])) {
                    return true;
                }
            }

            // If there's no parent node .. even better, we didnt find anything wrong!
            if (node.parentNode === null) {
                return false;
            }
            node = node.parentNode;
        }
        return false;
    };

    // Takes a (dirty) range and returns a clean xpointer:
    // - translate a dirty range into a clean one
    // - correct any wrong number inside xpaths (node number, offsets)
    // - build the xpointer starting from a named content, if present
    // - build the xpointer strings


    textFragmentHandler.turnOn = function() {
        $document.on('mousedown', mouseDownHandler);
    };

    textFragmentHandler.turnOff = function() {
        $document.off('mousedown', mouseDownHandler);
    };

    if (textFragmentHandler.options.useTemporarySelection) {
        EventDispatcher.addListeners([
            'PndPopover.addTemporarySelection',
            'TripleComposer.useAsObject',
            'TripleComposer.useAsSubject'
        ], function() {
            addTemporarySelection();
        });

        EventDispatcher.addListeners([
            'PndPopover.removeTemporarySelection',
            'TripleComposer.statementChange',
            'TripleComposer.statementChanged',
            'TripleComposer.reset'
        ], function() {
            checkTemporaryConsolidated();
        });

        EventDispatcher.addListeners(
            [
                'PndPopover.wipeTemporarySelections',
                'Consolidation.startConsolidate',
                'Client.hide',
            ],
            function() {
                checkTemporaryConsolidated(true);
            }
        );

        EventDispatcher.addListeners([
            'AnnotationsCommunication.annotationSaved',
            'AnnotationsCommunication.editAnnotation'
        ], function() {
            consolidateTemporarySelection();
        });
    }

    EventDispatcher.addListener('Client.hide', function( /*e*/ ) {
        clientHidden = true;
    });

    EventDispatcher.addListener('Client.show', function( /*e*/ ) {
        clientHidden = false;
    });

    $document.on('mousedown', mouseDownHandler);

    function mouseUpHandler(upEvt) {
        lastTemporaryConsolidable = undefined;
        if (clientHidden) {
            return;
        }

        $document.off('mouseup', mouseUpHandler);

        var target = upEvt.target;
        if (textFragmentHandler.isToBeIgnored(target)) {
            textFragmentHandler.log('ABORT: ignoring mouse UP event on document: ignore class spotted.');
            removeSelection();
            return;
        }

        var range = textFragmentHandler.getSelectedRange();
        if (range === null) {
            return;
        }

        // Check every node contained in this range: if we select something which starts
        // and ends inside the same text node the length will be 0: everything is ok.
        // Otherwise check that every contained node must not be ignored
        var nodes = range.cloneContents().querySelectorAll("*"),
            nodesLen = nodes.length;
        while (nodesLen--) {
            if (textFragmentHandler.isToBeIgnored(nodes[nodesLen])) {
                textFragmentHandler.log('ABORT: ignoring range: ignore class spotted inside it, somewhere.');
                removeSelection();
                return;
            }
        }

        // TODO: this will create a new item in our container at each valid user selection.
        // how to wipe them up? If the user keeps selecting stuff we end up with LOADS and
        // LOADS of unused items.
        // Problem: the item might be used by the triple composer, or added to my items or
        // discarded at all.
        // Possible solution: wipe the container when triple composer is empty, ctx menu is
        // NOT shown on every dashboard open/close ?
        var item = textFragmentHandler.createItemFromRange(range),
            currentFr = 'fr-' + (new Date()).getTime();
        ItemsExchange.addItemToContainer(item, textFragmentHandler.options.container);

        lastTemporaryConsolidable = {
            offset: range.endOffset,
            range: range,
            xpointer: item.getXPointer(),
            fragmentId: currentFr,
            itemUri: item.uri
        };

        //XpointersHelper.wrapElement(range.commonAncestorContainer, range, 'span', "pnd-cons-temp", [lastTemporaryConsolidable.fragmentId]);
        //temporaryConsolidated[item.uri] = lastTemporaryConsolidable;

        textFragmentHandler.log('Valid selection ended on document. Text fragment Item produced: ' + item.label);

        if (Toolbar.isActiveTemplateMode() && Config.clientMode === 'pro') {
            textFragmentHandler.log('Item used as subject inside triple composer (template mode active).');
            TripleComposer.addToAllSubject(item);
            TripleComposer.closeAfterOp();
            addTemporarySelection();
            EventDispatcher.sendEvent('Annotators.saveAnnotation');
            return;
        }

        // TODO: generalize item in {data}
        var promise = handlerMenu.show(upEvt.pageX, upEvt.pageY, item, textFragmentHandler.options.cMenuType, currentFr);
        if (typeof promise !== 'undefined' && promise !== false) {
            promise.then(function() {
                textFragmentHandler.log('textFragmentHandler handlerMenu.show promise resolved');
            });
        }
    } // mouseUpHandler()

    // If we are configured to remove the selection, we cannot preventDefault() or
    // we will interfere with other clicks inside ignored containers (search inputs?!!).
    // So we bind this up handler and just remove the selection on mouseup, if there is one.
    function mouseUpHandlerToRemove() {
        $document.off('mouseup', mouseUpHandlerToRemove);
        if (textFragmentHandler.getSelectedRange() !== null) {
            removeSelection();
        }
    }

    function mouseDownHandler(downEvt) {
        if (clientHidden) {
            return;
        }

        var target = downEvt.target;
        if (textFragmentHandler.isToBeIgnored(target)) {
            textFragmentHandler.log('ABORT: ignoring mouse DOWN event on document: ignore class spotted.');
            if (textFragmentHandler.options.removeSelectionOnAbort) {
                $document.on('mouseup', mouseUpHandlerToRemove);
            }
            return;
        }

        $document.off('mouseup', mouseUpHandler);
        $document.on('mouseup', mouseUpHandler);
        textFragmentHandler.log('Selection started on document, waiting for mouse up.');
    } // mouseDownHandler()

    textFragmentHandler.log('Component up and running');
    return textFragmentHandler;
});