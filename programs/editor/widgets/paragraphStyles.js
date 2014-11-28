/**
 * Copyright (C) 2012-2014 KO GmbH <copyright@kogmbh.com>
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

/*global wodo, ops */

goog.provide("wodo.widgets.ParagraphStyles");

goog.require("goog.ui.Select");
goog.require("goog.ui.Option");
goog.require("goog.ui.FlatMenuButtonRenderer");
goog.require("goog.events");
goog.require("goog.events.EventTarget");
goog.require("wodo.EditorSession");

wodo.widgets.ParagraphStyles = function () {
    "use strict";

    goog.events.EventTarget.call(this);

    var self = this;

    this.addStyle = function (styleInfo) {
        var stylens = "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
            newStyleElement,
            widget = self.widget;

        if (styleInfo.family !== 'paragraph') {
            return;
        }

        newStyleElement = self.editorSession.getParagraphStyleElement(styleInfo.name);
        widget.addItem(new goog.ui.Option(
            newStyleElement.getAttributeNS(stylens, 'display-name'), // TODO: check encoding, to prevent e.g. JS injection
            styleInfo.name
        ));

        self.dispatchEvent(new goog.events.Event(wodo.widgets.ParagraphStyles.EventType.ADD, {
            value: self.getValue()
        }));
    };

    this.removeStyle = function (styleInfo) {
        if (styleInfo.family !== 'paragraph') {
            return;
        }

        var widget = self.widget,
            count = widget.getItemCount(),
            item,
            i,
            requiresFallback = (styleInfo.name === self.getValue());

        for (i = 0; i < count; i += 1) {
            item = widget.getItemAt(i);
            if (item.getValue() === styleInfo.name) {
                widget.removeItem(item);
                self.dispatchEvent(new goog.events.Event(wodo.widgets.ParagraphStyles.EventType.REMOVE, {
                    value: self.getValue()
                }));
                break;
            }
        }

        if (requiresFallback) {
            self.setValue(wodo.widgets.ParagraphStyles.defaultStyleUIId);
        }
    };
};
goog.inherits(wodo.widgets.ParagraphStyles, goog.events.EventTarget);

wodo.widgets.ParagraphStyles.defaultStyleUIId = ":default";

wodo.widgets.ParagraphStyles.prototype.render = function (parentElement) {
    "use strict";

    this.widget.render(parentElement);
};

wodo.widgets.ParagraphStyles.prototype.createDom = function () {
    "use strict";

    var self = this,
        widget;

    widget = new goog.ui.Select(null, null, goog.ui.FlatMenuButtonRenderer.getInstance());

    widget.createDom();

    // prevent browser translation service messing up ids
    widget.getContentElement().setAttribute("translate", "no");
    widget.getContentElement().classList.add("notranslate");
    widget.getMenu().getContentElement().setAttribute("translate", "no");
    widget.getMenu().getContentElement().classList.add("notranslate");

    goog.events.listen(widget, goog.ui.Component.EventType.CHANGE, function () {
        self.dispatchEvent(new goog.events.Event(wodo.widgets.ParagraphStyles.EventType.CHANGE, {
            value: self.getValue()
        }));
    });

    self.widget = widget;
};

wodo.widgets.ParagraphStyles.prototype.setEditorSession = function(session) {
    "use strict";

    var self = this;

    if (self.editorSession) {
        self.editorSession.unsubscribe(wodo.EditorSession.signalCommonStyleCreated, self.addStyle);
        self.editorSession.unsubscribe(wodo.EditorSession.signalCommonStyleDeleted, self.removeStyle);
    }

    self.editorSession = session;

    if (self.editorSession) {
        self.editorSession.subscribe(wodo.EditorSession.signalCommonStyleCreated, self.addStyle);
        self.editorSession.subscribe(wodo.EditorSession.signalCommonStyleDeleted, self.removeStyle);
        self.populateStyles();
    }
    self.widget.setEnabled(Boolean(self.editorSession));
};

wodo.widgets.ParagraphStyles.prototype.populateStyles = function () {
    "use strict";

    var widget = this.widget,
        i, availableStyles,
        count = widget.getItemCount();

    for (i = count - 1; i >= 0; i -= 1) {
        widget.removeItemAt(i);
    }

    // Populate the Default Style always 
    widget.addItem(new goog.ui.Option("Default Style", wodo.widgets.ParagraphStyles.defaultStyleUIId));
    availableStyles = this.editorSession ? this.editorSession.getAvailableParagraphStyles() : [];

    for (i = 0; i < availableStyles.length; i += 1) {
        widget.addItem(new goog.ui.Option(
            availableStyles[i].displayName || availableStyles[i].name, // TODO: check encoding, to prevent e.g. JS injection
            availableStyles[i].name
        ));
    }

};

/*
 * In this widget, we name the default style
 * (which is referred to as "" in webodf) as
 * ":default". The ":" is disallowed in an NCName, so this
 * avoids clashes with other styles.
 */
wodo.widgets.ParagraphStyles.prototype.getValue = function () {
    "use strict";

    var value = this.widget.getValue();
    if (value === wodo.widgets.ParagraphStyles.defaultStyleUIId) {
        value = "";
    }
    return value;
};

wodo.widgets.ParagraphStyles.prototype.setValue = function (value) {
    "use strict";

    if (value === "") {
        value = wodo.widgets.ParagraphStyles.defaultStyleUIId;
    }
    this.widget.setValue(value);
};

wodo.widgets.ParagraphStyles.EventType = {
    ADD: "add",
    REMOVE: "remove",
    CHANGE: "change"
};
