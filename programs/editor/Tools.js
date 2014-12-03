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

/*global document, wodo, dijit, dojo, runtime, ops, EditorSession */

goog.provide('wodo.Tools');

var Tools = (function() {
        "use strict";

        goog.require('goog.dom');
        goog.require('goog.events');
        goog.require('goog.events.EventType');
        goog.require('goog.ui.Toolbar');
        goog.require('goog.ui.ToolbarButton');
        goog.require("wodo.widgets.ParagraphAlignment");
        goog.require("wodo.widgets.SimpleStyles");
        goog.require("wodo.widgets.UndoRedoMenu");
        goog.require("wodo.widgets.CurrentStyle");
        goog.require("wodo.widgets.Annotation");
//         goog.require("wodo.widgets.EditHyperlinks");
//         goog.require("wodo.widgets.ImageInserter");
//         goog.require("wodo.widgets.ParagraphStylesDialog");
        goog.require("wodo.widgets.ZoomSlider");
//         goog.require("wodo.widgets.AboutDialog");
        goog.require('wodo.EditorSession');

        return function Tools(toolbarElementId, args) {
            var tr = runtime.tr,
                onToolDone = args.onToolDone,
                loadOdtFile = args.loadOdtFile,
                saveOdtFile = args.saveOdtFile,
                saveAsOdtFile = args.saveAsOdtFile,
                downloadOdtFile = args.downloadOdtFile,
                close = args.close,
                toolbar,
                loadButton, saveButton, closeButton, aboutButton,
                saveAsButton, downloadButton,
                formatDropDownMenu, formatMenuButton,
                paragraphStylesMenuItem, paragraphStylesDialog,
                editorSession,
                aboutDialog,
                sessionSubscribers = [];

            /**
             * Creates a tool and installs it, if the enabled flag is set to true.
             * Only supports tool classes whose constructor has a single argument which
             * takes the container into which the tools should be placed
             * @param {!function(new:Object, function(!Object):undefined)} Tool  constructor method of the tool
             * @param {!boolean} enabled
             * @return {?Object}
             */
            function createTool(Tool, enabled) {
                var tool = null;

                if (enabled) {
                    tool = new Tool(toolbar);
                    sessionSubscribers.push(tool);
                    tool.onToolDone = onToolDone;
                }

                return tool;
            }

            /**
             * Creates a tool and installs it, if the enabled flag is set to true.
             * Only supports tool classes whose constructor has a single argument which
             * is a callback to pass the created widget object to.
             * @param {!function(new:Object, function(!Object):undefined)} Tool  constructor method of the tool
             * @param {!boolean} enabled
             * @return {?Object}
             */
            function createWidget(Tool, enabled) {
                var tool = null;

                if (enabled) {
                    tool = new Tool();
                    tool.createDom();
//                     tool.render(toolbar.domNode);
//                     toolbar.addChild(tool, true);
                    sessionSubscribers.push(tool);
                    tool.onToolDone = onToolDone;
                }

                return tool;
            }

            function handleCursorMoved(cursor) {
                var disabled = cursor.getSelectionType() === ops.OdtCursor.RegionSelection;
                if (formatMenuButton) {
                    formatMenuButton.setAttribute('disabled', disabled);
                }
            }

            function setEditorSession(session) {
                if (editorSession) {
                    editorSession.unsubscribe(EditorSession.signalCursorMoved, handleCursorMoved);
                }

                editorSession = session;
                if (editorSession) {
                    editorSession.subscribe(EditorSession.signalCursorMoved, handleCursorMoved);
                }

                sessionSubscribers.forEach(function (subscriber) {
                    subscriber.setEditorSession(editorSession);
                });
                if (formatMenuButton) {
                    formatMenuButton.setAttribute('disabled', !editorSession);
                }
            }

            this.setEditorSession = setEditorSession;

            /**
             * @param {!function(!Error=)} callback, passing an error object in case of error
             * @return {undefined}
             */
            this.destroy = function (callback) {
                // TODO:
                // 1. We don't want to use `document`
                // 2. We would like to avoid deleting all widgets
                // under document.body because this might interfere with
                // other apps that use the editor not-in-an-iframe,
                // but dojo always puts its dialogs below the body,
                // so this works for now. Perhaps will be obsoleted
                // once we move to a better widget toolkit
                var widgets = dijit.findWidgets(document.body);
                dojo.forEach(widgets, function(w) {
                    w.destroyRecursive(false);
                });
                callback();
            };

            // init
            function init() {
                toolbar = new goog.ui.Toolbar();

                // About
                if (args.aboutEnabled) {
                    aboutButton = new goog.ui.ToolbarButton("About");
                    aboutButton.setTooltip(tr('About WebODF Text Editor'));
                    toolbar.addChild(aboutButton, true);
//                         iconClass: 'webodfeditor-dijitWebODFIcon',
//                     goog.events.listen(aboutButton.getContentElement(), goog.events.EventType.CLICK, showAboutDialog);

//                     aboutDialog = new AboutDialog(function (dialog) {
//                         aboutButton.onClick = function () {
//                             dialog.startup();
//                             dialog.show();
//                         };
//                     });
//                     aboutDialog.onToolDone = onToolDone;
                }

                // Load
                if (loadOdtFile) {
                    loadButton = new goog.ui.ToolbarButton("Open");//, goog.dom.createDom('div', 'icon goog-edit-bold'));
                    loadButton.setTooltip(tr('Open'));
                    toolbar.addChild(loadButton, true);
                    goog.events.listen(loadButton.getContentElement(), goog.events.EventType.CLICK, loadOdtFile);
                }

                // Save
                if (saveOdtFile) {
                    saveButton = new goog.ui.ToolbarButton("Save");//, goog.dom.createDom('div', 'icon goog-edit-bold'));
                    saveButton.setTooltip(tr('Save'));
                    toolbar.addChild(saveButton, true);
                    goog.events.listen(saveButton.getContentElement(), goog.events.EventType.CLICK, function () {
                            saveOdtFile();
                            onToolDone();
                    });
                }

                // SaveAs
                if (saveAsOdtFile) {
                    saveAsButton = new goog.ui.ToolbarButton("SaveAs");//, goog.dom.createDom('div', 'icon goog-edit-bold'));
                    saveAsButton.setTooltip(tr('Save as...'));
                    toolbar.addChild(saveAsButton, true);
                    goog.events.listen(saveAsButton.getContentElement(), goog.events.EventType.CLICK, function () {
                            saveAsOdtFile();
                            onToolDone();
                    });
                }

                // Download
                if (downloadOdtFile) {
                    downloadButton = new goog.ui.ToolbarButton("Download");//goog.dom.createDom('div', 'icon goog-edit-bold'));
                    downloadButton.setTooltip(tr('Download'));
                    toolbar.addChild(downloadButton, true);
                    goog.events.listen(downloadButton.getContentElement(), goog.events.EventType.CLICK, function () {
                            downloadOdtFile();
                            onToolDone();
                    });
                }

/*
                // Format menu
                if (args.paragraphStyleEditingEnabled) {
                    formatDropDownMenu = new DropDownMenu({});
                    paragraphStylesMenuItem = new MenuItem({
                        label: tr("Paragraph...")
                    });
                    formatDropDownMenu.addChild(paragraphStylesMenuItem);

                    paragraphStylesDialog = new ParagraphStylesDialog(function (dialog) {
                        paragraphStylesMenuItem.onClick = function () {
                            if (editorSession) {
                                dialog.startup();
                                dialog.show();
                            }
                        };
                    });
                    sessionSubscribers.push(paragraphStylesDialog);
                    paragraphStylesDialog.onToolDone = onToolDone;

                    formatMenuButton = new DropDownButton({
                        dropDown: formatDropDownMenu,
                        disabled: true,
                        label: tr('Format'),
                        iconClass: "dijitIconEditTask"
                    });
                    formatMenuButton.placeAt(toolbar);
                }
*/

                // Undo/Redo
                createTool(wodo.widgets.UndoRedoMenu, args.undoRedoEnabled);

                // Add annotation
                createTool(wodo.widgets.Annotation, args.annotationsEnabled);

                // Simple Style Selector [B, I, U, S]
                createTool(wodo.widgets.SimpleStyles, args.directTextStylingEnabled);

                // Paragraph direct alignment buttons
                createTool(wodo.widgets.ParagraphAlignment, args.directParagraphStylingEnabled);

                // Paragraph Style Selector
                createTool(wodo.widgets.CurrentStyle, args.paragraphStyleSelectingEnabled);
/*
                // Zoom Level Selector
                createWidget(wodo.widgets.ZoomSlider, args.zoomingEnabled);

                // hyper links
                createTool(EditHyperlinks, args.hyperlinkEditingEnabled);

                // image insertion
                createTool(ImageInserter, args.imageInsertingEnabled);
*/
                // close button
                if (close) {
                    closeButton = new goog.ui.ToolbarButton("Close");//goog.dom.createDom('div', 'icon goog-edit-bold'));
                    closeButton.setTooltip(tr('Close'));
                    toolbar.addChild(closeButton, true);
                    goog.events.listen(closeButton.getContentElement(), goog.events.EventType.CLICK, close);
                }

                toolbar.render(goog.dom.getElement(toolbarElementId));

                setEditorSession(editorSession);
            }

            init();
        };

}());
