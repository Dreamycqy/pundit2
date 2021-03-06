describe('AnnotationsCommunication service', function() {
    
    var AnnotationsCommunication,
        MyPundit,
        NameSpace,
        AnnotationsExchange,
        NotebookExchange,
        $httpBackend,
        $q,
        $rootScope;

    var userLoggedIn = {
        loginStatus: 1
    };

    var addLoginButton = function() {
        var loginButton = angular.element('<div/>').addClass('pnd-toolbar-login-button');
        angular.element('body').append(loginButton);
        $rootScope.$digest();
        return loginButton;
    };

    var removeLoginButton = function() {
        angular.element('.pnd-toolbar-login-button').remove();
    };

    // var userNotLoggedIn = {
    //     loginStatus: 0
    // };

    beforeEach(module('Pundit2'));

    beforeEach(inject(function(_AnnotationsCommunication_, _MyPundit_, _NameSpace_, _AnnotationsExchange_, _NotebookExchange_,
        _$httpBackend_, _$q_, _$rootScope_){

        AnnotationsCommunication = _AnnotationsCommunication_;
        MyPundit = _MyPundit_;
        NameSpace = _NameSpace_;
        AnnotationsExchange = _AnnotationsExchange_;
        NotebookExchange = _NotebookExchange_;
        $httpBackend = _$httpBackend_;
        $q = _$q_;
        $rootScope = _$rootScope_;

        MyPundit.useCookies = false;

        addLoginButton();
    }));

    afterEach(function(){
        removeLoginButton();
    });

    it("should correctly delete an annotation", function(){
        var ann = {
            id : "testid123",
            graph: {},
            items: {},
            isIncludedIn: "testNotebookID",
            _q: $q.defer()
        };
        var nt = {
            id : "testNotebookID",
            includes: ["testid123"],
            _q: $q.defer(),
            removeAnnotation: function(id){
                if (this.includes[0] === id){
                    this.includes = [];
                }
            }
        };
        // http mock for login
        $httpBackend.whenGET(NameSpace.get('asUsersCurrent')).respond(userLoggedIn);
        // http mock for delete annotation
        $httpBackend.whenDELETE(NameSpace.get('asAnn', {id: ann.id})).respond();
        // mock annotation locally
        AnnotationsExchange.addAnnotation(ann);
        ann._q.resolve(ann);
        // mock notebooks locally
        NotebookExchange.addNotebook(nt);
        nt._q.resolve(nt);
        $rootScope.$digest();

        // get login
        var resolved;
        MyPundit.oldLogin().then(function(){
            // $httpBackend.expectGET(new RegExp(NameSpace.get('asAnnMetaSearch'))).respond();
            AnnotationsCommunication.deleteAnnotation(ann.id).then(function(){
                resolved = true;
            }, function(){
                resolved = true;
            });
        });

        // wait until delete annotation is completed
        waitsFor(function() { return resolved; }, 2000);
        runs(function() {
            expect(AnnotationsExchange.getAnnotations().length).toBe(0);
            expect(AnnotationsExchange.getAnnotationById(ann.id)).toBeUndefined();
            expect(NotebookExchange.getNotebookById(nt.id).includes.length).toBe(0);
        });

        $httpBackend.flush();
    });

    it("should reject promise when try to delete and user is not logged", function(){
        var rejected = false;
        AnnotationsCommunication.deleteAnnotation("ID").then(function(){
            // if resolve the test fail
            expect(rejected).toBe(true);
        }, function(){
            // if reject the rejectedtest pass
            rejected = true;
            expect(rejected).toBe(true);
        });
        $rootScope.$digest();
    });

    it("should reject promise when delete and server responde with error", function(){
        var rejected;
        // http mock for login
        $httpBackend.expectGET(NameSpace.get('asUsersCurrent')).respond(userLoggedIn);
        MyPundit.oldLogin().then(function(){
            $httpBackend.expectDELETE(NameSpace.get('asAnn', {id: "ID"})).respond(500, "Error msg");
            AnnotationsCommunication.deleteAnnotation("ID").then(function(){ }, function(){
                rejected = true;
            });
            waitsFor(function() { return rejected; }, 500);
            runs(function() {
                expect(rejected).toBe(true);
            });
        });
        $httpBackend.flush();
    });

    it("should reject promise when try to edit annotation and server responde with error on content", function(){
        var rejected;
        // http mock for login
        $httpBackend.expectGET(NameSpace.get('asUsersCurrent')).respond(userLoggedIn);
        MyPundit.oldLogin().then(function(){
            $httpBackend.expectPUT(new RegExp(NameSpace.get('asAnnContent', {id: "ID"}))).respond(500, "Error msg");
            $httpBackend.expectPUT(new RegExp(NameSpace.get('asAnnItems', {id: "ID"}))).respond({});
            AnnotationsCommunication.editAnnotation("ID").then(function(){ }, function(){
                rejected = true;
            });
            waitsFor(function() { return rejected; }, 500);
            runs(function() {
                expect(rejected).toBe(true);
            });
        });
        $httpBackend.flush();
    });

    it("should reject promise when try to edit annotation and server responde with error on items", function(){
        var rejected;
        // http mock for login
        $httpBackend.expectGET(NameSpace.get('asUsersCurrent')).respond(userLoggedIn);
        MyPundit.oldLogin().then(function(){
            $httpBackend.expectPUT(new RegExp(NameSpace.get('asAnnContent', {id: "ID"}))).respond({});
            $httpBackend.expectPUT(new RegExp(NameSpace.get('asAnnItems', {id: "ID"}))).respond(500, "Error msg");
            AnnotationsCommunication.editAnnotation("ID").then(function(){ }, function(){
                rejected = true;
            });
            waitsFor(function() { return rejected; }, 500);
            runs(function() {
                expect(rejected).toBe(true);
            });
        });
        $httpBackend.flush();
    });

    it("should correctly edit an annotation", function(){
        var ann = {
            id : "testid123",
            graph: {},
            items: {},
            update: function() {
                var promise = $q.defer();
                promise.resolve();
                return promise.promise;
            },
            _q: $q.defer()
        };

        // mock is user logged
        MyPundit.setIsUserLogged(true);

        // http mock for edit annotation
        $httpBackend.expectPUT(new RegExp(NameSpace.get('asAnnContent', {id: ann.id}))).respond({});
        $httpBackend.expectPUT(new RegExp(NameSpace.get('asAnnItems', {id: ann.id}))).respond({});

        // mock annotation locally
        AnnotationsExchange.addAnnotation(ann);
        ann._q.resolve(ann);
        $rootScope.$digest();

        var resolved;
        AnnotationsCommunication.editAnnotation(ann.id).then(function(){
            resolved = true;
        });
        $httpBackend.flush();
        $rootScope.$digest();
        expect(resolved).toBe(true);
    });

});