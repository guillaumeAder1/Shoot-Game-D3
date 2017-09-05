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
    var fontWeigthList = [900, 800, 700, 600, 500, 400, 300, 200, 100];
    var timerDom;
    var timerLimit;
    var statsCount = [];
    var bulletCounter = 0;

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
        for (var i = 0; i < _params.nbrTargetZone; i++) {
            targetParams.push({ _value: (i + 1) * 25 });
            statsCount.push({ val: (i + 1) * 25, hit: 0 })
        }
        if (_params.gameTimer) {
            createTimer(_params.gameTimer);
        }
        writeCounter();
        addGun();
        load();
    }

    function addGun() {
        // var _event = (_params.gunType === 'single') ? 'click' : 'mousedown';
        var _event = 'mousedown';

        container.on(_event, function repeat(e) {
            bulletCounter += 1;
            d3.event.preventDefault();
            var coord = d3.mouse(this);

            var bullets = createBullet(_params.gunType, coord);

            
            var bullet = container.selectAll('circle[class="bullet"]').data(bullets).enter()
            console.log(bullet)
            bullet.append('circle')
                .attr('class', 'bullet')
                .attr('r', function(d){return d.r})
                .attr('cx', function(d){return d.origin.x})
                .attr('cy', function(d){return d.origin.y})
                .transition().delay(function(d,i){ return i * 2})
                .attr('cx', function(d){return d.destination.x})
                .attr('cy', function(d){return d.destination.y})
                .attr('r', 3)
                .style('opacity', 0.5)
                .on('end', function(){
                    d3.select(this).remove();
                    //repeat().bind(container);
                });

            // if (_params.gunType === 'auto') {
            //     bullet.on('end', repeat);
            // }
        })
    }

    /**
     * create Data object for bullet, one of more bullet depends of type
     * can alter the precision as well
     * @param {String} type - auto / shotgun / single [gunType from config]
     * @param {array} coord - coor destination
     */
    function createBullet(type, coord){
        var _d = [];
        if(type === 'shotgun'){
            for (var i = 0 ; i < 6 ; i ++){
                var randX = Math.floor(Math.random() * 15);
                var randY = Math.floor(Math.random() * 20);
                var randSign = (Math.floor(Math.random() * 10) % 2 === 0 ) ? true : false;
                randX = (randSign) ? randX : - randX ;
                randY = (randSign) ? randY : - randY ;
                _d.push({
                    origin: {
                        x:screenSize.w / 2,
                        y:screenSize.h
                    },
                    destination: {
                        x:coord[0] + randX,
                        y:coord[1] + randY
                    },
                    r: Math.floor(Math.random() * 7)
                })
            }
        } else {
            // single bullet
            _d.push({
                    origin: {
                        x:screenSize.w / 2,
                        y:screenSize.h
                    },
                    destination: {
                        x:coord[0],
                        y:coord[1]
                    },
                    r:15
                });
           
        }
        return _d;
    }

    /**
     * timer to finish the game
     * @param {Number} value - number in second
     */
    function createTimer(value) {
        timerDom = container.append('text')
            .attr('x', 10)
            .attr('y', 60)
            .attr("font-family", "sans-serif")
            .attr('class', 'timeLeft')
            .text('Time left: ' + value);
        var timerValueDom = document.querySelector('.timeLeft');
        var timeTimer = setInterval(function() {
            value = value - 1
            timerValueDom.innerHTML = 'Time left: ' + value;
            if (value === 0) {
                clearInterval(timeTimer);
                paused = true;
                $("#myModal").modal({
                    backdrop: 'static',
                    keyboard: false
                });
                displayStats();
            }
        }, 1000);
    }
    /**
     * get stats player from game finished
     */
    function displayStats() {
        // percentage hit
        var v = targetCounter / targetShot;
        var res = 100 / v;
        var percDom = $('#percentage').html("<h3><b>" + Math.floor(res) + "</b>% hit</h3>");

        // per seconde // need to to another hidden timer to calculate when no game limite
        if (_params.gameTimer) {
            var preMinDom = $('#scorePermin').html("<h3><b>" + Math.floor(counter / _params.gameTimer) + "</b> pts/sec</h3>");
        }

        // bullet counter
        $('#bulletCount').html("<h3><b>" + bulletCounter + "</b> bullets shot</h3>")


        // by value hit
        var domStats = $('#reportStats');
        statsCount.forEach(function(element) {
            domStats.append("<div class'row'><span class='stat-cat'>" + element.val + "</span>: <span class='stat-val'>" + element.hit + "</span></div>")
        }, this);

    }

    /**
     * refresh ui COUNTER
     */
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
    /**
     * Timer to genereate a new tyraget every ? in millisecond
     * define in the config {displayDelay}
     */
    function load() {
        var timer = setInterval(function() {
            if (!paused) {
                createCircle();
                writeCounter();
            }
        }, _params.displayDelay);
    }
    /**
     * Generate a random detination for the target 
     * @param {String} axis - coulf 'x' or 'y' 
     */
    function randomDest(axis) {
        if (axis === 'x') {
            return Math.floor(Math.random() * screenSize.w)
        } else {
            return Math.floor(Math.random() * screenSize.h)
        }
    }
    /**
     * Create traget circle vased on config
     * nbrTargetZone represents the number of ring for the target, 
     * every ring has a different score value
     */
    function createCircle() {

        var center = {
            cx: randomDest('x'),
            cy: randomDest('y')
        };
        var group = container.append('g');
        var dest = {
            cx: randomDest('x'),
            cy: randomDest('y')
        };
        // remove after limit time expires
        group.transition().duration(_params.removeAfter)
            .on('end', function() {
                d3.select(this).remove();
            });

        // create circle base on config number of rings
        for (var i = _params.nbrTargetZone; i > 0; i--) {
            var value = ((_params.nbrTargetZone - i) + 1) * 25;
            var ring = group.append('circle')
                .attr('_value', value)
                .on('click, mousedown', function() {
                    d3.event.preventDefault();
                    var val = d3.select(this).attr('_value')
                    var _this = d3.select(this);
                    var _parent = d3.select(this.parentNode)
                    countStats(val);
                    setTimeout(function() {
                        explodeAnim(_this, val);
                        destroyTarget(_parent);
                        addCounter(Number(val));
                    }, 100);
                })
                .attr('r', ((i + 1) * 25) / _params.targetSizeRatio)
                .attr('cx', center.cx)
                .attr('cy', center.cy)
                .style('fill', function() {
                    return (i % 2 === 0) ? 'black' : 'red';
                })

            if (_params.isMoving) {
                ring.transition(d3.easeCubicOut(.5)).duration(_params.removeAfter)
                    .attr('cx', dest.cx)
                    .attr('cy', dest.cy);
            }
        }
    }

    function countStats(val) {
        statsCount.forEach(function(element) {
            if (element.val === Number(val)) {
                element.hit += 1;
            }
        }, this);
    }
    /**
     * remove the target from dom
     * @param {d3 object} element - the target shot 
     */
    function destroyTarget(element) {
        element.transition().duration(250)
            .attr('r', 1)
            .style('opacity', 0)
            .remove();
    }
    /*** 
     * @param {number} value - count the score, depend of the ring's value  
     */
    function addCounter(value) {
        targetShot += 1;
        counter += value;
        counterDom.innerHTML = counter;
    }

    /**
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
            .attr('font-weight', getFontWeight(indice))
            .text("+" + value).transition(d3.expOut).duration(750 * (indice))
            .style('opacity', 0)
            .attr('x', Number(mouse[0]) + 40)
            .attr('y', Number(mouse[1]) + 40)
            .on('end', function() {
                d3.select(this).remove();
            });

        // Create bubbles
        for (var i = 0; i < Math.floor(Math.random() * 1000) + (indice); i++) {
            // Create random numbers for translation of circles
            var randomNumber = Math.floor((Math.random() < 0.5 ? -1 : 1) * (Math.random() * 100) * (indice));
            var randomNumber2 = Math.floor((Math.random() < 0.5 ? -1 : 1) * (Math.random() * 50) * (indice));
            var color = (Math.floor(Math.random() * 10) % 2 === 0) ? 'black' : 'red';
            // Create circles
            container.append('circle')
                .attr('cx', mouse[0])
                .attr('cy', mouse[1])
                .attr('r', Math.random() * (5 * ((indice / 2))))
                .attr('fill', color)
                .attr('opacity', Math.random() * 5)
                .transition(d3.easeCubicOut())
                .duration(500).delay(function() {
                    return i * 1;
                })
                .attr('transform', 'translate(' + randomNumber + ',' + randomNumber2 + ')')
                .attr('opacity', 0)
                .on('end', function() {
                    d3.select(this).remove()
                });
        }
    }
    /**
     * if strong, should return 900 and then decrease
     * @param {Number} indice - multipier for font weight based on indice value
     */
    function getFontWeight(indice) {
        return fontWeigthList[targetParams.length - indice];
    }

    /**
     * return the index of the rings value []
     * @param {Number} val - ring touched value   
     */
    function getIndexFromValue(val) {
        var value = Number(val);
        return targetParams.findIndex(function(element, i) {
            return (element._value === value)
        }, this);
    }
}