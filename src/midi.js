var handleMidi = function() {
    var inputList =  MIDI.inputs().entries(),
        notDone = true,
        nextInput = {},
        lookingForManufacturer = "www.djtechtools.com",
        foundMF = {};
    
    var withEachMidiInput = function(input) {
        if(input.manufacturer === lookingForManufacturer) {
            foundMF = input.id;
        }
    };

    while(notDone) {
        nextInput = inputList.next();
        notDone = !nextInput.done;

        if(notDone) {
            withEachMidiInput(nextInput.value[1], nextInput.value[0]);
        }
    }

    MIDI.getInput(foundMF).onmidimessage = function(fx) {
        var data = fx.data;

        switch(data[0]) {
            case 179:
                switch(data[1]) {
                    case 0: // tilt left
                        console.log('left', data[2]);
                      break;
                    case 1: // tilt up
                        console.log('up', data[2]);
                      break;
                    case 2: // tilt right
                        console.log('right', data[2]);
                      break;
                    case 3:  // tilt down
                        console.log('down', data[2]);
                      break;
                }
              break;
        }
    };
};