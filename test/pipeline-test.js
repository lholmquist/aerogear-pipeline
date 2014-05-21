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
                 }
            ]).pipes;

            Object.keys( pipe ).length.should.equal(3);
            Object.keys( pipe )[ 0 ].should.equal("createTest31");
            Object.keys( pipe )[ 1 ].should.equal("createTest32");
            Object.keys( pipe )[ 2 ].should.equal("createTest33");
            pipe.createTest31.getRecordId().should.equal("id");
            pipe.createTest32.getRecordId().should.equal("testId");
            pipe.createTest33.getRecordId().should.equal("testId");
        });

        it('should test the add method', function() {
            var pipeline = Pipeline();

            var pipe = pipeline.add( "addTest" ).pipes;
            Object.keys( pipe ).length.should.equal(1);
        });

        it('should test the remove method', function() {
            var pipeline = Pipeline([
                {
                    name: "createTest31"
                },
                {
                    name: "createTest32",
                    settings: {
                        recordId: "testId"
                    }
                }
            ]);

            Object.keys( pipeline.pipes ).length.should.equal(2);


            pipeline.remove( 'createTest31' );

            Object.keys( pipeline.pipes ).length.should.equal(1);
        });
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

            pipe.read( function( err, data, response ) {
                if( err ) {
                    done( err );
                }

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

            pipe.read({ id: 1 }, function( err, data, response ) {
                if( err ) {
                    done( err );
                }

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
            .reply(200, { customId: 1, contents: "I'm Data" });

            pipe.read({ customId: 1 }, function( err, data, response ) {
                if( err ) {
                    done( err );
                }

                data.customId.should.equal(1);
                data.contents.should.equal('I\'m Data');

                response.statusCode.should.equal( 200 );
                done();
            });
        });


    //     query: {
    //     limit: 10,
    //     date: "2012-08-01"
    //     ...
    // }

        it('call read with no options and a callback - error - network error', function(done) {
            var pipe = Pipeline("createTest").pipes.createTest;

            pipe.read( function( err ) {
                if( err ) {
                    done();
                }
            });
        });

        it('call read with no options and no callback - using on error - network error', function(done) {
            var pipe = Pipeline("createTest").pipes.createTest;

            var pipeReturn = pipe.read();

            pipeReturn.on( "error", function() {
                done();
            });
        });

        it('call read with customId with options and a callback - error - non network error', function(done) {
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
            .reply(404, {});

            pipe.read({ customId: 1 }, function( err, data, response ) {
                if( err ) {
                    done();
                }
            });
        });
    });
    describe('save', function() {
        it('should have a save method', function() {
            var pipe = Pipeline("createTest").pipes.createTest;

            should.exist(pipe.save);
        });

        it('should POST', function(done) {
            var pipe = Pipeline({
                        name: "createTest",
                        settings: {
                            baseURL: "http://localhost/"
                        }
                    }).pipes.createTest;

            nock('http://localhost/')
            .post('/createTest', { content: 'content' })
            .reply(201, { id: 1, content: 'content' });

            pipe.save({ content: 'content' }, function( err, data, response ) {
                if( err ) {
                    done( err );
                }

                response.statusCode.should.equal(201);
                data.id.should.equal(1);
                data.content.should.equal('content');
                done();
            });
        });

        it('should PUT', function(done) {
            var pipe = Pipeline({
                        name: "createTest",
                        settings: {
                            baseURL: "http://localhost/"
                        }
                    }).pipes.createTest;

            nock('http://localhost/')
            .put('/createTest/1', { id: 1, content: 'new content' })
            .reply(204, {});

            pipe.save({ id: 1, content: 'new content' }, function( err, data, response ) {
                if( err ) {
                    done(err);
                }

                response.statusCode.should.equal(204);

                done();
            });
        });
    });

    describe('delete', function() {
       it('should have a remove method', function() {
            var pipe = Pipeline("createTest").pipes.createTest;

            should.exist(pipe.remove);
        });

       it('should remove', function(done) {
            var pipe = Pipeline({
                        name: "createTest",
                        settings: {
                            baseURL: "http://localhost/"
                        }
                    }).pipes.createTest;

            nock('http://localhost/')
                .delete('/createTest/1')
                .reply(204, {});

            var req = pipe.remove({ id: 1, content: 'content' }, function( err, data, response ) {
                if( err ) {
                    done( err );
                }

                response.statusCode.should.equal(204);

                done();
            });

            req.on('error', function(err){
                done(err);
            });
        });
    });
});
