var exec = require('child_process').exec;

exec('./node_modules/.bin/mocha -R Nyan', function( err, stdout, stderr ) {
    console.log( stdout );

    if( err ) {
        console.log( stderr );
        //exec('say fucking tests');
        return;
    }

    //exec('say fuck yeah');
});
