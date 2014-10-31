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

/*global wodo*/

goog.provide("wodo.widgets.CurrentStyle");

goog.require("wodo.EditorSession");
goog.require("wodo.widgets.ParagraphStyles");

wodo.widgets.CurrentStyle = function () {
    "use strict";

    wodo.widgets.ParagraphStyles.call(this);

    var self = this;

    this.setParagraphStyle = function (e) {
        var newStyleName = e.target.value;
        if (newStyleName !== self.editorSession.getCurrentParagraphStyle()) {
            self.editorSession.setCurrentParagraphStyle(newStyleName);
        }
    };

    this.selectParagraphStyle = function (info) {
        if (info.type === "style") {
            self.setValue(info.styleName);
        }
    };

};
goog.inherits(wodo.widgets.CurrentStyle, wodo.widgets.ParagraphStyles);

wodo.widgets.CurrentStyle.prototype.setEditorSession = function (session) {
    "use strict";

    var self = this;

    if (self.editorSession) {
        goog.events.unlisten(self, wodo.widgets.ParagraphStyles.EventType.CHANGE, self.setParagraphStyle);
        self.editorSession.unsubscribe(wodo.EditorSession.signalParagraphChanged, self.selectParagraphStyle);
    }

    Object.getPrototypeOf(wodo.widgets.CurrentStyle.prototype).setEditorSession.call(this, session);
    self.editorSession = session;

    if (self.editorSession) {
        goog.events.listen(self, wodo.widgets.ParagraphStyles.EventType.CHANGE, self.setParagraphStyle);
        self.editorSession.subscribe(wodo.EditorSession.signalParagraphChanged, self.selectParagraphStyle);
    }
};
