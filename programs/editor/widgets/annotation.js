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

/*global wodo, runtime, gui */

goog.provide("wodo.widgets.Annotation");

goog.require("goog.dom");
goog.require("goog.ui.ToolbarButton");
goog.require("goog.events");
goog.require("goog.events.EventType");
goog.require("wodo.EditorSession");

wodo.widgets.Annotation = function (container) {
    "use strict";

    var self = this,
        editorSession,
        addAnnotationButton,
        annotationController;


    function onAnnotatableChanged(isAnnotatable) {
        addAnnotationButton.setEnabled(isAnnotatable);
    }

    this.setEditorSession = function (session) {
        if (editorSession) {
            annotationController.unsubscribe(gui.AnnotationController.annotatableChanged, onAnnotatableChanged);
        }

        editorSession = session;
        if (editorSession) {
            annotationController = editorSession.sessionController.getAnnotationController();
            annotationController.subscribe(gui.AnnotationController.annotatableChanged, onAnnotatableChanged);
            onAnnotatableChanged(annotationController.isAnnotatable());
        } else {
            addAnnotationButton.setEnabled(false);
        }
    };

    /*jslint emptyblock: true*/
    this.onToolDone = function () {};
    /*jslint emptyblock: false*/

    function init() {
        addAnnotationButton = new goog.ui.ToolbarButton("Annotate");//goog.dom.createDom('div', 'icon annotate'));
        addAnnotationButton.setTooltip(runtime.tr('Annotate'));
        addAnnotationButton.setEnabled(false);
        container.addChild(addAnnotationButton, true);
        goog.events.listen(addAnnotationButton.getContentElement(), goog.events.EventType.CLICK, function () {
            if (annotationController) {
                annotationController.addAnnotation();
                self.onToolDone();
            }
        });
    }

    init();
};
