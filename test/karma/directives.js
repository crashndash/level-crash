describe('Directives', function() {
  var elm;
  var scope;
  var template;

  beforeEach(module('levelCrash'));
  beforeEach(module('levelCrash.directives'));
  beforeEach(module('static/js/components/roads/roads.html'));
  beforeEach(module('static/js/components/dashboard/dashboard.html'));

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));


  function compileDirective(tpl) {
    inject(function($compile) {
      elm = $compile(tpl)(scope);
    });
    // $digest is necessary to finalize the directive generation
    scope.$digest();
  }

  describe('Road directive', function() {

    beforeEach(inject(function($templateCache) {
      template = $templateCache.get('static/js/components/roads/roads.html');
      $templateCache.put('/js/components/roads/roads.html?DEPLOY_CACHE', template);
    }));

    it('Should pass', function() {
      scope.level = {
        "obstacles": {},
        //"jumpDuration": 1.5,
        //"powerFreq": 0,
        //"obstacleFreq": 0,
        "jumpCount": 11,
        "minOffset": 30,
        "maxOffset": 30,
        "powerups": {},
        //"speedFactor": 1,
        //"availableObstacles": ["wheel"],
        //"carWeight": 10,
        "blocks": {},
        //"spawnFrequency": 100,
        "offsets": {},
        "length": 5,
        "roadAlters": {2: 10},
        //"predefObstacles": {},
        //"jumpHeight": 2,
        "swarms": {3: true}
        //"enemyVariations": ["police"]
      };
      lastlevelLength = 0;
      scope.makeRoads = function() {
        if (lastlevelLength === parseInt(scope.level.length, 10)) {
          return roads;
        }
        roads = [];
        for (var i = 0; i < scope.level.length; i++) {
          roads.push(i);
        }
        lastlevelLength = parseInt(scope.level.length, 10);
        return roads;
      };
      compileDirective('<div data-roads></div>');
      var l = jQuery(elm).find('.segment').length;
      assert.equal(5, l);
    });
  });

  describe('Dashboard directive', function() {
    beforeEach(inject(function($templateCache) {
      template = $templateCache.get('static/js/components/dashboard/dashboard.html');
      $templateCache.put('/js/components/dashboard/dashboard.html?DEPLOY_CACHE', template);
    }));

    it('Should pass', function() {
      var testAuthor = 'test' + Math.random();
      scope.level = {
        author:  testAuthor
      };
      compileDirective('<div data-dashboard class="one dashboard"></div>');
      var author = jQuery(elm).find('#levelauthor').val();
      assert.equal(testAuthor, author);
    });
  });

  describe('Ajax loader directive', function() {
    it('Should pass', function() {
      compileDirective('<div ajax-loader></div>');
      assert.equal('none', jQuery(elm).css('display'));
    });

    it('Should do something when doing requests', function() {
      inject(function($httpBackend, $http) {
        // Mocking away.
        $http.pendingRequests = [
          {}
        ];
        compileDirective('<div ajax-loader></div>');
        $http.pendingRequests = [
          {skipLoader: true}
        ];
        compileDirective('<div ajax-loader></div>');
        $http.pendingRequests = [
        ];
        compileDirective('<div ajax-loader></div>');
      });
    });
  });


});
