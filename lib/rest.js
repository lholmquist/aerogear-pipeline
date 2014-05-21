/* AeroGear JavaScript Library
* https://github.com/aerogear/aerogear-js
* JBoss, Home of Professional Open Source
* Copyright Red Hat, Inc., and individual contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var http = require('http'),
    https = require('https'),
    urlParser = require( "url" ),
    AGPipeline = require('./ag-pipeline');

function makeRequest( serverSettings, callback, postData ) {
    var request = http.request( serverSettings, function( response ) {
        var data;

        response.setEncoding('utf-8');
        response.on( "data", function( chunk ) {
            data += chunk;
        });

        response.on( "end", function() {
            if( callback ) {
                callback( null, data, response );
            }
        });
    });

    request.on( "error", function( err ) {
        if( callback ) {
            callback( new Error( err ) );
        }
    });

    request.end( postData );

    return request;
}

/**
    The REST adapter is the default type used when creating a new pipe. It uses jQuery.ajax to communicate with the server. By default, the RESTful endpoint used by this pipe is the app's current context, followed by the pipe name. For example, if the app is running on http://mysite.com/myApp, then a pipe named `tasks` would use http://mysite.com/myApp/tasks as its REST endpoint.
    This constructor is instantiated when the "PipeLine.add()" method is called
    @status Stable
    @constructs AeroGear.Pipeline.adapters.Rest
    @param {String} pipeName - the name used to reference this particular pipe
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.baseURL] - defines the base URL to use for an endpoint
    @param {String} [settings.contentType="application/json"] - the default type of content being sent to the server
    @param {String} [settings.dataType="json"] - the default type of data expected to be returned from the server
    @param {String} [settings.endpoint=pipename] - overrides the default naming of the endpoint which uses the pipeName
    @param {Object|Boolean} [settings.pageConfig] - an object containing the current paging configuration, true to use all defaults or false/undefined to not use paging
    @param {String} [settings.pageConfig.metadataLocation="webLinking"] - indicates whether paging information is received from the response "header", the response "body" or via RFC 5988 "webLinking", which is the default.
    @param {String} [settings.pageConfig.previousIdentifier="previous"] - the name of the prev link header, content var or web link rel
    @param {String} [settings.pageConfig.nextIdentifier="next"] - the name of the next link header, content var or web link rel
    @param {Function} [settings.pageConfig.parameterProvider] - a function for handling custom parameter placement within header and body based paging - for header paging, the function receives a jqXHR object and for body paging, the function receives the JSON formatted body as an object. the function should then return an object containing keys named for the previous/nextIdentifier options and whos values are either a map of parameters and values or a properly formatted query string
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @param {Number} [settings.timeout=60] - the amount of time, in seconds, to wait before timing out a connection and firing the complete callback for that request
    @param {Object} [settings.xhrFields] - specify extra xhr options, like the withCredentials flag
    @returns {Object} The created pipe
    @example
    // Create an empty pipeline
    var pipeline = AeroGear.Pipeline();

    // Add a new Pipe with a custom baseURL, custom endpoint and default paging turned on
    pipeline.add( "customPipe", {
        baseURL: "http://customURL.com",
        endpoint: "customendpoint",
        pageConfig: true
    });

    // Add a new Pipe with a custom paging options
    pipeline.add( "customPipe", {
        pageConfig: {
            metadataLocation: "header",
            previousIdentifier: "back",
            nextIdentifier: "forward"
        }
    });

 */
AGPipeline.adapters.Rest = function( pipeName, settings ) {

    if ( !( this instanceof AGPipeline.adapters.Rest ) ) {
        return new AGPipeline.adapters.Rest( pipeName, settings );
    }

    settings = settings || {};

    // Private Instance vars
    var endpoint = settings.endpoint || pipeName,
        ajaxSettings = {
            // use the pipeName as the default rest endpoint
            url: settings.baseURL ? settings.baseURL + endpoint : endpoint,
            contentType: settings.contentType || "application/json",
            dataType: settings.dataType || "json",
            xhrFields: settings.xhrFields
        },
        recordId = settings.recordId || "id",
        //authorizer = settings.authorizer || null,
        type = "Rest";
        //pageConfig = settings.pageConfig,
        //timeout = settings.timeout ? settings.timeout * 1000 : 60000;

     /**
        Returns the value of the private ajaxSettings var
        @private
        @augments Rest
        @returns {Object}
     */
    this.getAjaxSettings = function() {
        return ajaxSettings;
    };

    /**
        Returns the value of the private recordId var
        @private
        @augments Rest
        @returns {String}
     */
    this.getRecordId = function() {
        return recordId;
    };
};

