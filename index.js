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
    var statsCount = [];
    var bulletCounter = 0;
    var bulletsCoordinate = [];
    var targetBBSize;
    var defValue = 25;

    this.init = function () {
        _params = params;
        createDomElements();
        createData();
        _params.gameTimer && createTimer(_params.gameTimer);
        writeCounter();
        addGun();
        load();
    };
    /**
     * initialize all dom element
     */
    function createDomElements() {
        counter = 0;
        counterDom = document.querySelector('#counter');
        // create svg
        container = d3.select('#svg').append('svg')
            .attr('width', '100%')
            .attr('height', '100vh')
            .style('background-color', '#e5e5e5');
        rootDom = document.getElementById('svg')
        screenSize = {
            w: rootDom.offsetWidth,
            h: rootDom.offsetHeight
        };
        // change cursor
        document.body.style.cursor = 'crosshair';
        // listener for pause event
        document.addEventListener('keyup', function (e) {
            if (e.keyCode !== 13) { return; }
            paused = !paused;
        });
    }
    /**
     * create array to list score object and data
     */
    function createData() {
        targetParams = new Array(_params.nbrTargetZone).fill();
        targetParams.forEach(function (element, index, arr) {
            var cur = (index === 0) ? ((arr.length - index) * defValue) + defValue + 150 : (arr.length - index) * defValue;
            targetParams[index] = { _value: cur };
            statsCount.push({ val: cur, hit: 0 })
        }, this)
        targetParams.reverse();
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
            bullet.append('circle')
                .attr('class', 'bullet')
                .attr('r', function (d) { return d.r })
                .attr('cx', function (d) { return d.origin.x })
                .attr('cy', function (d) { return d.origin.y })
                .transition().delay(function (d, i) { return i * 2 })
                .attr('cx', function (d) { return d.destination.x })
                .attr('cy', function (d) { return d.destination.y })
                .attr('r', function (d) { return d.r / 2 })
                .style('opacity', 0.5)
                .on('end', function () {
                    d3.select(this).remove();
                });
        });
    }

    /**
     * create Data object for bullet, one of more bullet depends of type
     * can alter the precision as well
     * @param {String} type - auto / shotgun / single [gunType from config]
     * @param {array} coord - coor destination
     */
    function createBullet(type, coord) {
        var _d = [];
        if (type === 'shotgun') {
            for (var i = 0; i < 6; i++) {
                var randX = Math.floor(Math.random() * 15);
                var randY = Math.floor(Math.random() * 20);
                var randSign = (Math.floor(Math.random() * 10) % 2 === 0) ? true : false;
                randX = (randSign) ? randX : -randX;
                randY = (randSign) ? randY : -randY;
                _d.push({
                    origin: {
                        x: screenSize.w / 2,
                        y: screenSize.h
                    },
                    destination: {
                        x: coord[0] + randX,
                        y: coord[1] + randY
                    },
                    r: Math.floor(Math.random() * 7)
                })
            }
        } else {
            // single bullet
            _d.push({
                origin: {
                    x: screenSize.w / 2,
                    y: screenSize.h
                },
                destination: {
                    x: coord[0],
                    y: coord[1]
                },
                r: 10
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
        var timeTimer = setInterval(function () {
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
        $('#percentage').html("<h3><b>" + Math.floor(res) + "</b>% hit</h3>");

        // per seconde 
        // TODO need to to another hidden timer to calculate when no game limite
        if (_params.gameTimer) {
            var ti = Math.floor(counter / _params.gameTimer)
            $('#scorePermin').html("<h3><b>" + ti + "</b> pts/sec</h3>");
        }

        // bullet counter
        $('#bulletCount').html("<h3><b>" + bulletCounter + "</b> bullets shot</h3>")

        // target vizu
        var _w = targetBBSize.w * 2;
        var _h = targetBBSize.h * 2;
        var target = d3.select('#targetVizu').append('svg')
            .attr('width', _w + 'px')
            .attr('height', _h + 'px')

        target.append('circle')
            .attr('r', _w / 2)
            .attr('cx', _w / 2)
            .attr('cy', _h / 2)
            .style('fill', 'lightgreen')
            .transition();
        setTimeout(function () {
            target.selectAll('circle[class="marker"]').data(bulletsCoordinate).enter()
                .append('circle')
                .attr('class', 'marker')
                .attr('r', 3)
                .attr('cx', function (d, i) { return Math.floor(d.x) * 2 })
                .attr('cy', -100)
                .transition().delay(function (d, i) { return i * 70 })
                .attr('cx', function (d, i) { return Math.floor(d.x) * 2 })
                .attr('cy', function (d, i) { return Math.floor(d.y) * 2 })
        }, 500);

        // by value hit
        var domStats = $('#reportStats');
        statsCount.forEach(function (element) {
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
     * Timer to genereate a new target every ? in millisecond
     * define in the config {displayDelay}
     */
    function load() {
        var timer = setInterval(function () {
            if (!paused) {
                createNewTarget();
                writeCounter();
            }
        }, _params.displayDelay);
    }

    /**
     * Create traget circle vased on config
     * nbrTargetZone represents the number of ring for the target, 
     * every ring has a different score value
     */
    function createNewTarget() {
        var _target = new Target({
            _data: createDataTarget(_params.nbrTargetZone),
            nbrRings: _params.nbrTargetZone,
            targetSizeRatio: _params.targetSizeRatio,
            isMoving: _params.isMoving,
            removeAfter: _params.removeAfter,
            svgContainer: container,
            targetParams: targetParams,
            shotCallback: targetCallback,
            statsCount: statsCount
        });
        _target.init();
    }
    /**
     * Fire after target is shot
     * should return data for stats:
     *  - score 
     *  - shot position   
     */
    function targetCallback(bulletCoord, value) {
        // store target size
        if (!targetBBSize) {
            targetBBSize = {
                w: bulletCoord.bbox[0],
                h: bulletCoord.bbox[1]
            }
        }
        // save bullet coord
        bulletsCoordinate.push(bulletCoord);
        // add counter value by cat
        countStats(value);
        // add counter Point
        addCounter(value)
    }

    function countStats(val) {
        statsCount.forEach(function (element) {
            if (element.val === Number(val)) {
                element.hit += 1;
            }
        }, this);
    }

    function createDataTarget(nbrRings) {
        var def = defValue; // default circle value radius
        var _origin = {
            cx: randomDest('x'),
            cy: randomDest('y')
        };
        var _dest = {
            cx: randomDest('x'),
            cy: randomDest('y')
        };
        var _rev = targetParams.slice().reverse();

        var data = _rev.map(function (element, index, arr) {
            return {
                r: (def * index) + (def * (index + 1)), // set radius val
                val: element._value,
                origin: _origin,
                dest: _dest,
                color: (index % 2 === 0) ? 'black' : 'red'
            }
        }, this);
        return data.reverse();
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

    /*** 
     * @param {number} value - count the score, depend of the ring's value  
     */
    function addCounter(value) {
        targetShot += 1;
        counter += value;
        counterDom.innerHTML = counter;
    }
};