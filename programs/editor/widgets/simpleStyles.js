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

/*global wodo, runtime, gui, ops */

goog.provide("wodo.widgets.SimpleStyles");

goog.require("goog.dom");
goog.require("goog.ui.ToolbarToggleButton");
goog.require("goog.events");
goog.require("goog.events.EventType");
goog.require("wodo.EditorSession");
goog.require("wodo.widgets.FontPicker");

wodo.widgets.SimpleStyles = function (container) {
    "use strict";

    var self = this,
        editorSession,
        children,
        directFormattingController,
        boldButton,
        italicButton,
        underlineButton,
        strikethroughButton,
        fontSizeSpinner,
        fontPicker;


    function updateStyleButtons(changes) {
        // The 3rd parameter to set(...) is false to avoid firing onChange when setting the value programmatically.
        var updateCalls = {
            isBold: function(value) { boldButton.setChecked(value); },
            isItalic: function(value) { italicButton.setChecked(value); },
            hasUnderline: function(value) { underlineButton.setChecked(value); },
            hasStrikeThrough: function(value) { strikethroughButton.setChecked(value); },
            fontSize: function(value) { 
//                 fontSizeSpinner.set('intermediateChanges', false); // Necessary due to https://bugs.dojotoolkit.org/ticket/11588
//                 fontSizeSpinner.set('value', value, false);
//                 fontSizeSpinner.set('intermediateChanges', true);
            },
            fontName: function(value) { /*fontPicker.setValue(value);*/ }
        };

        Object.keys(changes).forEach(function (key) {
            var updateCall = updateCalls[key];
            if (updateCall) {
                updateCall(changes[key]);
            }
        });
    }

    function enableStyleButtons(enabledFeatures) {
        children.forEach(function (element) {
            if (element.setEnabled) {
                element.setEnabled(enabledFeatures.directTextStyling);
            }
        });
    }

    this.setEditorSession = function(session) {
        if (editorSession) {
            directFormattingController.unsubscribe(gui.DirectFormattingController.textStylingChanged, updateStyleButtons);
            directFormattingController.unsubscribe(gui.DirectFormattingController.enabledChanged, enableStyleButtons);
        }

        editorSession = session;
//         fontPicker.setEditorSession(editorSession);
        if (editorSession) {
            directFormattingController = editorSession.sessionController.getDirectFormattingController();

            directFormattingController.subscribe(gui.DirectFormattingController.textStylingChanged, updateStyleButtons);
            directFormattingController.subscribe(gui.DirectFormattingController.enabledChanged, enableStyleButtons);

            enableStyleButtons(directFormattingController.enabledFeatures());
        } else {
            enableStyleButtons({ directTextStyling: false});
        }

        updateStyleButtons({
            isBold: editorSession ? directFormattingController.isBold() : false,
            isItalic: editorSession ? directFormattingController.isItalic() : false,
            hasUnderline: editorSession ? directFormattingController.hasUnderline() : false,
            hasStrikeThrough: editorSession ? directFormattingController.hasStrikeThrough() : false,
            fontSize: editorSession ? directFormattingController.fontSize() : undefined,
            fontName: editorSession ? directFormattingController.fontName() : undefined
        });
    };

    /*jslint emptyblock: true*/
    this.onToolDone = function () {};
    /*jslint emptyblock: false*/

    function init() {
        boldButton = new goog.ui.ToolbarToggleButton('Bold'); //
        boldButton.setTooltip(runtime.tr('Bold'));
        boldButton.setEnabled(false);
        boldButton.setChecked(false);
        container.addChild(boldButton, true);
        goog.events.listen(boldButton, goog.ui.Component.EventType.ACTION, function (e) {
            directFormattingController.setBold(e.target.isChecked()); // TODO: stimmt noch nicht
            self.onToolDone();
        });

        italicButton = new goog.ui.ToolbarToggleButton('Italic'); //
        italicButton.setTooltip(runtime.tr('Italic'));
        italicButton.setEnabled(false);
        italicButton.setChecked(false);
        container.addChild(italicButton, true);
        goog.events.listen(italicButton, goog.ui.Component.EventType.ACTION, function (e) {
            directFormattingController.setItalic(e.target.isChecked());
            self.onToolDone();
        });

        underlineButton = new goog.ui.ToolbarToggleButton('Underline'); //
        underlineButton.setTooltip(runtime.tr('Underline'));
        underlineButton.setEnabled(false);
        underlineButton.setChecked(false);
        container.addChild(underlineButton, true);
        goog.events.listen(underlineButton, goog.ui.Component.EventType.ACTION, function (e) {
            directFormattingController.setHasUnderline(e.target.isChecked());
            self.onToolDone();
        });

        strikethroughButton = new goog.ui.ToolbarToggleButton('Strikethrough'); //
        strikethroughButton.setTooltip(runtime.tr('Strikethrough'));
        strikethroughButton.setEnabled(false);
        strikethroughButton.setChecked(false);
        container.addChild(strikethroughButton, true);
        goog.events.listen(strikethroughButton, goog.ui.Component.EventType.ACTION, function (e) {
            directFormattingController.setHasStrikethrough(e.target.isChecked());
            self.onToolDone();
        });
/*
        fontSizeSpinner = new NumberSpinner({
            label: runtime.tr('Size'),
            disabled: true,
            showLabel: false,
            value: 12,
            smallDelta: 1,
            constraints: {min:6, max:96},
            intermediateChanges: true,
            onChange: function (value) {
                directFormattingController.setFontSize(value);
            },
            onClick: function () {
                self.onToolDone();
            },
            onInput: function () {
                // Do not process any input in the text box;
                // even paste events will not be processed
                // so that no corrupt values can exist
                return false;
            }
        });

        fontPicker = new wodo.widgets.FontPicker();
        goog.events.listen(fontPicker, wodo.widgets.FontPicker.EventType.CHANGE,
            function(e) {
            directFormattingController.setFontName(e.target.value);
            self.onToolDone();
        });
*/
        children = [boldButton, italicButton, underlineButton, strikethroughButton];//, fontPicker, fontSizeSpinner];
    }

    init();
};