/**
    Reads data from the specified endpoint
    @param {Object} [options={}] - Additional options
    @param {AeroGear~completeCallbackREST} [options.complete] - a callback to be called when the result of the request to the server is complete, regardless of success
    @param {AeroGear~errorCallbackREST} [options.error] - a callback to be called when the request to the server results in an error
    @param {Object} [options.id] - the value to append to the endpoint URL,  should be the same as the pipelines recordId
    @param {Mixed} [options.jsonp] - Turns jsonp on/off for reads, Set to true, or an object with options
    @param {String} [options.jsonp.callback] - Override the callback function name in a jsonp request. This value will be used instead of 'callback' in the 'callback=?' part of the query string in the url
    @param {String} [options.jsonp.customCallback] - Specify the callback function name for a JSONP request. This value will be used instead of the random name automatically generated by jQuery
    @param {Number} [options.limitValue=10] - the maximum number of results the server should return when using a paged pipe
    @param {String} [options.offsetValue="0"] - the offset of the first element that should be included in the returned collection when using a paged pipe
    @param {Object|Boolean} [options.paging] - this object can be used to overwrite the default paging parameters to request data from other pages or completely customize the paging functionality, leaving undefined will cause paging to use defaults, setting to false will turn off paging and request all data for this single read request
    @param {Object} [options.query] - a hash of key/value pairs that can be passed to the server as additional information for use when determining what data to return
    @param {Object} [options.statusCode] - a collection of status codes and callbacks to fire when the request to the server returns on of those codes. For more info see the statusCode option on the <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax page</a>.
    @param {AeroGear~successCallbackREST} [options.success] - a callback to be called when the result of the request to the server is successful
    @returns {Object} The jqXHR created by jQuery.ajax. To cancel the request, simply call the abort() method of the jqXHR object which will then trigger the error and complete callbacks for this request. For more info, see the <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax page</a>.
    @example
var myPipe = AeroGear.Pipeline( "tasks" ).pipes[ 0 ];

// Get a set of key/value pairs of all data on the server associated with this pipe
var allData = myPipe.read();

// A data object can be passed to filter the data and in the case of REST,
// this object is converted to query string parameters which the server can use.
// The values would be determined by what the server is expecting
var filteredData = myPipe.read({
    query: {
        limit: 10,
        date: "2012-08-01"
        ...
    }
});

    @example
// JSONP - Default JSONP call to a JSONP server
myPipe.read({
    jsonp: true,
    success: function( data ){
        .....
    }
});

// JSONP - JSONP call with a changed callback parameter
myPipe.read({
    jsonp: {
        callback: "jsonp"
    },
    success: function( data ){
        .....
    }
});

    @example
// Paging - using the default weblinking protocal
var defaultPagingPipe = AeroGear.Pipeline([{
    name: "webLinking",
    settings: {
        endpoint: "pageTestWebLink",
        pageConfig: true
    }
}]).pipes[0];

// Get a limit of 2 pieces of data from the server, starting from the first page
// Calling the "next" function will get the next 2 pieces of data, if available.
// Similarily, calling the "previous" function will get the previous 2 pieces of data, if available
defaultPagingPipe.read({
    offsetValue: 1,
    limitValue: 2,
    success: function( data, textStatus, jqXHR ) {
        data.next({
            success: function( data ) {
                data.previous({
                    success: function() {
                    }
                });
            }
        });
    }
});

// Create a new Pipe with a custom paging options
var customPagingPipe = AeroGear.Pipeline([{
    name: "customPipe",
    settings: {
        pageConfig: {
            metadataLocation: "header",
            previousIdentifier: "back",
            nextIdentifier: "forward"
        }
    }
}]).pipes[0];

// Even with custom options, you use "next" and "previous" the same way
customPagingPipe.read({
    offsetValue: 1,
    limitValue: 2,
    success: function( data, textStatus, jqXHR ) {
        data.next({
            success: function( data ) {
                data.previous({
                    success: function() {
                    }
                });
            }
        });
    }
});
 */
