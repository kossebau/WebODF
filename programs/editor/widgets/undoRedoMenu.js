/**
 * Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>
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

/*global wodo, runtime, EditorSession*/

goog.provide("wodo.widgets.UndoRedoMenu");

goog.require("goog.dom");
goog.require("goog.ui.ToolbarButton");
goog.require("goog.events");
goog.require("goog.events.EventType");
goog.require("wodo.EditorSession");

wodo.widgets.UndoRedoMenu = function (container) {
    "use strict";

    var self = this,
        editorSession,
        undoButton,
        redoButton,
        children;

    function checkUndoButtons(e) {
        if (undoButton) {
            undoButton.setEnabled(e.undoAvailable === true);
        }
        if (redoButton) {
            redoButton.setEnabled(e.redoAvailable === true);
        }
    }

    this.setEditorSession = function(session) {
        if (editorSession) {
            editorSession.unsubscribe(EditorSession.signalUndoStackChanged, checkUndoButtons);
        }

        editorSession = session;
        if (editorSession) {
            editorSession.subscribe(EditorSession.signalUndoStackChanged, checkUndoButtons);
            // TODO: checkUndoButtons(editorSession.getundoredoavailablalalo());
        } else {
            children.forEach(function (element) {
                element.setEnabled(false);
            });
        }
    };

    /*jslint emptyblock: true*/
    this.onToolDone = function () {};
    /*jslint emptyblock: false*/

    function init() {
        undoButton = new goog.ui.ToolbarButton("Undo");//goog.dom.createDom('div', 'icon goog-edit-undo'));
        undoButton.setTooltip(runtime.tr('Undo'));
        undoButton.setEnabled(false); // TODO: get current session state
        container.addChild(undoButton, true);
        goog.events.listen(undoButton.getContentElement(), goog.events.EventType.CLICK, function () {
            if (editorSession) {
                editorSession.undo();
                self.onToolDone();
            }
        });

        redoButton = new goog.ui.ToolbarButton("Redo");//goog.dom.createDom('div', 'icon goog-edit-redo'));
        redoButton.setTooltip(runtime.tr('Redo'));
        redoButton.setEnabled(false); // TODO: get current session state
        container.addChild(redoButton, true);
        goog.events.listen(redoButton.getContentElement(), goog.events.EventType.CLICK, function () {
            if (editorSession) {
                editorSession.redo();
                self.onToolDone();
            }
        });

        children = [undoButton, redoButton];
    }

    init();
};
