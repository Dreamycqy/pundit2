angular.module('Pundit2.Core')
.service('ImageFragmentAnnotatorHelper', function($rootScope, $modal, $window, BaseComponent, Config, NameSpace,
    ContextualMenu, XpointersHelper, Item, MyItems) {
    
    var imageFragmentHelper = new BaseComponent("ImageFragmentAnnotatorHelper");

    var msg = {
        close: 'ia-closed',
        addPolygon: 'ia-add-polygon'
    };

    var template = '<iframe class="pnd-image-fragment-frame" width="620" height="500" src="http://demo-image-fragment-annotator.kissr.com" scrolling="no" frameborder="0" allowfullscreen></iframe>';

    var initContextualMenu = function() {
        ContextualMenu.addAction({
            type: [Config.modules.ImageHandler.cMenuType],
            name: 'openImageFragmentAnnotator',
            label: 'Annotate a part of this image',
            showIf: function(item) {
                return true;
            },
            priority: 99,
            action: function(item) {
                open(item);
            }
        });
    };

    // When all modules have been initialized, services are up, Config are setup etc..
    $rootScope.$on('pundit-boot-done', function() {
        // check configuration
        if (Config.imageFragmentAnnotator.active) {
            initContextualMenu();
        }
    });

    $window.addEventListener('message', function(e) {
        if (e.data.type === msg.close) {
            close();
        }
        if (e.data.type === msg.addPolygon) {
            var item = imageFragmentHelper.createItemFromPolygon(e.data.poly);
            MyItems.addItem(item);
        }
    });

    var overflow, imgItem;
    var open = function(item) {
        // add iframe to the page
        angular.element("[data-ng-app='Pundit2']").after(template);
        // disable page scroll
        overflow = angular.element('body').css('overflow');
        angular.element('body').css('overflow', 'hidden');
        imgItem = item;
    };

    var close = function() {
        // restore overflow
        angular.element('body').css('overflow', overflow);
        // remove iframe
        angular.element('.pnd-image-fragment-frame').remove();
    };

    // @param poly is a polygon made with image fragment annotator conventions
    imageFragmentHelper.createItemFromPolygon = function(poly) {
        var text = imgItem.image.substring(imgItem.image.lastIndexOf('/') + 1, imgItem.image.length);
        // TODO make a better uri generation (eg. md5(time+img.src))
        var item = {
            uri: NameSpace.fragmentBaseUri + 'image/' + new Date().getTime(),
            type: [NameSpace.fragments.imagePart],
            label: 'Fragment of ' + text,
            description: 'This fragment represents a part of the image ' + text,
            isPartOf: imgItem.image,
            pageContext: XpointersHelper.getSafePageContext(),
            polygon: angular.copy(poly.points),
            parentItemXP: imgItem.uri
        };

        return new Item(item.uri, item);

    };

    return imageFragmentHelper;
});