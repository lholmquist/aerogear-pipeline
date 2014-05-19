var http = require('http'),
    should = require('should'),
    nock = require('nock');

var Pipeline = require('../index');

describe('Pipeline: Rest - General', function() {

    describe('Create - ', function () {

        it('should create an empty pipeline', function() {
            var pipeline = Pipeline();

            Object.keys(pipeline.pipes).length.should.equal(0);
        });

        it('should create an empty pipeline with config', function() {

            var pipeline = Pipeline({ type: "Rest" });

            Object.keys(pipeline.pipes).length.should.equal(0);
        });

        it('should create an empty pipeline with array config', function() {

            var pipeline = Pipeline([{ type: "Rest" }]);

            Object.keys(pipeline.pipes).length.should.equal(0);
        });

        it('should create an empty pipeline with array config - 2 pipes - one with no name', function() {

            var pipeline = Pipeline([
                {
                    type: "Rest"
                },
                {
                    name: "pipeWithName"
                }
            ]);

            Object.keys(pipeline.pipes).length.should.equal(1);
            Object.keys(pipeline.pipes)[ 0 ].should.equal("pipeWithName");
        });

        it('should create a pipe with a name - string', function() {
            var pipe = Pipeline( "createTest1" ).pipes;

            Object.keys( pipe ).length.should.equal(1);
            Object.keys( pipe )[ 0 ].should.equal( 'createTest1' );
        });

        it( 'shold create a pipe with a name - array', function() {
            var pipe = Pipeline([
                "createTest21",
                {
                    name: "createTest22",
                    type: "Rest",
                    settings: {
                        recordId: "testId"
                    }
                },
                "createTest23"
            ]).pipes;

            Object.keys( pipe ).length.should.equal(3);
            Object.keys( pipe )[ 0 ].should.equal("createTest21");
            Object.keys( pipe )[ 1 ].should.equal("createTest22");
            Object.keys( pipe )[ 2 ].should.equal("createTest23");
        });

        it('should create pipes using objects', function() {
            var pipe = Pipeline([
                {
                    name: "createTest31"
                },
                {
                    name: "createTest32",
                    settings: {
                        recordId: "testId"
                    }
                },
                {
                    name: "createTest33",
                    type: "Rest",
                    settings: {
                        recordId: "testId"
                    }
                },
                {
                    name: "createTest34",
                    type: "Rest",
                    settings: {
                        xhrFields: { withCredentials: true}
                    }
                }
            ]).pipes;

            Object.keys( pipe ).length.should.equal(4);
            Object.keys( pipe )[ 0 ].should.equal("createTest31");
            Object.keys( pipe )[ 1 ].should.equal("createTest32");
            Object.keys( pipe )[ 2 ].should.equal("createTest33");
            pipe.createTest31.getRecordId().should.equal("id");
            pipe.createTest32.getRecordId().should.equal("testId");
            pipe.createTest33.getRecordId().should.equal("testId");
            pipe.createTest34.getAjaxSettings().xhrFields.withCredentials.should.equal(true);
        });


// // Pipeline to be used for all remaining tests
// var pipeline = Pipeline([
//         {
//             name: "tasks"
//         },
//         {
//             name: "tasksCustom",
//             settings: {
//                 recordId: "taskId"
//             }
//         },
//         {
//             name: "projects",
//             settings: {
//                 baseURL: "baseTest/"
//             }
//         },
//         {
//             name: "tags",
//             settings: {
//                 endpoint: "customEndPoint"
//             }
//         },
//         {
//             name: "users",
//             settings: {
//                 baseURL: "baseURL/",
//                 endpoint: "customEndPoint"
//             }
//         },
//         {
//             name: "text",
//             settings: {
//                 contentType: "application/x-www-form-urlencoded; charset=UTF-8",
//                 dataType: "text"
//             }
//         }
//     ]),
//     pipe = pipeline.pipes.tasks,
//     pipe2 = pipeline.pipes.tasksCustom,
//     pipe3 = pipeline.pipes.projects,
//     pipe4 = pipeline.pipes.tags,
//     pipe5 = pipeline.pipes.users,
//     textPipe = pipeline.pipes.text;

// // Add pipe test
// test( "add method", function() {
//     expect( 2 );

//     var pipe = pipeline.add( "addTest" ).pipes;
//     equal( Object.keys( pipe ).length, 7, "Single Pipe added" );
//     equal( Object.keys( pipe )[ 6 ], "addTest", "Pipe Name addTest" );
// });

// // Remove pipe test
// test( "remove method", function() {
//     expect( 2 );

//     var pipe = pipeline.remove( "addTest" ).pipes;
//     equal( Object.keys( pipe ).length, 6, "Single Pipe removed" );
//     equal( pipe.addTest, undefined, "Removed pipe is really gone" );
// });
    });
});

describe('Pipeline - Rest - Prototype Methods', function() {
    describe(' Read ', function() {
        it('should have a read method', function() {
            var pipe = Pipeline("createTest").pipes.createTest;

            should.exist(pipe.read);
        });

        it('call read with no options and a callback', function(done) {
            var pipe = Pipeline("createTest").pipes.createTest;

            pipe.read( function() {
                done();
            });
        });

        it('call read with no options and a callback - success', function(done) {
            var pipe = Pipeline(
                    {
                        name: "createTest",
                        settings: {
                            baseURL: "http://localhost/"
                        }
                    }).pipes.createTest;

            nock('http://localhost/')
            .get('/createTest')
            .reply(200, {});

            pipe.read( function( response ) {
                done();
            });
        });

        it('call read with options and a callback - success', function(done) {
            var pipe = Pipeline(
                    {
                        name: "createTest",
                        settings: {
                            baseURL: "http://localhost/"
                        }
                    }).pipes.createTest;

            nock('http://localhost/')
            .get('/createTest/1')
            .reply(200, {});

            pipe.read({ id: 1 }, function( response ) {
                done();
            });
        });

        it('call read with customId with options and a callback - success', function(done) {
            var pipe = Pipeline(
                    {
                        name: "createTest",
                        settings: {
                            recordId: "customId",
                            baseURL: "http://localhost/"
                        }
                    }).pipes.createTest;

            nock('http://localhost/')
            .get('/createTest/1')
            .reply(200, {});

            pipe.read({ customId: 1 }, function( response ) {
                done();
            });
        });


    //     query: {
    //     limit: 10,
    //     date: "2012-08-01"
    //     ...
    // }

        it('call read with no options and a callback - error', function(done) {
            var pipe = Pipeline("createTest").pipes.createTest;

            pipe.read( function( err ) {
                if( err ) {
                    done();
                }
            });
        });

        it('call read with no options and no callback - using on error', function(done) {
            var pipe = Pipeline("createTest").pipes.createTest;

            var pipeReturn = pipe.read();

            //pipeReturn.should.be.instanceof(http.ClientRequest);

            pipeReturn.on( "error", function() {
                done();
            });
        });
    });
});
