var handleMidi = function() {
    var inputList =  MIDI.inputs().entries(),
        lookingForManufacturer = "www.djtechtools.com",
        foundMF = false;
    
    var MidiFighterTilt = function() {
        this.left = 0;
        this.up = 0;
        this.down = 0;
        this.right = 0;
        this.x = 0;
        this.y = 0;
        this.flist = [];
    };

    MidiFighterTilt.prototype.on = function(fx) {
        this.flist.push(fx);
    };

    MidiFighterTilt.prototype._process_events = function() {
        var that = this;

        this.x = (this.left > this.right) ? -this.left : this.right;
        this.y = (this.up > this.down) ? -this.up : this.down;

        this.flist.forEach(function(v,i){v(that,i);});
    };

    var withEachMidiInput = function(input) {
        if(input.manufacturer === lookingForManufacturer) {
            foundMF = input.id;
        }
    };

    var nextInput = inputList.next();

    while(!nextInput.done) {
        nextInput = inputList.next();

        if(typeof nextInput.value !== 'undefined') {
            console.log(nextInput.value);
            withEachMidiInput(nextInput.value[1], nextInput.value[0]);
        }
    }

    console.log(nextInput);

    if(foundMF !== false) {
        var returnCTX = new MidiFighterTilt();

        MIDI.getInput(foundMF).onmidimessage = function(fx) {
            var data = fx.data;

            switch(data[0]) {
                case 179:
                    switch(data[1]) {
                        case 0: // tilt left
                            //console.log('left', data[2]);
                            returnCTX.left = data[2];
                            returnCTX._process_events();
                          break;
                        case 1: // tilt up
                            //console.log('up', data[2]);
                            returnCTX.up = data[2];
                            returnCTX._process_events();
                          break;
                        case 2: // tilt right
                            //console.log('right', data[2]);
                            returnCTX.right = data[2];
                            returnCTX._process_events();
                          break;
                        case 3:  // tilt down
                            //console.log('down', data[2]);
                            returnCTX.down = data[2];
                            returnCTX._process_events();
                          break;
                    }
                  break;
            }
        };

        return returnCTX;
    } else {
        return false;
    }
};