AGPipeline.adapters.Rest.prototype.read = function( options, callback ) {
    var url, extraOptions, request, serverSettings,
        that = this,
        recordId = this.getRecordId(),
        ajaxSettings = this.getAjaxSettings();
        //pageConfig = this.getPageConfig();

    //options can be optional
    if( callback === undefined && (options !== undefined && typeof options === 'function') ) {
        callback = options;
        options = {};
    }

    options = options || {};

    options.query = options.query ? options.query : {};

    if ( options[ recordId ] ) {
        url = ajaxSettings.url + "/" + options[ recordId ];
    } else {
        url = ajaxSettings.url;
    }

    // // Handle paging
    // if ( pageConfig && options.paging !== false ) {
    //     // Set custom paging to defaults if not used
    //     if ( !options.paging ) {
    //         options.paging = {
    //             offset: options.offsetValue || 0,
    //             limit: options.limitValue || 10
    //         };
    //     }

    //     // Apply paging to request
    //     options.query = options.query || {};
    //     for ( var item in options.paging ) {
    //         options.query[ item ] = options.paging[ item ];
    //     }
    // }

    // success = function( data, textStatus, jqXHR ) {
    //     var paramMap;

    //     // Generate paged response
    //     if ( pageConfig && options.paging !== false ) {
    //         paramMap = that[ pageConfig.metadataLocation + "PageParser" ]( pageConfig.metadataLocation === "body" ? data : jqXHR );

    //         [ "previous", "next" ].forEach( function( element ) {
    //             data[ element ] = (function( pipe, parameters, options ) {
    //                 return function( callbacks ) {
    //                     options.paging = true;
    //                     options.offsetValue = options.limitValue = undefined;
    //                     options.query = parameters;
    //                     options.success = callbacks && callbacks.success ? callbacks.success : options.success;
    //                     options.error = callbacks && callbacks.error ? callbacks.error : options.error;

    //                     return pipe.read( options );
    //                 };
    //             })( that, paramMap[ pageConfig[ element + "Identifier" ] ], options );
    //         });
    //     }

    //     if ( options.success ) {
    //         options.success.apply( this, arguments );
    //     }
    // };
    // error = function( jqXHR, textStatus, errorThrown ) {
    //     jqXHR = that.formatJSONError( jqXHR );
    //     if ( options.error ) {
    //         options.error.apply( this, arguments );
    //     }
    // };

    // if( !this.getAuthorizer() ) {
    //     return jQuery.ajax( jQuery.extend( {}, this.getAjaxSettings(), extraOptions ) );
    // } else {
    //     return this.getAuthorizer().execute( jQuery.extend( {}, options, extraOptions ) );
    // }

    url = urlParser.parse( url );

    // TODO: add query params
    // TODO: better header thing

    serverSettings = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json"
        },
        //headers: options.headers, //Need to make this better
        method: "GET"
    };

    return makeRequest( serverSettings, callback );

};

