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

/*global goog, wodo, EditorSession*/

goog.provide("wodo.widgets.CurrentStyle");

goog.require("goog.events");
goog.require("wodo.EditorSession");
goog.require("wodo.widgets.ParagraphStyles");

wodo.widgets.CurrentStyle = function (container) {
    "use strict";

    var paragraphStyleSelector,
        editorSession;

    function setParagraphStyle(e) {
        var newStyleName = e.target.value;
        if (newStyleName !== editorSession.getCurrentParagraphStyle()) {
            editorSession.setCurrentParagraphStyle(newStyleName);
        }
    }

    function selectParagraphStyle(info) {
        if (info.type === "style") {
            paragraphStyleSelector.setValue(info.styleName);
        }
    }

    this.setEditorSession = function (session) {
        if (editorSession) {
            goog.events.unlisten(paragraphStyleSelector, wodo.widgets.ParagraphStyles.EventType.CHANGE, setParagraphStyle);
            editorSession.unsubscribe(EditorSession.signalParagraphChanged, selectParagraphStyle);
        }

        paragraphStyleSelector.setEditorSession(session);
        editorSession = session;

        if (editorSession) {
            goog.events.listen(paragraphStyleSelector, wodo.widgets.ParagraphStyles.EventType.CHANGE, setParagraphStyle);
            editorSession.subscribe(EditorSession.signalParagraphChanged, selectParagraphStyle);
        }
    };

    function init() {
        paragraphStyleSelector = new wodo.widgets.ParagraphStyles();
        paragraphStyleSelector.setEnabled(false);
        container.addChild(paragraphStyleSelector, true);
    }

    init();
};
goog.inherits(wodo.widgets.CurrentStyle, wodo.widgets.ParagraphStyles);
