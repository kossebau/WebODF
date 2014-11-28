/**
 * Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>
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

/*global wodo, ops, gui, runtime */

goog.provide("wodo.widgets.ParagraphAlignment");

goog.require("wodo.EditorSession");

wodo.widgets.ParagraphAlignment = function (container) {
    "use strict";

    var self = this,
        editorSession,
        children,
        directFormattingController,
        justifyLeft,
        justifyCenter,
        justifyRight,
        justifyFull,
        indent,
        outdent;

    function updateStyleButtons(changes) {
        var buttons = {
            isAlignedLeft: justifyLeft,
            isAlignedCenter: justifyCenter,
            isAlignedRight: justifyRight,
            isAlignedJustified: justifyFull
        };

        Object.keys(changes).forEach(function (key) {
            var button = buttons[key];
            if (button) {
                button.setChecked(changes[key]);
            }
        });
    }

    function enableStyleButtons(enabledFeatures) {
        children.forEach(function (element) {
            element.setEnabled(enabledFeatures.directParagraphStyling);
        });
    }

    this.setEditorSession = function (session) {
        if (editorSession) {
            directFormattingController.unsubscribe(gui.DirectFormattingController.paragraphStylingChanged, updateStyleButtons);
            directFormattingController.unsubscribe(gui.DirectFormattingController.enabledChanged, enableStyleButtons);
        }

        editorSession = session;
        if (editorSession) {
            directFormattingController = editorSession.sessionController.getDirectFormattingController();

            directFormattingController.subscribe(gui.DirectFormattingController.paragraphStylingChanged, updateStyleButtons);
            directFormattingController.subscribe(gui.DirectFormattingController.enabledChanged, enableStyleButtons);

            enableStyleButtons(directFormattingController.enabledFeatures());
        } else {
            enableStyleButtons({directParagraphStyling: false});
        }

        updateStyleButtons({
            isAlignedLeft:      editorSession ? directFormattingController.isAlignedLeft() :      false,
            isAlignedCenter:    editorSession ? directFormattingController.isAlignedCenter() :    false,
            isAlignedRight:     editorSession ? directFormattingController.isAlignedRight() :     false,
            isAlignedJustified: editorSession ? directFormattingController.isAlignedJustified() : false
        });
    };

    /*jslint emptyblock: true*/
    this.onToolDone = function () {};
    /*jslint emptyblock: false*/

    function init() {
        justifyLeft = new goog.ui.ToolbarToggleButton('Align Left'); //
        justifyLeft.setTooltip(runtime.tr('Align Left'));
        justifyLeft.setEnabled(false);
        justifyLeft.setChecked(false);
        container.addChild(justifyLeft, true);
        goog.events.listen(justifyLeft, goog.ui.Component.EventType.ACTION, function () {
            directFormattingController.alignParagraphLeft();
            self.onToolDone();
        });

        justifyCenter = new goog.ui.ToolbarToggleButton('Center'); //
        justifyCenter.setTooltip(runtime.tr('Center'));
        justifyCenter.setEnabled(false);
        justifyCenter.setChecked(false);
        container.addChild(justifyCenter, true);
        goog.events.listen(justifyCenter, goog.ui.Component.EventType.ACTION, function () {
            directFormattingController.alignParagraphCenter();
            self.onToolDone();
        });

        justifyRight = new goog.ui.ToolbarToggleButton('Align Right'); //
        justifyRight.setTooltip(runtime.tr('Align Right'));
        justifyRight.setEnabled(false);
        justifyRight.setChecked(false);
        container.addChild(justifyRight, true);
        goog.events.listen(justifyRight, goog.ui.Component.EventType.ACTION, function () {
            directFormattingController.alignParagraphRight();
            self.onToolDone();
        });

        justifyFull = new goog.ui.ToolbarToggleButton('Justify'); //
        justifyFull.setTooltip(runtime.tr('Justify'));
        justifyFull.setEnabled(false);
        justifyFull.setChecked(false);
        container.addChild(justifyFull, true);
        goog.events.listen(justifyFull, goog.ui.Component.EventType.ACTION, function () {
            directFormattingController.alignParagraphJustified();
            self.onToolDone();
        });

        outdent = new goog.ui.ToolbarButton('Decrease Indent'); //
        outdent.setTooltip(runtime.tr('Decrease Indent'));
        outdent.setEnabled(false);
        container.addChild(outdent, true);
        goog.events.listen(outdent, goog.ui.Component.EventType.ACTION, function () {
            directFormattingController.outdent();
            self.onToolDone();
        });

        indent = new goog.ui.ToolbarButton('Increase Indent'); //
        indent.setTooltip(runtime.tr('Increase Indent'));
        indent.setEnabled(false);
        container.addChild(indent, true);
        goog.events.listen(indent, goog.ui.Component.EventType.ACTION, function () {
            directFormattingController.indent();
            self.onToolDone();
        });

        children = [justifyLeft,
            justifyCenter,
            justifyRight,
            justifyFull,
            outdent,
            indent
        ];
    }

    init();
};
