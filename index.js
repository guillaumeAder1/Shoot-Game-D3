function ShootGame(params) {
    var _params;
    var counter;
    var counterDom;
    var container;
    var rootDom;
    var screenSize;

    this.init = function() {
        _params = params;
        counter = 0;
        counterDom = document.querySelector('#counter');
        container = d3.select('#svg').append('svg')
            .attr('width', '100%')
            .attr('height', '100vh')
            //.style('background-color', 'gray');
        rootDom = document.getElementById('svg')
        screenSize = {
            w: rootDom.offsetWidth,
            h: rootDom.offsetHeight
        };

        document.body.style.cursor = 'crosshair'

        load();
    }

    function load() {
        var timer = setInterval(function() {
            createCircle()
        }, _params.displayDelay);
    }

    function createCircle() {
        var center = {
            cx: Math.floor(Math.random() * screenSize.w),
            cy: Math.floor(Math.random() * screenSize.h)
        };
        var group = container.append('g');
        group.transition()
            .delay(_params.removeAfter)
            .remove();
        var outter = group.append('circle')
            .attr('r', 20)
            .attr('cx', center.cx)
            .attr('cy', center.cy)
            .style('fill', 'red')
            .on('click', function() {
                explodeAnim(d3.select(this))
                destroyTarget(d3.select(this.parentNode));
                addCounter(50);
            });
        var inner = group.append('circle')
            .attr('r', 10)
            .attr('cx', center.cx)
            .attr('cy', center.cy)
            .on('click', function() {
                explodeAnim(d3.select(this))
                destroyTarget(d3.select(this.parentNode));
                addCounter(100);
            });
    }

    function destroyTarget(element) {
        element.transition().duration(250)
            .attr('r', 1)
            .style('opacity', 0)
            .remove();
    }

    function addCounter(value) {
        counter += value;
        counterDom.innerHTML = counter;
    }

    function explodeAnim(element) {
        // Get mouse coordinates
        //var mouse = coord;
        console.log(element)
        var mouse = [
            element.attr('cx'),
            element.attr('cy')
        ];
        // Create many bubbles
        for (var i = 0; i < Math.floor(Math.random() * 2000) + 1; i++) {
            // Create random numbers for translation of circles
            var randomNumber = Math.floor((Math.random() < 0.5 ? -1 : 1) * Math.random() * 100);
            var randomNumber2 = Math.floor((Math.random() < 0.5 ? -1 : 1) * Math.random() * 50);
            var color = (Math.floor(Math.random() * 10) % 2 === 0) ? 'black' : 'red';
            // Create circles
            container.append('circle')
                .attr('cx', mouse[0])
                .attr('cy', mouse[1])
                .attr('r', Math.random() * 5)
                .attr('fill', color)
                .attr('opacity', Math.random() * 5)
                .transition(d3.easeExp)
                .duration(500)
                .attr('transform', 'translate(' + randomNumber +
                    ',' + randomNumber2 + ')')
                .attr('opacity', 0)
                .on('end', function() {
                    d3.select(this).remove()
                });
        }
    }
}