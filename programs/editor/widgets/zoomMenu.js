/**
 * Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>
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

/*global goog, wodo*/
/*
goog.provide("wodo.widgets.ZoomMenu");

goog.require("wodo.EditorSession");
goog.require("goog.ui.SelectionMenuButton");

wodo.widgets.ZoomMenu = function (container) {
    "use strict";

    var self = this,
        editorSession,
        menuButton;

    function updateSlider(zoomLevel) {
        slider.setValue(100 * Math.log(zoomLevel) / Math.log(extremeZoomFactor));
        thumb.setAttribute("wodo-value", Math.round(zoomLevel * 100) + "%");
    };

    this.setEditorSession = function (session) {
        var zoomHelper;

        if (editorSession) {
            editorSession.getOdfCanvas().getZoomHelper().unsubscribe(gui.ZoomHelper.signalZoomChanged, updateSlider);
        }

        editorSession = session;

        if (editorSession) {
            zoomHelper = editorSession.getOdfCanvas().getZoomHelper();
            zoomHelper.subscribe(gui.ZoomHelper.signalZoomChanged, updateSlider);
            updateSlider(zoomHelper.getZoomLevel());
        }
        slider.setEnabled(Boolean(editorSession));

    };

    this.onToolDone = function () {};

    function init() {
        var cbb1 = new goog.ui.CustomButton('Add to Family');
        cbb1.render(goog.dom.getElement('comboButtons'));
        cbb1.addClassName('goog-custom-button-collapse-right');
        var cbm1 = new goog.ui.Menu();
        cbm1.setId('ComboMenu');
        goog.array.forEach(['Friends', 'Family', 'Coworkers'],
            function(label) {
            var item = new goog.ui.MenuItem(label);
            item.setId(label);
            item.setDispatchTransitionEvents(goog.ui.Component.State.ALL, true);
            cbm1.addItem(item);
            });

    menuButton = new goog.ui.SelectionMenuButton();

        b1.setId('zoomSelectButton');
        b1.render(goog.dom.getElement('menuButtons'));
        b1.setTooltip('Select menu demo');
        b1.addItem(new goog.ui.MenuItem('Important'));
        b1.addItem(new goog.ui.MenuItem('Unimportant'));

        goog.events.listen(goog.dom.getElement('b1_enable'),
            goog.events.EventType.CLICK,
            function(e) {
            b1.setEnabled(e.target.checked);
            });

        slider.setMinimum(-100);
        slider.setMaximum(100);
        slider.setEnabled(true);

        container.addChild(slider, true);
        thumb = slider.getElementByClass(goog.ui.Slider.THUMB_CSS_CLASS);

        slider.addEventListener(goog.ui.Component.EventType.CHANGE, function () {
            if (editorSession) {
                editorSession.getOdfCanvas().getZoomHelper().setZoomLevel(Math.pow(extremeZoomFactor, slider.getValue() / 100));
                self.onToolDone();
            }
        });
    }

    // init
    init();
};
*/