/**
    Save data asynchronously to the server. If this is a new object (doesn't have a record identifier provided by the server), the data is created on the server (POST) and then that record is sent back to the client including the new server-assigned id, otherwise, the data on the server is updated (PUT).
    @param {Object} data - For new data, this will be an object representing the data to be saved to the server. For updating data, a hash of key/value pairs one of which must be the `recordId` you set during creation of the pipe representing the identifier the server will use to update this record and then any other number of pairs representing the data. The data object is then stringified and passed to the server to be processed.  To upload a File,  pass in a File or Blob object.  *IE Users - File Upload is only supported in IE 10 and above*
    @param {Object} [options={}] - Additional options
    @param {AeroGear~completeCallbackREST} [options.complete] - a callback to be called when the result of the request to the server is complete, regardless of success
    @param {AeroGear~errorCallbackREST} [options.error] - a callback to be called when the request to the server results in an error
    @param {Object} [options.statusCode] - a collection of status codes and callbacks to fire when the request to the server returns on of those codes. For more info see the statusCode option on the <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax page</a>.
    @param {AeroGear~successCallbackREST} [options.success] - a callback to be called when the result of the request to the server is successful
    @param {AeroGear~progressCallbackREST} [options.progress] - a callback that is a hook to monitor the upload progress when uploading a File.( if available )
    @returns {Object} The jqXHR created by jQuery.ajax. To cancel the request, simply call the abort() method of the jqXHR object which will then trigger the error and complete callbacks for this request. For more info, see the <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax page</a>.
    @example
    var myPipe = AeroGear.Pipeline( "tasks" ).pipes[ 0 ];

    // Store a new task
    myPipe.save({
        title: "Created Task",
        date: "2012-07-13",
        ...
    });

    // Pass a success and error callback, in this case using the REST pipe and jQuery.ajax so the functions take the same parameters.
    myPipe.save({
        title: "Another Created Task",
        date: "2012-07-13",
        ...
    },
    {
        success: function( data, textStatus, jqXHR ) {
            console.log( "Success" );
        },
        error: function( jqXHR, textStatus, errorThrown ) {
            console.log( "Error" );
        }
    });

    // Update an existing piece of data
    var toUpdate = {
        id: "Some Existing ID",
        title: "Updated Task"
    }
    myPipe.save( toUpdate );
 */
AGPipeline.adapters.Rest.prototype.save = function( data, options, callback ) {
    var that = this, serverSettings,
        recordId = this.getRecordId(),
        ajaxSettings = this.getAjaxSettings(),
        type,
        url,
        success,
        error,
        extraOptions,
        formData,
        key, request;

    data = data || {};

    //options can be optional
    if( callback === undefined && (options !== undefined && typeof options === 'function') ) {
        callback = options;
        options = {};
    }

    options = options || {};
    type = data[ recordId ] ? "PUT" : "POST";

    if ( data[ recordId ] ) {
        url = ajaxSettings.url + "/" + data[ recordId ];
    } else {
        url = ajaxSettings.url;
    }

    // success = function( data, textStatus, jqXHR ) {
    //     if ( options.success ) {
    //         options.success.apply( this, arguments );
    //     }
    // };
    // error = function( jqXHR, textStatus, errorThrown ) {
    //     jqXHR = that.formatJSONError( jqXHR );
    //     if ( options.error ) {
    //         options.error.apply( this, arguments );
    //     }
    // };
    // extraOptions = jQuery.extend( {}, ajaxSettings, {
    //     data: data,
    //     type: type,
    //     url: url,
    //     success: success,
    //     error: error,
    //     statusCode: options.statusCode,
    //     complete: options.complete,
    //     headers: options.headers,
    //     timeout: this.getTimeout()
    // });

    // // Check to see if there is a file and create a FormData Object to upload
    // if( "FormData" in window ) {
    //     formData = new FormData();
    //     for( key in data ) {
    //         formData.append( key, data[ key ] );

    //         if( data[ key ] instanceof File || data[ key ] instanceof Blob ) {
    //             // Options to tell jQuery not to process data or worry about content-type.
    //             extraOptions.contentType = false;
    //             extraOptions.processData = false;
    //         }
    //     }

    //     if( extraOptions.contentType === false ) {
    //         extraOptions.data = formData;
    //     }

    //     // the jqXHR doesn't expose upload progress, so we need to create a custom xhr object
    //     extraOptions.xhr = function() {
    //         var myXhr = jQuery.ajaxSettings.xhr();
    //         if( myXhr.upload ){
    //             myXhr.upload.addEventListener( "progress", function() {
    //                 if( options.progress ) {
    //                     options.progress.apply( this, arguments );
    //                 }
    //             }, false );
    //         }
    //         return myXhr;
    //     };
    // }
    // // Stringify data if we actually want to POST/PUT JSON data
    // if ( extraOptions.contentType === "application/json" && extraOptions.data && typeof extraOptions.data !== "string" ) {
    data = JSON.stringify( data );
    // }

    // if( !this.getAuthorizer() ) {
    //     return jQuery.ajax( jQuery.extend( {}, this.getAjaxSettings(), extraOptions ) );
    // } else {
    //     return this.getAuthorizer().execute( jQuery.extend( {}, options, extraOptions ) );
    // }

    url = urlParser.parse( url );

    // TODO: add query params
    // TODO: better header thing

    serverSettings = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json"
        },
        //headers: options.headers, //Need to make this better
        method: type
    };

    return makeRequest( serverSettings, callback );
};

