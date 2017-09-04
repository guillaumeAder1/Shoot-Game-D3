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
        console.log('load', _params, counterDom, counter, container, rootDom, screenSize);

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
                destroyTarget(d3.select(this.parentNode));
                addCounter(50);
            });
        var inner = group.append('circle')
            .attr('r', 10)
            .attr('cx', center.cx)
            .attr('cy', center.cy)
            .on('click', function() {
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
}