/** Universe
 *
 * @param {element} stage
 * @returns {Universe}
 */
function Universe(stage) {
    // Default universe stats
    this.difficulty = 40;
    this.update_interval = -1;

    // Initialize the stage
    this.stage = stage;
    this.stage.data('universe', this);
    this.stage.css('position', 'relative');
    this.stage.css('overflow', 'hidden');

    // Add myself to global
    window.universe = this;

    // Default inputs
    window.key_down = [];
    window.key_down[this.input_left] = false;
    window.key_down[this.input_up] = false;
    window.key_down[this.input_right] = false;
    window.key_down[this.input_down] = false;

    // Append info box
    stage.append("<div class='stats'></div>");
    $('.stats').css('position', 'absolute');
    $('.stats').css('z-index', 1);
    $('.stats').css('color', 'white');
    $('.stats').css('background-color', 'blue');
    $('.stats').css('padding', '5px');

    // Bind input events
    $(document).on('keydown', function(e) {
        window.key_down[e.keyCode] = true;
    });
    $(document).on('keyup', function(e) {
        window.key_down[e.keyCode] = false;
    });
    $(window).blur(function() {
        window.universe.stop();
    });
    $(window).focus(function() {
        window.universe.start();
    });

    /** start
     *
     * @returns {Boolean}
     */
    this.start = function() {
        // Clear old interval if needed
        if (this.update_interval !== -1)
            clearInterval(this.update_interval);

        // Add the player if needed
        //if (Universe.player === -1) {
        if ($('#comet-0').length === 0) {
            console.log('adding player');
            Universe.player = this.addComet(true);
        } else {
            console.log(Universe.player);
        }

        // Start the new update interval
        var me = this;
        this.update_interval = setInterval(function() {
            me.update();
        }, Universe.update_speed);

        return true;
    };

    /** stop
     *
     * @returns {Boolean}
     */
    this.stop = function() {
        // Stop the update interval
        clearInterval(this.update_interval);

        return true;
    };

    /** restart
     *
     * @returns {Boolean}
     */
    this.restart = function() {
        // Remove all comets
        $('.comet').remove();

        // Recreate the player
        Universe.player = this.addComet(true);

        // Start the game
        this.start();

        return true;
    };

    /** update
     *
     * @returns {Boolean}
     */
    this.update = function() {
        // Update comets and player
        $.each($('.comet'), function(index, comet) {
            $(comet).data('comet').update();
        });

        // Add new comets if needed
        for (i = 0; i < (this.difficulty - $('.comet').length); i++) {
            this.addComet();
        }

        return true;
    };

    /** addComet
     *
     * @param {Boolean} is_player
     * @returns {Comet}
     */
    this.addComet = function(is_player) {
        // Create and return a new comet with default stats
        return new Comet(stage, is_player);
    };

    /** updateHighScores
     *
     * @returns {Boolean}
     */
    this.updateHighScores = function() {
        return true;
    };
}

/** Comet
 *
 * @param {Element} stage
 * @param {Boolean} is_player
 * @returns {Comet}
 */
