Screw.Unit(function() {     
  describe("Stateful plugin for Raphael elements", function() {    
    var paper;
    var rect;
    before(function() {
      paper = Raphael(0,0,100,100);
      rect = paper.rect(0,0,10,10);
    });
    
    it("adds an addState function to Raphael elements", function() {
      expect(jQuery.isFunction(rect.addState)).to(equal, true);
    });
    
    it("adds a getState function to Raphael elements", function() {
      expect(jQuery.isFunction(rect.getState)).to(equal, true);
    });
    
    it("adds a hasState function to Raphael elements", function() {
      expect(jQuery.isFunction(rect.hasState)).to(equal, true);
    });
    
    it("adds a state function to Raphael elements", function() {
      expect(jQuery.isFunction(rect.state)).to(equal, true);
    });
  
    describe("the addState function", function() {
      it("returns the element after being called", function() {
        expect(rect.addState('test', {})).to(equal, rect);
      });

      it("adds a state to the element", function() {
        var state = { attrs: { height: 100 } };
        rect.addState('test', state);

        expect(rect._states['test']).to(equal, state);
      });
    });

    describe("the getState function", function() {
      it("returns the state that matches the name", function() {
        var state = { attrs: { height: 100 } };
        rect.addState('test', state);

        expect(rect.getState('test')).to(equal, state);
      });

      it("throws an exception if the state wasn't found", function() {
        var errorMessage = null;
        try {
          rect.getState('zzzzz');
        }
        catch(e) {
          errorMessage = e.message;
        }

        expect(errorMessage).to(equal, "You tried to find a state that hasn't been added yet.");
      });
    });

    describe("the hasState function", function() {
      it("returns true if the element has the state", function() {
        rect.addState('test');
        expect(rect.hasState('test')).to(equal, true);
      });
      
      it("returns false if the element doesn't have the state", function() {
        expect(rect.hasState('test')).to(equal, false);
      });
    });

    describe("the state function", function() {
      it("returns the current state's name after being called without parameters", function() {
        rect.addState('test', {});
        rect.state('test');

        expect(rect.state()).to(equal, 'test');
      });

      it("returns the element after being called with parameters", function() {
        rect.addState('test', {});
        expect(rect.state('test')).to(equal, rect);
      });

      describe("event handler changes", function() {
        it("clears out event handlers when switching states", function() {
          rect.node.onclick = function() { };
          rect.addState('test', {});
          rect.state('test');

          expect(rect.node.onclick).to(equal, null);
        });

        it("creates event handlers for each of the events passed in under handlers", function() {
          var mouseoverCalled = false,
              clickCalled = false;

          rect.addState('test', {
            handlers: {
              onmouseover: function() {
                mouseoverCalled = true;
              },

              onclick: function() { 
                clickCalled = true;
              }
            }
          });

          rect.state('test');
          rect.node.onmouseover();
          rect.node.onclick();

          expect(mouseoverCalled).to(equal, true);
          expect(clickCalled).to(equal, true);
        });
      });

      describe("attribute changes", function() {
        it("it switches the attributes of the element to match the attributes for the state", function() {
          rect.addState('test', { 
            attrs: { height: 100, fill: 'green' }
          });

          rect.attr({ height: 0, fill: 'blue' });
          rect.state('test');
          expect(rect.attr('height')).to(equal, 100);
          expect(rect.attr('fill')).to(equal, 'green');
        });

        it("animates with the right speed if a time is passed in", function() {
          var animationSpeed;
          rect.animate = function(attr, speed) {
            animationSpeed = speed;
          };

          rect.addState('test', {}); 
          rect.state('test', { time: 5000 });

          expect(animationSpeed).to(equal, 5000);
        });
      });

      describe("before callbacks", function() {
        it("executes the before function that was passed in before switching states", function() {
          var stateSwitched = false;
          var beforeCalled = false;

          // This attr function should get called after the before  
          // callback is run
          rect.attr = function() {
            stateSwitched = true;
          };

          rect.addState('test', {});

          rect.state('test', {
            before: function() {
              if (!stateSwitched) {
                beforeCalled = true;
              }
            }
          });

          expect(beforeCalled).to(equal, true);
        });

        it("executes the before function that is part of the state before switching states", function() {
          var stateSwitched = false;
          var beforeCalled = false;

          // This attr function should get called after the before  
          // callback is run
          rect.attr = function() {
            stateSwitched = true;
          };

          rect.addState('test', {
            before: function() {
              if (!stateSwitched) {
                beforeCalled = true;
              }
            }
          });
          rect.state('test', {});

          expect(beforeCalled).to(equal, true);
        });

        it("only executes before handlers that are related to the element with the state", function() {        
          var beforeCalled = false;
          rect.addState('rectTest', {
            before: function() {
              beforeCalled = true;
            }
          });

          var circle = paper.circle(0,0,20);
          circle.addState('circleTest', {});
          circle.state('circleTest');

          expect(beforeCalled).to(equal, false);
        });
      });

      describe("after callbacks", function() {
        it("executes the after function that was passed in after switching states normally", function() {
          var stateSwitched = false;
          var afterCalled = false;

          rect.attr = function() {
            stateSwitched = true;
          };

          rect.addState('test', {});
          rect.state('test', {
            after: function() {
              if (stateSwitched) {
                afterCalled = true;
              }
            }
          });

          expect(afterCalled).to(equal, true);
        });

        it("executes the after function that was passed in after switching states with animation", function() {
          var stateSwitched = false;
          var afterCalled = false;

          rect.animate = function(attrs, time, callback) {
            if (callback) {
              stateSwitched = true;
            }
            callback.apply(this);
          };

          rect.addState('test', {});
          rect.state('test', {
            time: 2,
            after: function() {
              if (stateSwitched) {
                afterCalled = true;
              }
            }
          });

          expect(afterCalled).to(equal, true);
        });

        it("executes the after function that is part of the state after switching states normally", function() {
          var stateSwitched = false;
          var afterCalled = false;

          rect.attr = function() {
            stateSwitched = true;
          };

          rect.addState('test', {
            after: function() {
              if (stateSwitched) {
                afterCalled = true;
              }
            }
          });

          rect.state('test');
          expect(afterCalled).to(equal, true);
        });

        it("executes the after function that is part of the state after switching states with animation", function() {
          var stateSwitched = false;
          var afterCalled = false;

          rect.animate = function(attrs, time, callback) {
            if (callback) {
              stateSwitched = true;
            }
            callback.apply(this);
          };

          rect.addState('test', {
            after: function() {
              if (stateSwitched) {
                afterCalled = true;
              }
            }
          });
          rect.state('test', { time: 2 });

          expect(afterCalled).to(equal, true);
        });
      });
    });
  });
  
  describe("Stateful plugin for Raphael sets", function() {
    var paper;
    var set;
    before(function() {
      paper = Raphael(0,0,100,100);
      set = paper.set();
    });
    
    it("adds an addState function Raphael sets", function() {
      expect(jQuery.isFunction(set.addState)).to(equal, true);
    });
    
    it("adds a getState function to Raphael sets", function() {
      expect(jQuery.isFunction(set.getState)).to(equal, true);
    });
    
    it("adds a hasState function to Raphael sets", function() {
      expect(jQuery.isFunction(set.hasState)).to(equal, true);
    });
    
    it("adds a state function to Raphael sets", function() {
      expect(jQuery.isFunction(set.state)).to(equal, true);
    });
    
    describe("the addState function", function() {
      it("returns the set after being called", function() {
        expect(set.addState('test', {})).to(equal, set);
      });
      
      it("adds a state to the set", function() {
        var state = { attrs: { height: 100 } };
        set.addState('test', state);

        expect(set.getState('test')).to(equal, state);
      });
    });
  
    describe("the getState function", function() {
      it("returns the state that matches the name", function() {
        var state = { attrs: { height: 100 } };
        set.addState('test', state);

        expect(set.getState('test')).to(equal, state);
      });
    
      it("throws an exception if the state wasn't found", function() {
        var errorMessage = null;
        try {
          set.getState('zzzzz');
        }
        catch(e) {
          errorMessage = e.message;
        }

        expect(errorMessage).to(equal, "You tried to find a state that hasn't been added yet.");
      });
    });
  
    describe("the hasState function", function() {
      it("returns true if the set has the state", function() {
        set.addState('test');
        expect(set.hasState('test')).to(equal, true);
      });
      
      it("returns false if the set doesn't have the state", function() {
        expect(set.hasState('test')).to(equal, false);
      });
    });
  
    describe("the state function", function() {
      it("returns the current state's name after being called without parameters", function() {
        set.addState('test', {});
        set.state('test');

        expect(set.state()).to(equal, 'test');
      });
      
      it("returns the set after being called with parameters", function() {
        set.addState('test', {});
        expect(set.state('test')).to(equal, set);
      });
    
      it("sets the state for all of its child elements", function() {
        var rect   = paper.rect(5, 5, 5, 5).addState('test');     
        var circle = paper.circle(10, 10, 10).addState('test');
        set.push(rect, circle);
        
        var rectState, circleState;
        rect.state = function(state) {
          rectState = state;
        };
        
        circle.state = function(state) {
          circleState = state;
        };
        
        set.state('test');
        
        expect(rectState).to(equal, 'test');
        expect(circleState).to(equal, 'test');
      });
   
      it("doesn't call the state function on elements that don't have the state", function() {
        var rect = paper.rect(0, 0, 10, 10);
        set.push(rect);
        
        var stateCalled = false;
        rect.state = function() {
          stateCalled = true;
        };
        
        set.state('test');
        expect(stateCalled).to(equal, false);
      });

      describe("before callbacks", function() {
        var rect;
        before(function() {
          rect = paper.rect(1,1,1,1);
          rect.addState("test", {});
        });

        it("executes the before function that was passed in before switching states", function() {
          var stateSwitched = false;
          var beforeCalled = false;
          
          // This rect's attr function should get called by the state function,
          // but ideally, only after the before callback was called 
          rect.attr = function() {
            stateSwitched = true;
          };
          set.push(rect);

          set.addState('test', {});
          set.state('test', {
            before: function() {
              if (!stateSwitched) {
                beforeCalled = true;
              }
            }
          });

          expect(beforeCalled).to(equal, true);
        });

        it("executes the before function that is part of the state before switching states", function() {
          var stateSwitched = false;
          var beforeCalled = false;

          // This rect's attr function should get called by the state function,
          // but ideally, only after the state's before callback was called 
          rect.attr = function() {
            stateSwitched = true;
          };

          set.addState('test', {
            before: function() {
              if (!stateSwitched) {
                beforeCalled = true;
              }
            }
          });
          set.state('test', {});

          expect(beforeCalled).to(equal, true);
        });
      });

      describe("after callbacks", function() {
        var rect;
        before(function() {
          rect = paper.rect(1,1,1,1);
          rect.addState('test', {});
        });

        it("executes the after function that was passed in after switching states", function() {
          var stateSwitched = false;
          var afterCalled = false;

          // This rect's attr function should get called by the state function,
          // but ideally before the after callback is called 
          rect.attr = function() {
            stateSwitched = true;
          };
          set.push(rect);

          set.addState('test', {});
          set.state('test', {
            after: function() {
              if (stateSwitched) {
                afterCalled = true;
              }
            }
          });

          expect(afterCalled).to(equal, true);
        });

        it("executes the after function that is part of the state after switching states", function() {
          var stateSwitched = false;
          var afterCalled = false;

          // This rect's attr function should get called by the state function,
          // but ideally before the after callback is called 
          rect.attr = function() {
            stateSwitched = true;
          };
          set.push(rect);

          set.addState('test', {
            after: function() {
              if (stateSwitched) {
                afterCalled = true;
              }
            }
          });

          set.state('test');
          expect(afterCalled).to(equal, true);
        });
      });
    });
  });
});