/**
    Remove data asynchronously from the server. Passing nothing will inform the server to remove all data at this pipe's endpoint.
    @param {String|Object} [data] - A variety of objects can be passed to specify the item(s) to remove
    @param {Object} [options={}] - Additional options
    @param {AeroGear~completeCallbackREST} [options.complete] - a callback to be called when the result of the request to the server is complete, regardless of success
    @param {AeroGear~errorCallbackREST} [options.error] - a callback to be called when the request to the server results in an error
    @param {Object} [options.statusCode] - a collection of status codes and callbacks to fire when the request to the server returns on of those codes. For more info see the statusCode option on the <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax page</a>.
    @param {AeroGear~successCallbackREST} [options.success] - a callback to be called when the result of the request to the server is successful
    @returns {Object} The jqXHR created by jQuery.ajax. To cancel the request, simply call the abort() method of the jqXHR object which will then trigger the error and complete callbacks for this request. For more info, see the <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax page</a>.
    @example
    var myPipe = AeroGear.Pipeline( "tasks" ).pipes[ 0 ];

    // Store a new task
    myPipe.save({
        title: "Created Task",
        id: 1
    });

    // Store another new task
    myPipe.save({
        title: "Another Created Task",
        id: 2
    });

    // Store one more new task
    myPipe.save({
        title: "And Another Created Task",
        id: 3
    });

    // Remove a particular item from the server by its id
    myPipe.remove( 1 );

    // Delete all remaining data from the server associated with this pipe
    myPipe.remove();
 */
AGPipeline.adapters.Rest.prototype.remove = function( toRemove, options, callback ) {
    var that = this,
        recordId = this.getRecordId(),
        ajaxSettings = this.getAjaxSettings(),
        delPath = "",
        delId,
        url,
        success,
        error, type, serverSettings,
        extraOptions;

    //options can be optional
    if( callback === undefined && (options !== undefined && typeof options === 'function') ) {
        callback = options;
        options = {};
    }

    if ( typeof toRemove === "string" || typeof toRemove === "number" ) {
        delId = toRemove;
    } else if ( toRemove && toRemove[ recordId ] ) {
        delId = toRemove[ recordId ];
    } else if ( toRemove && !options ) {
        // No remove item specified so treat as options
        options = toRemove;
    }

    options = options || {};

    delPath = delId ? "/" + delId : "";
    url = ajaxSettings.url + delPath;

    // success = function( data, textStatus, jqXHR ) {
    //     if ( options.success ) {
    //         options.success.apply( this, arguments );
    //     }
    // };
    // error = function( jqXHR, textStatus, errorThrown ) {
    //     jqXHR = that.formatJSONError( jqXHR );
    //     if ( options.error ) {
    //         options.error.apply( this, arguments );
    //     }
    // };
    // extraOptions = {
    type = "DELETE";
    //     url: url,
    //     success: success,
    //     error: error,
    //     statusCode: options.statusCode,
    //     complete: options.complete,
    //     headers: options.headers,
    //     timeout: this.getTimeout()
    // };

    // if( !this.getAuthorizer() ) {
    //     return jQuery.ajax( jQuery.extend( {}, this.getAjaxSettings(), extraOptions ) );
    // } else {
    //     return this.getAuthorizer().execute( jQuery.extend( {}, options, extraOptions ) );
    // }

    url = urlParser.parse( url );

    // TODO: add query params
    // TODO: better header thing

    serverSettings = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        headers: {
            //"Accept": "application/json",
            "Content-type": "application/json"
        },
        //headers: options.headers, //Need to make this better
        method: type
    };

    return makeRequest( serverSettings, callback );
};

module.exports = AGPipeline;
