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

var Core = require('aerogear-core');

/**
    The AGPipeline provides a persistence API that is protocol agnostic and does not depend on any certain data model. Through the use of adapters, this library provides common methods like read, save and delete that will just work.
    @status Stable
    @class
    @augments Core
    @param {String|Array|Object} [config] - A configuration for the pipe(s) being created along with the AGPipeline. If an object or array containing objects is used, the objects can have the following properties:
    @param {String} config.name - the name that the pipe will later be referenced by
    @param {String} [config.type="Rest"] - the type of pipe as determined by the adapter used
    @param {Object} [config.settings={}] - the settings to be passed to the adapter. For specific settings, see the documentation for the adapter you are using.
    @returns {Object} pipeline - The created AGPipeline containing any pipes that may have been created
    @example
// Create an empty Pipeline
var pl = Pipeline();

// Create a single pipe using the default adapter
var pl2 = AeroGear.Pipeline( "tasks" );

// Create multiple pipes using the default adapter
var pl3 = AeroGear.Pipeline( [ "tasks", "projects" ] );

// Create a new REST pipe with a custom ID using an object
var pl4 = AeroGear.Pipeline({
    name: "customPipe",
    type: "rest",
    settings: {
        recordId: "CustomID"
    }
});

// Create multiple REST pipes using objects
var pl5 = AeroGear.Pipeline([
    {
        name: "customPipe",
        type: "rest",
        settings: {
            recordId: "CustomID"
        }
    },
    {
        name: "customPipe2",
        type: "rest",
        settings: {
            recordId: "CustomID"
        }
    }
]);
 */

var AGPipeline = function( config ) {
    // Allow instantiation without using new
    if ( !( this instanceof AGPipeline ) ) {
        return new AGPipeline( config );
    }

    // Super constructor
    Core.call( this );

    // Save a reference to the AGPipeline Config
    this.config = config || {};

    this.lib = "AGPipeline";
    this.type = config ? config.type || "Rest" : "Rest";

    /**
        The name used to reference the collection of pipe instances created from the adapters
        @memberOf AGPipeline
        @type Object
        @default pipes
     */
    this.collectionName = "pipes";

    this.add( config, AGPipeline );
};

AGPipeline.prototype = Core;
AGPipeline.constructor = AGPipeline;

/**
    The adapters object is provided so that adapters can be added to the AGPipeline namespace dynamically and still be accessible to the add method
    @augments AGPipeline
 */
AGPipeline.adapters = {};

/**
    Export the AGPipeline
*/
module.exports = AGPipeline;
