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

/*global goog, wodo, gui*/

goog.provide("wodo.widgets.ZoomSlider");

goog.require("wodo.EditorSession");
goog.require("goog.ui.Component");
goog.require("goog.ui.Slider");

wodo.widgets.ZoomSlider = function () {
    "use strict";

    this.extremeZoomFactor = 4;

    var self = this;

    this.updateSlider = function (zoomLevel) {
        self.slider.setValue(100 * Math.log(zoomLevel) / Math.log(self.extremeZoomFactor));
        self.thumb.setAttribute("wodo-value", Math.round(zoomLevel * 100) + "%");
    };
};

wodo.widgets.ZoomSlider.prototype.setEditorSession = function (session) {
    "use strict";

    var self = this,
        zoomHelper;

    if (self.editorSession) {
        self.editorSession.getOdfCanvas().getZoomHelper().unsubscribe(gui.ZoomHelper.signalZoomChanged, self.updateSlider);
    }

    self.editorSession = session;

    if (self.editorSession) {
        zoomHelper = self.editorSession.getOdfCanvas().getZoomHelper();
        zoomHelper.subscribe(gui.ZoomHelper.signalZoomChanged, self.updateSlider);
        self.updateSlider(zoomHelper.getZoomLevel());
    }
    self.slider.setEnabled(Boolean(self.editorSession));

};

/*jslint emptyblock: true*/
wodo.widgets.ZoomSlider.prototype.onToolDone = function () {"use strict";};
/*jslint emptyblock: false*/

wodo.widgets.ZoomSlider.prototype.render = function (parentElement) {
    "use strict";

    this.slider.render(parentElement);
};

wodo.widgets.ZoomSlider.prototype.createDom = function () {
    "use strict";

    var self = this,
        slider = new goog.ui.Slider();

    slider.setOrientation(goog.ui.Slider.Orientation.HORIZONTAL);
    slider.setBlockIncrement(1);
    slider.setStep(null);
    slider.setMinimum(-100);
    slider.setMaximum(100);
    slider.setEnabled(true);
    slider.createDom();

    slider.addEventListener(goog.ui.Component.EventType.CHANGE, function () {
        if (self.editorSession) {
            self.editorSession.getOdfCanvas().getZoomHelper().setZoomLevel(Math.pow(self.extremeZoomFactor, slider.getValue() / 100));
            self.onToolDone();
        }
    });

    self.slider = slider;
    self.thumb = slider.getElementByClass(goog.ui.Slider.THUMB_CSS_CLASS);
};
