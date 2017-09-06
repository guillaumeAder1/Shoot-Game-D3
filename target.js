function Target(param) {
    var _params;
    this.init = function() {
        _params = param;
        for (var i = _params.nbrRings; i > 0; i--) {
            var value = ((_params.nbrRings - i) + 1) * 25;
            var ring = _params.groupEl.append('circle')
                .attr('_value', value)
                .on('click, mousedown', function() {
                    d3.event.preventDefault();
                    var val = d3.select(this).attr('_value')
                    var _this = d3.select(this);
                    var _parent = d3.select(this.parentNode)
                        //saveShootCoordinates(d3.mouse(this), _parent.node().getBBox())
                    targetShotEvent();

                    countStats(val);
                    setTimeout(function() {
                        explodeAnim(_this, val);
                        destroyTarget(_parent);
                        addCounter(Number(val));
                    }, 100);
                })
                .attr('r', ((i + 1) * 25) / _params.targetSize)
                .attr('cx', _params.center.cx)
                .attr('cy', _params.center.cy)
                .style('fill', function() {
                    return (i % 2 === 0) ? 'black' : 'red';
                });

            if (_params.isMoving) {
                ring.transition(d3.easeCubicOut(.5)).duration(_params.removeAfter)
                    .attr('cx', _params.dest.cx)
                    .attr('cy', _params.dest.cy);
            }
        }
    }

    function targetShotEvent() {
        this.ontargetShotEvent()
    }

    this.ontargetShotEvent = function() {
        //
        console.log('dsf')
    }
}