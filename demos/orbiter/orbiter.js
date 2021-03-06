// Created 9/18/21 by Wyatt Homola to play with planetary motion.

window.addEventListener('load', function() {
    let width = document.body.clientWidth; 
    let height = document.body.clientHeight;
    let origin = [width / 2, height / 2]; 
    // Update every interval ms
    let interval = 20;
    // Increase the speed by this amount for each arrow keydown event
    let increment = 0.001; 
    // The force buffer holds forces applied by the player, to be used and then cleared by accel on the next update cycle
    let force_buffer = [0, 0, 0, 0]; 
    // Initialize position and velocity.  Verlet uses current position, previous position, and acceleration to choose next position.  
    // A current velocity is not kept; only the initial velocity is used. 
    let satellite = new Body('satellite', 10, '#eaea35', -1, 1, tf.add(origin, [-200, 0]).arraySync(), tf.add(origin, [-200, 0]).arraySync()); 
    let fixed_bodies = [
        new Body('planet1', 50, 'orange', 3, 100, tf.add(origin, [200, 0]).arraySync(), tf.add(origin, [200, 0]).arraySync()), 
        // new Body('planet2', 50, 'blue', -2, 100, tf.add(origin, [-200, 0]).arraySync(), tf.add(origin, [-200, 0]).arraySync()), 
        new Body('planet3', 20, 'blue', 3, 100, tf.add(origin, [-200, 250]).arraySync(), tf.add(origin, [-200, 250]).arraySync()),
        new Body('planet3', 20, 'blue', 3, 100, tf.add(origin, [-200, -250]).arraySync(), tf.add(origin, [-200, -250]).arraySync()),
    ]; 
    let v_0 = [0, 0.1];

    // Draw the game container, the satellite, and the planet/s
    let container = d3.select('body')
        .append('svg'); 
    
    container.append('rect')
        .attr('id', satellite.id)
        .attr('width', satellite.size + 'px')
        .attr('height', satellite.size + 'px')
        .attr('x', satellite.x_current.arraySync()[0] + 'px')
        .attr('y', satellite.x_current.arraySync()[1] + 'px')
        .style('fill', satellite.color)
    
    container.selectAll('.body')
        .data(fixed_bodies)
        .join('circle')
            .attr('class', 'body')
            .attr('id', (d) => d.id)
            .attr('r', (d) => d.size + 'px')
            .attr('cx', (d) => d.x_current.arraySync()[0] + 'px')
            .attr('cy', (d) => d.x_current.arraySync()[1] + 'px')
            .style('fill', (d) => d.color);

    drawStars(300, width, height); 

    window.addEventListener('keydown', function(event) {
        // Put user-applied forces into the force buffer.

        if(event.code == 'ArrowLeft') {
            force_buffer[0] += increment; 
        } else if (event.code == 'ArrowRight') {
            force_buffer[2] += increment; 
        } else if (event.code == 'ArrowUp') {
            force_buffer[1] += increment; 
        } else if (event.code == 'ArrowDown') {
            force_buffer[3] += increment; 
         }
    })

    let i = 0; 
    setInterval(function() {
        // An application of St??rmer???Verlet Integration to get the moving body's next position, 
        // modified by the introduction of user-applied forces, "thruster-firings" from the arrow keys.
        // See https://en.wikipedia.org/wiki/Verlet_integration#Basic_St%C3%B6rmer%E2%80%93Verlet to make sense of these equations, 
        // and TensorFlow.js docs to understand the vector notation.

        if (i == 0) {
            let x_next = tf.add(
                tf.add(satellite.x_current, tf.tensor(v_0).mul(interval)), 
                satellite.getAccel(fixed_bodies, force_buffer).mul(0.5 * interval **2)
            ); 
            update(x_next); 
            i = 1;
        } else {
            let x_next = tf.add(
                tf.add(
                    satellite.x_current.mul(2), 
                    satellite.x_past.mul(-1)
                ), 
                satellite.getAccel(fixed_bodies, force_buffer).mul(interval ** 2)
            )
            update(x_next); 
        }
        force_buffer = [0, 0, 0, 0];
    }, interval); 

    function update(x_next) {
        // Update the object's attributes
        satellite.x_past = satellite.x_current; 
        satellite.x_current = x_next; 

        // Update the corresponding on-screen body's attributes
        let onscreen_satellite = d3.select('#satellite'); 
        onscreen_satellite.node().x.baseVal.value = satellite.x_current.arraySync()[0]; 
        onscreen_satellite.node().y.baseVal.value = satellite.x_current.arraySync()[1]; 
    }
}); 

function drawStars(count, width, height) {
    // Draw the stars, and prepare to redraw them if the screen is resized
    addStars(300, width, height);
    window.addEventListener('resize', function() {
        width = document.body.clientWidth; 
        height = document.body.clientHeight;
        addStars(300, width, height);
    })

    function addStars(count, width, height) {
        let coords = []; 
        for (let i = 0; i < count; i++) {
            let xval = parseFloat(width) * Math.random(); 
            let yval = parseFloat(height) * Math.random(); 
            coords.push([xval, yval]); 
        }

        d3.select('svg')
            .selectAll('.star')
            .data(coords)
            // The single-draw equivalent is: .enter().append('circle')
            .join('circle')
                .attr('class', 'star')
                .attr('r', function() {return 1.5 * Math.random();})
                .attr('cx', function(d){return d[0];})
                .attr('cy', function(d){return d[1];})
                // .style('fill', 'white')
                .style('fill', function(d) {return getGray();})

        function getGray() {
            // Get a random color which is close to white
            let options = ['a', 'b', 'c', 'e', 'd', 'f']; 
            let choose = () => options[Math.floor(Math.random() * options.length)]; 
            let color = '#'; 
            for(let i = 0; i < 6; i++){
                color += choose(); 
            }
            return color; 
        }
    }
}

class Body {
    constructor(id, size, color, charge, mass, x_current, x_last) {
        this._id = id;
        this._size = size; 
        this._color = color; 
        this._charge = charge; 
        this._mass = mass; 
        this._x_current = tf.tensor(x_current); 
        this._x_last = tf.tensor(x_last);
        this._force_constant = 0.01; 
    }

    get id() {
        return this._id; 
    }
    get size() {
        return this._size; 
    }
    get color() {
        return this._color; 
    }
    get charge() {
        return this._charge; 
    }
    get mass() {
        return this._mass; 
    }
    get x_current() {
        return this._x_current; 
    }
    get x_last() {
        return this._x_last; 
    }
    get force_constant() {
        return this._force_constant; 
    }
    set x_current(val) {
        this._x_current = val; 
    }
    set x_last(val) {
        this._x_last = val; 
    }
    
    getAccel(other_bodies, buffer) {
        // Get the accleration on the body due to forces from all other bodies. 

        let force = tf.tensor([0, 0])
        for(let i=0; i < other_bodies.length; i++) {
            // Note that even the 0d array must be converted with arraySync for use as a number later
            let squared_distance = tf.squaredDifference(this.x_current, other_bodies[i].x_current).sum().arraySync();
            let other_to_this_vect = tf.add(this.x_current, other_bodies[i].x_current.mul(-1))
            force = tf.add(
                tf.add(
                    force, 
                    other_to_this_vect.mul(this.force_constant * this.charge * other_bodies[i].charge / squared_distance)
                ), 
                tf.tensor([buffer[2] - buffer[0], buffer[3] - buffer[1]])
            )
        }
        return force.mul(1 / this.mass); 
    }
}