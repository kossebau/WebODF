/**
 * Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>
 *
 * @licstart
 * This file is part of WebODF.
 *
 * WebODF is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License (GNU AGPL)
 * as published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.
 *
 * WebODF is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 * @licend
 *
 * @source: http://www.webodf.org/
 * @source: https://github.com/kogmbh/WebODF/
 */

/*global define, ops*/


/**
 * Pass memberId to inject the addMember op on requestReplay()
 *
 * @constructor
 * @implements ops.OperationRouter
 */
function OneUserLocalOperationRouter(memberId) {
    "use strict";

    var /**@const @type {!string}*/
        EVENT_BEFORESAVETOFILE =                  "beforeSaveToFile",
        /**@const @type {!string}*/
        EVENT_SAVEDTOFILE =                       "savedToFile",
        /**@const @type {!string}*/
        EVENT_HASLOCALUNSYNCEDOPERATIONSCHANGED = "hasLocalUnsyncedOperationsChanged",
        /**@const @type {!string}*/
        EVENT_HASSESSIONHOSTCONNECTIONCHANGED =   "hasSessionHostConnectionChanged",
        events = new core.EventNotifier([
            EVENT_BEFORESAVETOFILE,
            EVENT_SAVEDTOFILE,
            EVENT_HASLOCALUNSYNCEDOPERATIONSCHANGED,
            EVENT_HASSESSIONHOSTCONNECTIONCHANGED,
            ops.OperationRouter.signalProcessingBatchStart,
            ops.OperationRouter.signalProcessingBatchEnd
        ]),
        /**@type{!ops.OperationFactory}*/
        operationFactory,
        playbackFunction,
        /**@type{number}*/
        groupIdentifier = 0;

    /**
     * Sets the factory to use to create operation instances from operation specs.
     *
     * @param {!ops.OperationFactory} f
     * @return {undefined}
     */
    this.setOperationFactory = function (f) {
        operationFactory = f;
    };

    /**
     * Sets the method which should be called to apply operations.
     *
     * @param {!function(!ops.Operation):boolean} playback_func
     * @return {undefined}
     */
    this.setPlaybackFunction = function (playback_func) {
        playbackFunction = playback_func;
    };

    this.requestReplay = function (done_cb) {
        var op = new ops.OpAddMember();
        // sneak in the AddMember at this point
        op.init({
            timestamp: Date.now(),
            memberid: memberId,
            setProperties: {
                fullName: "Unknown",
                color:    "black",
                imageUrl: "avatar-joe.png"
            }
        });
        playbackFunction(op);
        done_cb();
    };


    /**
     * Brings the locally created operations into the game.
     *
     * @param {!Array.<!ops.Operation>} operations
     * @return {undefined}
     */
    this.push = function (operations) {
        // This is an extremely simplistic and VERY temporary implementation of operation grouping.
        // In order to improve undo behaviour, the undo manager requires knowledge about what groups
        // of operations were queued together, so these can be stored in a single undo state.
        // The current implementation is only designed for a localeditor instance & the TrivialUndoManager.
        // TODO redesign this concept to work with collaborative editing
        groupIdentifier += 1;
        events.emit(ops.OperationRouter.signalProcessingBatchStart, {});
        operations.forEach(function (op) {
            var /**@type{?ops.Operation}*/
                timedOp,
                opspec = op.spec();

            opspec.timestamp = Date.now();
            timedOp = operationFactory.create(opspec);
            timedOp.group = "g" + groupIdentifier;

            // TODO: handle return flag in error case
            playbackFunction(timedOp);
        });
        events.emit(ops.OperationRouter.signalProcessingBatchEnd, {});
    };

    /**
     * @param {function()} cb
     */
    this.close = function (cb) {
        cb();
    };

    /**
     * @param {!string} eventId
     * @param {!Function} cb
     * @return {undefined}
     */
    this.subscribe = function (eventId, cb) {
        events.subscribe(eventId, cb);
    };

    /**
     * @param {!string} eventId
     * @param {!Function} cb
     * @return {undefined}
     */
    this.unsubscribe = function (eventId, cb) {
        events.unsubscribe(eventId, cb);
    };

    /**
     * @return {!boolean}
     */
    this.hasLocalUnsyncedOps = function () {
        return false;
    };

    /**
     * @return {!boolean}
     */
    this.hasSessionHostConnection = function () {
        return true;
    };
}

/**
 * @constructor
 * @implements SessionBackend
 */
function OneUserLocalSessionBackend(docUrl) {
    "use strict";

    var memberId = "localuser";
    /**
        * @return {!string}
        */
    this.getMemberId = function () {
        return memberId;
    };

    /**
     * @param {!odf.OdfContainer} odfContainer (ignored/not needed for this backend)
     * @param {!function(!Object)} errorCallback
     * @return {!ops.OperationRouter}
     */
    this.createOperationRouter = function (odfContainer, errorCallback) {
        return new OneUserLocalOperationRouter(memberId);
    };

    /**
     * @return {!string}
     */
    this.getGenesisUrl = function () {
        return docUrl;
    };
}
