var uuidv4 = require('uuid/v4');


var args = process.argv;
if (args.length < 3) {
    console.log('Usage util.sh uuid  -  Generates a new uuid value \n');
} else {
    switch (args[2]) {
        case 'uuid': console.log(uuidv4());
        break;

        default:
            console.log('Usage util.sh uuid  -  Generates a new uuid value \n');
            
    }
}