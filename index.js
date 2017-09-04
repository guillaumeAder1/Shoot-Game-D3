function ShootGame(params) {
    var _params;
    var counter;
    var counterDom;
    var container;
    var rootDom;
    var screenSize;
    var targetCounterDom;
    var targetCounter = 0;
    var targetShot = 0;
    var paused = false;
    var targetParams;
    var fontSize = 12;

    this.init = function() {
        _params = params;
        counter = 0;
        counterDom = document.querySelector('#counter');
        container = d3.select('#svg').append('svg')
            .attr('width', '100%')
            .attr('height', '100vh')
            .style('background-color', '#e5e5e5');
        rootDom = document.getElementById('svg')
        screenSize = {
            w: rootDom.offsetWidth,
            h: rootDom.offsetHeight
        };
        document.body.style.cursor = 'crosshair';

        document.addEventListener('keyup', function(e) {
            if (e.keyCode !== 13) { return; }           
            paused = !paused;
        });

        targetParams = new Array();
        for(var i = 0 ; i < _params.nbrTargetZone ; i ++){
            targetParams.push({_value: (i+1) * 25})
        }

        writeCounter();
        load();
    }

    function writeCounter() {
        if (targetCounterDom) {
            targetCounterDom.remove();
            targetMissedDom.remove()
            targetCounter += 1;
        }
        targetCounterDom = container.append('text')
            .attr('x', 10)
            .attr('y', 20)
            .attr("font-family", "sans-serif")
            .text('Total target: ' + targetCounter);

        targetMissedDom = container.append('text')
            .attr('x', 10)
            .attr('y', 40)
            .attr("font-family", "sans-serif")
            .text('Target missed: ' + (targetCounter - targetShot).toString());
    }

    function load() {
        var timer = setInterval(function() {
            if(!paused){
                createCircle();
                writeCounter();
            }            
        }, _params.displayDelay);
    }

    function randomDest(axis) {
        if (axis === 'x') {
            return Math.floor(Math.random() * screenSize.w )
        } else {
            return Math.floor(Math.random() * screenSize.h )
        }
    }

    function createCircle() {

        var center = {
            cx: Math.floor(Math.random() * screenSize.w ),
            cy: Math.floor(Math.random() * screenSize.h )
        };
        var group = container.append('g');
        var dest = {
            cx: randomDest('x'),
            cy: randomDest('y')
        }

        group.transition().duration(_params.removeAfter)
            .on('end', function() {
                d3.select(this).remove();
            })


        for(var i = _params.nbrTargetZone ; i > 0 ; i --){
            var value = ((_params.nbrTargetZone - i) + 1) * 25;
            var ring = group.append('circle')           
            .attr('_value', value)
            .on('click, mousedown', function() {
                var val = d3.select(this).attr('_value')
                explodeAnim(d3.select(this), val);
                destroyTarget(d3.select(this.parentNode));
                addCounter(Number(val));
            })
            .attr('r', ((i+1) * 25) / _params.targetSizeRatio )
            .attr('cx', center.cx)
            .attr('cy', center.cy)
            .style('fill', function(){
                return (i % 2 === 0) ? 'black' : 'red';
            })

            if(_params.isMoving){
                ring.transition(d3.expOut).duration(_params.removeAfter)
                .attr('cx', dest.cx)
                .attr('cy', dest.cy);
            }            
        }
    }

    function destroyTarget(element) {
        element.transition().duration(250)
            .attr('r', 1)
            .style('opacity', 0)
            .remove();
    }

    function addCounter(value) {
        targetShot += 1;
        counter += value;
        counterDom.innerHTML = counter;
    }

    /**
     * 
     * @param {d3 element} element 
     * @param {Number} value - value of the ring touched
     */
    function explodeAnim(element, value) {

        var mouse = [
            element.attr('cx'),
            element.attr('cy')
        ];
        // use the indice to multiply effect depending of the accuracy
        var indice = getIndexFromValue(value) + 1;
      
        container.append('text')
            .attr('x', Number(mouse[0]) + 20)
            .attr('y', Number(mouse[1]) + 20)
            .attr("font-family", "sans-serif")
            .attr("font-size", (fontSize + indice) + 'px')
            .attr('font-weight', 100 * indice)
            .text("+" + value).transition(d3.expOut).duration(750 * (indice))
            .style('opacity', 0)
            .attr('x', Number(mouse[0]) + 40)
            .attr('y', Number(mouse[1]) + 40)
            .on('end', function() {
                d3.select(this).remove();
            });

        // Create bubbles
        for (var i = 0; i < Math.floor(Math.random() * 1000) +  (indice); i++) {
            // Create random numbers for translation of circles
            var randomNumber = Math.floor((Math.random() < 0.5 ? -1 : 1) * (Math.random() * 100) * (indice));
            var randomNumber2 = Math.floor((Math.random() < 0.5 ? -1 : 1) * (Math.random() * 50) * (indice));
            var color = (Math.floor(Math.random() * 10) % 2 === 0) ? 'black' : 'red';
            // Create circles
            container.append('circle')
                .attr('cx', mouse[0])
                .attr('cy', mouse[1])
                .attr('r', Math.random() * (5 * ((indice/2) )))
                .attr('fill', color)
                .attr('opacity', Math.random() * 5)
                .transition(d3.expOut)
                .duration(500)
                .attr('transform', 'translate(' + randomNumber + ',' + randomNumber2 + ')')
                .attr('opacity', 0)
                .on('end', function() {
                    d3.select(this).remove()
                });
        }
    }
    /**
     * return the index of the rings value []
     * @param {Number} val - ring touched value   
     */
    function getIndexFromValue(val){
        var value = Number(val);
        return targetParams.findIndex(function(element, i){
            return (element._value === value)
        }, this);
    }
}