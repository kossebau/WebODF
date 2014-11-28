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

/*global define, document, dijit, dojo, runtime, ops, wodo*/

goog.provide('wodo.Tools');

var Tools = (function() {
        "use strict";

        goog.require('goog.dom');
        goog.require('goog.ui.Toolbar');

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
             * is a callback to pass the created widget object to.
             * @param {!function(new:Object, function(!Object):undefined)} Tool  constructor method of the tool
             * @param {!boolean} enabled
             * @return {?Object}
             */
            function createTool(Tool, enabled) {
                var tool = null;

                if (enabled) {
                    tool = new Tool(function (widget) {
                        widget.placeAt(toolbar);
                        widget.startup();
                    });
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
                    tool.render(toolbar.domNode);
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
/*
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
*/
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
/*
                // About
                if (args.aboutEnabled) {
                    aboutButton = new Button({
                        label: tr('About WebODF Text Editor'),
                        showLabel: false,
                        iconClass: 'webodfeditor-dijitWebODFIcon'
                    });
                    aboutDialog = new AboutDialog(function (dialog) {
                        aboutButton.onClick = function () {
                            dialog.startup();
                            dialog.show();
                        };
                    });
                    aboutDialog.onToolDone = onToolDone;
                    aboutButton.placeAt(toolbar);
                }

                // Load
                if (loadOdtFile) {
                    loadButton = new Button({
                        label: tr('Open'),
                        showLabel: false,
                        iconClass: 'dijitIcon dijitIconFolderOpen',
                        onClick: function () {
                            loadOdtFile();
                        }
                    });
                    loadButton.placeAt(toolbar);
                }

                // Save
                if (saveOdtFile) {
                    saveButton = new Button({
                        label: tr('Save'),
                        showLabel: false,
                        iconClass: 'dijitEditorIcon dijitEditorIconSave',
                        onClick: function () {
                            saveOdtFile();
                            onToolDone();
                        }
                    });
                    saveButton.placeAt(toolbar);
                }

                // SaveAs
                if (saveAsOdtFile) {
                    saveAsButton = new Button({
                        label: tr('Save as...'),
                        showLabel: false,
                        iconClass: 'webodfeditor-dijitSaveAsIcon',
                        onClick: function () {
                            saveAsOdtFile();
                            onToolDone();
                        }
                    });
                    saveAsButton.placeAt(toolbar);
                }

                // Download
                if (downloadOdtFile) {
                    downloadButton = new Button({
                        label: tr('Download'),
                        showLabel: true,
                        style: {
                            float: 'right'
                        },
                        onClick: function () {
                            downloadOdtFile();
                            onToolDone();
                        }
                    });
                    downloadButton.placeAt(toolbar);
                }

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

                // Undo/Redo
                createTool(UndoRedoMenu, args.undoRedoEnabled);

                // Add annotation
                createTool(AnnotationControl, args.annotationsEnabled);

                // Simple Style Selector [B, I, U, S]
                createTool(SimpleStyles, args.directTextStylingEnabled);

                // Paragraph direct alignment buttons
                createTool(ParagraphAlignment, args.directParagraphStylingEnabled);

                // Paragraph Style Selector
                createWidget(wodo.widgets.CurrentStyle, args.paragraphStyleSelectingEnabled);

                // Zoom Level Selector
                createWidget(wodo.widgets.ZoomSlider, args.zoomingEnabled);

                // hyper links
                createTool(EditHyperlinks, args.hyperlinkEditingEnabled);

                // image insertion
                createTool(ImageInserter, args.imageInsertingEnabled);

                // close button
                if (close) {
                    closeButton = new Button({
                        label: tr('Close'),
                        showLabel: false,
                        iconClass: 'dijitEditorIcon dijitEditorIconCancel',
                        style: {
                            float: 'right'
                        },
                        onClick: function () {
                            close();
                        }
                    });
                    closeButton.placeAt(toolbar);
                }
*/
                toolbar.render(goog.dom.getElement(toolbarElementId));

                setEditorSession(editorSession);
            }

            init();
        };

}());
