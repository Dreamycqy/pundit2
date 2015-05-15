describe("PageItemsContainer", function(){

    var PageItemsContainer,
        $rootScope,
        $compile;

    beforeEach(module('Pundit2'));

    beforeEach(module(
        //'src/Lists/PageItemsContainer/PageItemsContainer.dir.tmpl.html',
        'src/Lists/itemList.tmpl.html'
    ));

    beforeEach(inject(function(_$rootScope_, _$compile_, _PageItemsContainer_){
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        PageItemsContainer = _PageItemsContainer_;
    }));

    /*var compileDirective = function(){
        var elem = $compile('<page-item-container></page-item-container>')($rootScope);
        angular.element('body').append(elem);
        $rootScope.$digest();
        return elem;
    };*/

    /*afterEach(function(){
        angular.element('page-item-container').remove();
    });*/

    it('should correctly initialize', function(){
        expect(PageItemsContainer.buildItemsArray).toBeDefined();
        expect(PageItemsContainer.getItemsArrays).toBeDefined();
        expect(PageItemsContainer.getItemsArrays().length).toBe(0);
    });

});