function Comet(stage, is_player) {
    // Auto increment id
    this.id = Comet.id_counter++;

    // Default stats
    this.color = 'blue';    // Box color
    this.strength = 2;      // Damage to elements collided with

    // Player/comet specific stats
    if (typeof is_player === 'undefined') {
        // Create a random comet and start it moving
        this.size = Math.floor(Math.random() * (Comet.max_size - Comet.min_size)) + Comet.min_size;
        this.x = stage.width() + Math.floor(Math.random() * stage.width());
        this.y = Math.floor(Math.random() * stage.height());
        this.speed_x = -Math.floor(Math.random() * (Comet.max_speed_x - Comet.min_speed_x)) - Comet.min_speed_x;
        this.speed_y = Math.floor(Math.random() * (Comet.max_speed_y - Comet.min_speed_y)) + Comet.min_speed_y;
        this.color = 'red';
        this.is_player = false;
    } else {
        // Initialize the player
        this.score = 0;
        this.size = Comet.max_size;
        this.x = this.size * 2;
        this.y = stage.height() / 2;
        this.speed_x = 16;
        this.speed_y = 16;
        this.is_player = true;
    }

    // Initialize bounding box
    this.bbox_left = this.x - (this.size / 2);
    this.bbox_right = this.x + (this.size / 2);
    this.bbox_top = this.y - (this.size / 2);
    this.bbox_bottom = this.y + (this.size / 2);

    // Append HTML Element to stage with correct attrs
    stage.append("<div class='comet' id='comet-" + this.id + "'></div>");
    this.element = $('#comet-' + this.id);
    this.element.data('comet', this);
    this.element.css('background-color', this.color);
    this.element.css('position', 'absolute');

    /** collides
     *
     * @param {Comet} comet
     * @returns {Boolean}
     */
    this.collides = function(comet) {
        return ((this.bbox_left > comet.bbox_left && this.bbox_left < comet.bbox_right ||
                this.bbox_right < comet.bbox_right && this.bbox_right > comet.bbox_left) &&
                (this.bbox_top > comet.bbox_top && this.bbox_top < comet.bbox_bottom ||
                        this.bbox_bottom > comet.bbox_top && this.bbox_bottom < comet.bbox_bottom));
    };

    /** update
     *
     * @returns {Boolean}
     */
    this.update = function() {
        // Update size
        this.element.css('width', this.size + 'px');
        this.element.css('height', this.size + 'px');

        // Update position
        this.element.css('left', this.x - (this.size / 2) + 'px');
        this.element.css('top', this.y - (this.size / 2) + 'px');

        // Handle input/ai
        if (this.is_player) {
            if (window.key_down[Universe.input_restart])
                window.universe.restart();
            if (window.key_down[Universe.input_left] && (this.bbox_left - this.speed_x) > 0)
                this.x -= this.speed_x;
            if (window.key_down[Universe.input_up] && (this.bbox_top - this.speed_y) > 0)
                this.y -= this.speed_y;
            if (window.key_down[Universe.input_right] && (this.bbox_right + this.speed_x) < this.element.parent().width())
                this.x += this.speed_x;
            if (window.key_down[Universe.input_down] && (this.bbox_bottom + this.speed_y) < this.element.parent().height())
                this.y += this.speed_y;

            this.score += 0.1;
            $('.stats').html("<div>score: " + Math.floor(this.score) + "</div>");
        } else {
            this.x += this.speed_x;
            this.y += this.speed_y;
        }

        // Check for and handle collisions
        var me = this;
        $.each($('.comet'), function(key, val) {
            var comet = $(val).data('comet');
            if (comet.id !== me.id && me.collides(comet)) {
                if (me.is_player) {
                    me.size -= comet.strength;
                    me.x -= Math.floor(comet.strength / 2);
                    me.y -= Math.floor(comet.strength / 2);
                } else if (comet.is_player) {
                    comet.size -= me.strength;
                    comet.size -= me.strength;
                    comet.x += Math.floor(me.strength / 2);
                    comet.y += Math.floor(me.strength / 2);
                } else if (me.size > comet.size) {
                    if (me.size < Comet.max_growth) {
                        me.size += comet.strength;
                        me.x -= Math.floor(comet.strength / 2);
                        me.y -= Math.floor(comet.strength / 2);
                    }
                    comet.size -= me.strength;
                    comet.x += Math.floor(me.strength / 2);
                    comet.y += Math.floor(me.strength / 2);
                } else {
                    if (comet.size < Comet.max_growth) {
                        comet.size += me.strength;
                        comet.x -= Math.floor(me.strength / 2);
                        comet.y -= Math.floor(me.strength / 2);
                    }
                    me.size -= comet.strength;
                    me.x += Math.floor(comet.strength / 2);
                    me.y += Math.floor(comet.strength / 2);
                }
            }
        });

        // Update bounding box
        this.bbox_left = this.x - (this.size / 2);
        this.bbox_right = this.x + (this.size / 2);
        this.bbox_top = this.y - (this.size / 2);
        this.bbox_bottom = this.y + (this.size / 2);

        // Kill if out of view or too small
        if ((this.size < Comet.min_size) ||
                this.bbox_right < 0 ||
                (this.bbox_left > this.element.parent().width() && this.is_player) ||
                this.bbox_bottom < 0 ||
                this.bbox_top > this.element.parent().height()) {
            this.kill();
        }
        return true;
    };

    /** kill
     *
     * @returns {Boolean}
     */
    this.kill = function() {
        if (this.is_player) {
            $('.stats').append("<div>game over...</div>");
            window.universe.stop();
        } else {
            $('#comet-' + this.id).remove();
        }
    };
}

// Static vars and constants
Universe.input_left = 65;
Universe.input_up = 87;
Universe.input_right = 68;
Universe.input_down = 83;
Universe.input_restart = 27;
Universe.update_speed = 16;
Universe.player = -1;

Comet.id_counter = 0;
Comet.min_size = 16;
Comet.max_size = 64;
Comet.max_growth = 512;
Comet.min_speed_x = 2;
Comet.max_speed_x = 8;
Comet.min_speed_y = -8;
Comet.max_speed_y = 8;