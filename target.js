var Target = function (param) {
    var _params;
    this.group;
    var fontSize = 12;
    var fontWeigthList = [900, 800, 700, 600, 500, 400, 300, 200, 100];

    this.init = function () {
        _params = param;
        this.createGroup()
    }

    /**
     * creat <g> containing the target
     */
    this.createGroup = function () {
        this.group = _params.svgContainer.append('g');
        // remove after limit time expires
        this.group.transition().duration(_params.removeAfter)
            .on('end', function () {
                d3.select(this).remove();
            });
        this.generateTarget(this.group, _params._data, _params.targetSizeRatio, _params.isMoving, _params.removeAfter);
    };
    /**
     * create the target
     */
    this.generateTarget = function (group, data, ratio, isMoving, delay) {
        var _target = group.selectAll('circle[class="target"]').data(data).enter()
            .append('circle')
            .attr('class', 'target')
            .attr('r', function (d, i) { return d.r / ratio })
            .attr('cx', function (d, i) { return d.origin.cx })
            .attr('cy', function (d, i) { return d.origin.cy })
            .style('fill', function (d) { return d.color })
            .on('click, mousedown', function (d, i) {
                targetExplode(
                    d,
                    d3.select(this),
                    d3.select(this.parentNode),
                    d3.mouse(this));
            });
        if (isMoving) {
            _target.transition(d3.easeCubicOut(.5)).duration(delay)
                .attr('cx', function (d) { return d.dest.cx })
                .attr('cy', function (d) { return d.dest.cy });
        }
    }

    function targetExplode(d, _this, _parent, _mouse) {
        d3.event.preventDefault();
        var val = d.val;
        var curPos = saveShootCoordinates(_mouse, _parent.node().getBBox())
        setTimeout(function () {
            explodeAnim(_mouse, val);
            destroyTarget(_parent);
            _params.shotCallback(curPos, val);
        }, 100);

    }
    /**
     * 
     * @param {Array} mouse - mouse pos
     * @param {*} bbox - boundary box of the target <g> element 
     */
    var saveShootCoordinates = function (mouse, bbox) {
        return {
            x: mouse[0] - bbox.x,
            y: mouse[1] - bbox.y,
            bbox: [bbox.width, bbox.height]
        }
    }



    /**
     * @param {d3 element} element 
     * @param {Number} value - value of the ring touched
     */
    function explodeAnim(element, value) {
        var mouse = element
        // use the indice to multiply effect depending of the accuracy
        var indice = getIndexFromValue(value) + 1;
        displayScoreHit(mouse, indice, value);
        // Create random destination bubbles

        var colors = (_params.colors) ? _params.colors : ['black', 'red']
        for (var i = 0; i < Math.floor(Math.random() * 1000) + (indice); i++) {
            // Create random numbers for translation of circles
            var randomNumber = Math.floor((Math.random() < 0.5 ? -1 : 1) * (Math.random() * 100) * (indice));
            var randomNumber2 = Math.floor((Math.random() < 0.5 ? -1 : 1) * (Math.random() * 50) * (indice));
            var color = (Math.floor(Math.random() * 10) % 2 === 0) ? colors[0] : colors[1];
            // Create circles
            _params.svgContainer.append('circle')
                .attr('cx', mouse[0])
                .attr('cy', mouse[1])
                .attr('r', Math.random() * (5 * ((indice / 1.6))))
                .attr('fill', color)
                .attr('opacity', Math.random() * 5)
                .transition(d3.easeCubicOut())
                .duration(500).delay(function () { return i * 1; })
                .attr('transform', 'translate(' + randomNumber + ',' + randomNumber2 + ')')
                .attr('opacity', 0)
                .on('end', function () {
                    d3.select(this).remove()
                });
        }
    }
    /**
     * Score hit marker
     * @param {array} mouse - mouse coord
     * @param {int} indice - multiplier
     * @param {value} value - score number
     */
    function displayScoreHit(mouse, indice, value) {
        _params.svgContainer.append('text')
            .attr('x', Number(mouse[0]) + 20)
            .attr('y', Number(mouse[1]) + 20)
            .attr("font-family", "sans-serif")
            .attr("font-size", (fontSize + indice) + 'px')
            .attr('font-weight', getFontWeight(indice))
            .text("+" + value).transition(d3.expOut).duration(750 * (indice))
            .style('opacity', 0)
            .attr('x', Number(mouse[0]) + 40)
            .attr('y', Number(mouse[1]) + 40)
            .on('end', function () {
                d3.select(this).remove();
            });
    }

    /**
     * if strong, should return 900 and then decrease
     * @param {Number} indice - multipier for font weight based on indice value
     */
    function getFontWeight(indice) {
        return fontWeigthList[_params.targetParams.length - indice];
    }


    /**
     * return the index of the rings value []
     * @param {Number} val - ring touched value   
     */
    function getIndexFromValue(val) {
        var value = Number(val);
        return _params.targetParams.findIndex(function (element, i) {
            return (element._value === value)
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

}