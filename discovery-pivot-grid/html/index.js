var pivotViewer = new pivot.ui.pivot.Viewer(document.querySelector("#pivotView"));

document.querySelector("#button1").addEventListener("click", function (e) {
    pivotViewer.initialize(items, {
        xProperties: [
            {name: "Category"},
            {name: "Segment"},
            {name: "Region"},
        ],
        yProperties: [
            {name: "State"}
        ],
        zProperties: [
            {digits: 2, name: "SUM(Sales)" },
            {digits: 2, name: "SUM(SalesForecast)"}
        ],
        onAxisXClick: function (selectedData) {
            console.info(selectedData);
        },
        onAxisYClick: function (selectedData) {
            console.info(selectedData);
        },
        onBodyCellClick: function (selectedData) {
            console.info('onBodyCellClick', selectedData);
        },
        leftAxisWidth: 100,
        isSelectOneSideAxis: false,
        cumulativeClick: true,
        cellWidth: 100,
        cellHeight: 36,
        body: {
            showAxisZ: true
        },
        dataColumnMode: 'TOP'
    });
}, false);

/**
 * Dimension : SubCategory
 * Measure : Sales
 * Pivot - Vertical
 */
document.querySelector("#button2").addEventListener("click", function (e) {
    pivotViewer.initialize(items1, {
        xProperties: [{name: "Sub-Category"}],
        yProperties: [],
        zProperties: [{name: "SUM(Sales)", digits: 2}],
        body: {
            align: {
                hAlign: "left",
                vAlign: "middle"
            },
            font: {
                size: 13
            },
            showAxisZ: true
        },
        ellHeight: 45,
        cellWidth: 100,
        leftAxisWidth: 120,
        axisSelectMode: "MULTI",
        dataColumnMode: "LEFT",
        showColorStep: false,
        useSelectStyle: true,
        onAxisXClick: function (selectedData) {
            console.info(selectedData);
        },
        onAxisYClick: function (selectedData) {
            console.info(selectedData);
        },
        remark: {
            label: "테스트",
            pos: "BOTTOM_RIGHT"
        }
    });
}, false);

/**
 * Dimension : SubCategory
 * Measure : Sales
 * Original - Vertical
 */
document.querySelector("#button3").addEventListener("click", function (e) {
    pivotViewer.initialize(items2, {
        xProperties: [{name: "COLUMNS"}],
        yProperties: [{name: "&nbsp;"}],
        zProperties: [{name: "VALUE"}],
        body: {
            align: {
                hAlign: "left",
                vAlign: "middle"
            },
            font: {
                size: 13
            },
            showAxisZ: false
        },
        ellHeight: 45,
        cellWidth: 120,
        leftAxisWidth: 120,
        axisSelectMode: "MULTI",
        dataColumnMode: "LEFT",
        showColorStep: false,
        useSelectStyle: false,
        onAxisXClick: function (selectedData) {
            console.info(selectedData);
        },
        onAxisYClick: function (selectedData) {
            console.info(selectedData);
        },
        remark: {
            label: "테스트",
            pos: "BOTTOM_RIGHT"
        }
    });
}, false);

/**
 * Dimension : SubCategory
 * Measure : Sales
 * Pivot - Horizontal
 */
document.querySelector("#button4").addEventListener("click", function (e) {
    pivotViewer.initialize(items3, {
        xProperties: [{name: "Sub-Category"}],
        yProperties: [],
        zProperties: [{name: "SUM(Sales)", digits: 2}],
        body: {
            align: {
                hAlign: "left",
                vAlign: "middle"
            },
            font: {
                size: 13
            },
            showAxisZ: true
        },
        ellHeight: 45,
        cellWidth: 100,
        leftAxisWidth: 120,
        axisSelectMode: "MULTI",
        dataColumnMode: "TOP",
        showColorStep: false,
        useSelectStyle: true,
        onAxisXClick: function (selectedData) {
            console.info(selectedData);
        },
        onAxisYClick: function (selectedData) {
            console.info(selectedData);
        },
        remark: {
            label: "테스트",
            pos: "BOTTOM_RIGHT"
        }
    });
}, false);

/**
 * Dimension : Country-Region-State-Category-SubCategory
 * Measure : Sales
 * Original - Vertical
 */
document.querySelector("#button5").addEventListener("click", function (e) {
    pivotViewer.initialize(items4, {
        xProperties: [{name: "COLUMNS"}],
        yProperties: [{name: "&nbsp;"}],
        zProperties: [{name: "VALUE"}],
        body: {
            align: {
                hAlign: "left",
                vAlign: "middle"
            },
            font: {
                size: 13
            },
            showAxisZ: true
        },
        ellHeight: 45,
        cellWidth: 120,
        leftAxisWidth: 120,
        axisSelectMode: "MULTI",
        dataColumnMode: "LEFT",
        showColorStep: false,
        useSelectStyle: false,
        onAxisXClick: function (selectedData) {
            console.info(selectedData);
        },
        onAxisYClick: function (selectedData) {
            console.info(selectedData);
        },
        remark: {
            label: "테스트",
            pos: "BOTTOM_RIGHT"
        }
    });
}, false);

/**
 * Dimension : Country-Region-State
 * Dimension : Category-SubCategory
 * Measure : Sales
 * Pivot - Vertical
 */
document.querySelector("#button6").addEventListener("click", function (e) {
    pivotViewer.initialize(items5, {
        xProperties: [
            {name: "Country"},
            {name: "Region"},
            {name: "State"}
        ],
        yProperties: [
            {name: "Category"},
            {name: "Sub-Category"}
        ],
        zProperties: [
            {digits: 2, name: "SUM(Sales)"}
        ],
        body: {
            align: {
                hAlign: "left",
                vAlign: "middle"
            },
            font: {
                size: 13
            },
            showAxisZ: true
        },
        ellHeight: 45,
        cellWidth: 120,
        leftAxisWidth: 120,
        axisSelectMode: "MULTI",
        dataColumnMode: "LEFT",
        showColorStep: false,
        useSelectStyle: true,
        onAxisXClick: function (selectedData) {
            console.info('onAxisXClick', selectedData);
        },
        onAxisYClick: function (selectedData) {
            console.info('onAxisYClick', selectedData);
        },
        onBodyCellClick: function (selectedData) {
            console.info('onBodyCellClick', selectedData);
        },
        remark: {
            label: "테스트",
            pos: "BOTTOM_RIGHT"
        }
    });
}, false);

/**
 * Dimension : Country-Region-State
 * Dimension : Category-SubCategory
 * Measure : Sales
 * Pivot - Horizontal
 */
document.querySelector("#button7").addEventListener("click", function (e) {
    pivotViewer.initialize(items6, {
        xProperties: [
            {name: "Country"},
            {name: "Region"},
            {name: "State"}
        ],
        yProperties: [
            {name: "Category"},
            {name: "Sub-Category"}
        ],
        zProperties: [
            {digits: 2, name: "SUM(Sales)"}
        ],
        body: {
            align: {
                hAlign: "left",
                vAlign: "middle"
            },
            font: {
                size: 13
            },
            showAxisZ: true
        },
        ellHeight: 45,
        cellWidth: 120,
        leftAxisWidth: 120,
        axisSelectMode: "MULTI",
        dataColumnMode: "TOP",
        showColorStep: false,
        useSelectStyle: true,
        onAxisXClick: function (selectedData) {
            console.info('onAxisXClick', selectedData);
        },
        onAxisYClick: function (selectedData) {
            console.info('onAxisYClick', selectedData);
        },
        onBodyCellClick: function (selectedData) {
            console.info('onBodyCellClick', selectedData);
        },
        remark: {
            label: "테스트",
            pos: "BOTTOM_RIGHT"
        }
    });
}, false);

/**
 * Dimension : Country-Region-State
 * Dimension : Category-SubCategory
 * Measure : Sales
 * Pivot - Horizontal
 * ShowAxisZ : false
 */
document.querySelector("#button8").addEventListener("click", function (e) {
    pivotViewer.initialize(items6, {
        xProperties: [
            {name: "Country"},
            {name: "Region"},
            {name: "State"}
        ],
        yProperties: [
            {name: "Category"},
            {name: "Sub-Category"}
        ],
        zProperties: [
            {digits: 2, name: "SUM(Sales)", valueFormat : {
                    abbr: "KILO",
                    customSymbol: {value: "@", pos: "BEFORE", abbreviations: false},
                    abbreviations: false,
                    pos: "BEFORE",
                    value: "@",
                    decimal: 5,
                    isAll: true,
                    sign: "KRW",
                    type: "percent",
                    useThousandsSep: true
                }
            }
        ],
        body: {
            align: {
                hAlign: "left",
                vAlign: "middle"
            },
            font: {
                size: 13
            },
            showAxisZ: false
        },
        ellHeight: 45,
        cellWidth: 120,
        leftAxisWidth: 120,
        axisSelectMode: "MULTI",
        dataColumnMode: "TOP",
        showColorStep: false,
        useSelectStyle: true,
        onAxisXClick: function (selectedData) {
            console.info('onAxisXClick', selectedData);
        },
        onAxisYClick: function (selectedData) {
            console.info('onAxisYClick', selectedData);
        },
        onBodyCellClick: function (selectedData) {
            console.info('onBodyCellClick', selectedData);
        },
        remark: {
            label: "테스트",
            pos: "BOTTOM_RIGHT"
        },
        colValueFormat : {
            "Sum(Sales)" : {
                abbr: "KILO",
                customSymbol: {value: "@", pos: "BEFORE", abbreviations: false},
                abbreviations: false,
                pos: "BEFORE",
                value: "@",
                decimal: 5,
                isAll: true,
                sign: "KRW",
                type: "percent",
                useThousandsSep: true
            }
        }
    });
}, false);


/**
 * Dimension : Country-Region-State
 * Dimension : Category-SubCategory
 * Measure : Sales
 * Pivot - Vertical
 * ShowAxisZ : false
 */
document.querySelector("#button9").addEventListener("click", function (e) {
    pivotViewer.initialize(items5, {
        xProperties: [
            {name: "Country"},
            {name: "Region"},
            {name: "State"}
        ],
        yProperties: [
            {name: "Category"},
            {name: "Sub-Category"}
        ],
        zProperties: [
            {digits: 2, name: "SUM(Sales)"}
        ],
        body: {
            align: {
                hAlign: "left",
                vAlign: "middle"
            },
            font: {
                size: 13
            },
            showAxisZ: false
        },
        ellHeight: 45,
        cellWidth: 120,
        leftAxisWidth: 120,
        axisSelectMode: "MULTI",
        dataColumnMode: "LEFT",
        showColorStep: false,
        useSelectStyle: true,
        onAxisXClick: function (selectedData) {
            console.info('onAxisXClick', selectedData);
        },
        onAxisYClick: function (selectedData) {
            console.info('onAxisYClick', selectedData);
        },
        onBodyCellClick: function (selectedData) {
            console.info('onBodyCellClick', selectedData);
        },
        calcCellStyle: {
            "label": "총합",
            "fontSize": "NORMAL",
            "fontStyles": [],
            "fontColor": "",
            "backgroundColor": "#eeeeee",
            "hAlign": "AUTO",
            "vAlign": "MIDDLE",
            "aggregationType": "SUM",
            "font": {"size": 13, "color": "", "styles": []},
            "align": {"hAlign": "AUTO", "vAlign": "MIDDLE"}
        },
        subCalcCellStyle: {
            'category': {
                "label": "총합",
                "fontSize": "NORMAL",
                "fontStyles": [],
                "fontColor": "",
                "backgroundColor": "#0000FF",
                "hAlign": "LEFT",
                "vAlign": "TOP",
                "aggregationType": "AVERAGE",
                "font": {"size": 13, "color": "#FFFFFF", "styles": []},
                "align": {"hAlign": "LEFT", "vAlign": "TOP"}
            },
            'sub-category': {
                "label": "총합",
                "fontSize": "NORMAL",
                "fontStyles": [],
                "fontColor": "",
                "backgroundColor": "#0000FF",
                "hAlign": "LEFT",
                "vAlign": "TOP",
                "aggregationType": "AVERAGE",
                "font": {"size": 13, "color": "#FFFFFF", "styles": []},
                "align": {"hAlign": "LEFT", "vAlign": "TOP"}
            }
        },
        remark: {
            label: "테스트",
            pos: "BOTTOM_RIGHT"
        }
    });
}, false);

document.querySelector("#button_1col_pivot").addEventListener("click", function (e) {
    pivotViewer.initialize(item_1col_pivot, {
        "xProperties": [{"name": "State"}],
        "yProperties": [],
        "zProperties": [],
        "axisSelectMode": "MULTI",
        "onAxisXClick": null,
        "onAxisYClick": null,
        "onBodyCellClick": null,
        "cellWidth": 120,
        "cellHeight": 30,
        "showAxisZ": false,
        "min": 1,
        "max": 2001,
        "header": {
            "font": {"size": 13, "styles": [], "color": "#959595"},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showHeader": true,
            "backgroundColor": "#ffffff"
        },
        "body": {
            "font": {"size": 13, "styles": []},
            "color": {"stepColors": [], "stepTextColors": [], "showColorStep": true},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showAxisZ": false
        },
        "useSelectStyle": true,
        "leftAxisWidth": 120,
        "showColorStep": false,
        "dataColumnMode": "LEFT",
        "format": {"isAll": true, "each": null, "type": "number", "sign": "KRW", "decimal": 2, "useThousandsSep": true},
        remark: {
            label: "테스트",
            pos: "BOTTOM_RIGHT"
        }
    });
}, false);

document.querySelector("#button_1row_pivot").addEventListener("click", function (e) {
    pivotViewer.initialize(item_1row_pivot, {
        "xProperties": [],
        "yProperties": [{"name": "Category"}],
        "zProperties": [],
        "axisSelectMode": "MULTI",
        "onAxisXClick": null,
        "onAxisYClick": null,
        "onBodyCellClick": null,
        "cellWidth": 120,
        "cellHeight": 30,
        "showAxisZ": false,
        "min": 1847,
        "max": 6026,
        "header": {
            "font": {"size": 13, "styles": [], "color": "#959595"},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showHeader": true,
            "backgroundColor": "#ffffff"
        },
        "body": {
            "font": {"size": 13, "styles": []},
            "color": {"stepColors": [], "stepTextColors": [], "showColorStep": true},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showAxisZ": false
        },
        "useSelectStyle": true,
        "leftAxisWidth": 120,
        "showColorStep": false,
        "dataColumnMode": "LEFT",
        "format": {"isAll": true, "each": null, "type": "number", "sign": "KRW", "decimal": 2, "useThousandsSep": true},
        remark: {
            label: "테스트",
            pos: "BOTTOM_RIGHT"
        }
    });
}, false);

document.querySelector("#button_sum").addEventListener("click", function (e) {
    pivotViewer.initialize(item_sum, {
        "xProperties": [{"name": "Category"}, {"name": "Sub-Category"}],
        "yProperties": [{"name": "Region"}],
        "zProperties": [{"name": "SUM(Sales)", "digits": 2}, {"name": "SUM(Profit)", "digits": 2}],
        "axisSelectMode": "MULTI",
        "onAxisXClick": null,
        "onAxisYClick": null,
        "onBodyCellClick": null,
        "cellWidth": 120,
        "cellHeight": 30,
        "showAxisZ": false,
        "min": 1847,
        "max": 6026,
        "header": {
            "font": {"size": 13, "styles": [], "color": "#959595"},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showHeader": true,
            "backgroundColor": "#ffffff"
        },
        "body": {
            "font": {"size": 13, "styles": []},
            "color": {"stepColors": [], "stepTextColors": [], "showColorStep": true},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showAxisZ": true
        },
        'calcCellStyle': {
            "label": "총합",
            "fontSize": "NORMAL",
            "fontStyles": [],
            "fontColor": "",
            "backgroundColor": "#eeeeee",
            "hAlign": "AUTO",
            "vAlign": "MIDDLE",
            "aggregationType": "SUM",
            "font": {"size": 13, "color": "", "styles": []},
            "align": {"hAlign": "AUTO", "vAlign": "MIDDLE"}
        },
        "useSelectStyle": true,
        "leftAxisWidth": 120,
        "showColorStep": false,
        "dataColumnMode": "LEFT",
        "format": {"isAll": true, "each": null, "type": "number", "sign": "KRW", "decimal": 2, "useThousandsSep": true},
        remark: {
            label: "테스트",
            pos: "BOTTOM_RIGHT"
        }
    });
}, false);

document.querySelector("#button_sum_horizontal").addEventListener("click", function (e) {
    pivotViewer.initialize(item_sum_horizontal, {
        "xProperties": [{"name": "Category"}, {"name": "Sub-Category"}],
        "yProperties": [{"name": "Region"}],
        "zProperties": [{"name": "SUM(Sales)", "digits": 2}, {"name": "SUM(Profit)", "digits": 2}],
        "axisSelectMode": "MULTI",
        "onAxisXClick": null,
        "onAxisYClick": null,
        "onBodyCellClick": null,
        "cellWidth": 120,
        "cellHeight": 30,
        "showAxisZ": false,
        "min": 1847,
        "max": 6026,
        "header": {
            "font": {"size": 13, "styles": [], "color": "#959595"},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showHeader": true,
            "backgroundColor": "#ffffff"
        },
        "body": {
            "font": {"size": 13, "styles": []},
            "color": {"stepColors": [], "stepTextColors": [], "showColorStep": true},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showAxisZ": false
        },
        'calcCellStyle': {
            "label": "총합",
            "fontSize": "NORMAL",
            "fontStyles": [],
            "fontColor": "",
            "backgroundColor": "#eeeeee",
            "hAlign": "AUTO",
            "vAlign": "MIDDLE",
            "aggregationType": "SUM",
            "font": {"size": 13, "color": "", "styles": []},
            "align": {"hAlign": "AUTO", "vAlign": "MIDDLE"}
        },
        "useSelectStyle": true,
        "leftAxisWidth": 120,
        "showColorStep": false,
        "dataColumnMode": "TOP",
        "format": {"isAll": true, "each": null, "type": "number", "sign": "KRW", "decimal": 2, "useThousandsSep": true},
        remark: {
            label: "테스트",
            pos: "BOTTOM_RIGHT"
        }
    });
}, false);


document.querySelector("#button_sum_horizontal2").addEventListener("click", function (e) {
    pivotViewer.initialize(item_sum_horizontal2, {
        "xProperties": [{"name": "Category"}, {"name": "Sub-Category"}],
        "yProperties": [{"name": "Region"}],
        "zProperties": [{"name": "SUM(Sales)", "digits": 2}, {"name": "SUM(Profit)", "digits": 2}],
        "axisSelectMode": "MULTI",
        "onAxisXClick": null,
        "onAxisYClick": null,
        "onBodyCellClick": null,
        "cellWidth": 120,
        "cellHeight": 30,
        "showAxisZ": false,
        "min": 1847,
        "max": 6026,
        "header": {
            "font": {"size": 13, "styles": [], "color": "#959595"},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showHeader": true,
            "backgroundColor": "#ffffff"
        },
        "body": {
            "font": {"size": 13, "styles": []},
            "color": {"stepColors": [], "stepTextColors": [], "showColorStep": true},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showAxisZ": true
        },
        'calcCellStyle': {
            "label": "총합",
            "fontSize": "NORMAL",
            "fontStyles": [],
            "fontColor": "",
            "backgroundColor": "#eeeeee",
            "hAlign": "AUTO",
            "vAlign": "MIDDLE",
            "aggregationType": "SUM",
            "font": {"size": 13, "color": "", "styles": []},
            "align": {"hAlign": "AUTO", "vAlign": "MIDDLE"}
        },
        "useSelectStyle": true,
        "leftAxisWidth": 120,
        "showColorStep": false,
        "dataColumnMode": "TOP",
        "format": {"isAll": true, "each": null, "type": "number", "sign": "KRW", "decimal": 2, "useThousandsSep": true}
    });
}, false);

document.querySelector("#button_horizontal_non_x").addEventListener("click", function (e) {
    pivotViewer.initialize(item_horizontal_non_x, {
        "xProperties": [],
        "yProperties": [{"name": "Category"}],
        "zProperties": [{"name": "SUM(Sales)", "digits": 2}, {"name": "SUM(Profit)", "digits": 2}],
        "axisSelectMode": "MULTI",
        "onAxisXClick": null,
        "onAxisYClick": null,
        "onBodyCellClick": null,
        "cellWidth": 120,
        "cellHeight": 30,
        "showAxisZ": false,
        "min": 1847,
        "max": 6026,
        "header": {
            "font": {"size": 13, "styles": [], "color": "#959595"},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showHeader": true,
            "backgroundColor": "#ffffff"
        },
        "body": {
            "font": {"size": 13, "styles": []},
            "color": {"stepColors": [], "stepTextColors": [], "showColorStep": true},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showAxisZ": true
        },
        'calcCellStyle': {
            "label": "총합",
            "fontSize": "NORMAL",
            "fontStyles": [],
            "fontColor": "",
            "backgroundColor": "#eeeeee",
            "hAlign": "AUTO",
            "vAlign": "MIDDLE",
            "aggregationType": "SUM",
            "font": {"size": 13, "color": "", "styles": []},
            "align": {"hAlign": "AUTO", "vAlign": "MIDDLE"}
        },
        "useSelectStyle": true,
        "leftAxisWidth": 120,
        "showColorStep": false,
        "dataColumnMode": "LEFT",
        "format": {"isAll": true, "each": null, "type": "number", "sign": "KRW", "decimal": 2, "useThousandsSep": true}
    });
}, false);


document.querySelector("#button_vertical_non_x").addEventListener("click", function (e) {
    pivotViewer.initialize(item_horizontal_non_x, {
        "xProperties": [],
        "yProperties": [{"name": "Category"}],
        "zProperties": [{"name": "SUM(Sales)", "digits": 2}, {"name": "SUM(Profit)", "digits": 2}],
        "axisSelectMode": "MULTI",
        "onAxisXClick": null,
        "onAxisYClick": null,
        "onBodyCellClick": null,
        "cellWidth": 120,
        "cellHeight": 30,
        "showAxisZ": false,
        "min": 1847,
        "max": 6026,
        "header": {
            "font": {"size": 13, "styles": [], "color": "#959595"},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showHeader": true,
            "backgroundColor": "#ffffff"
        },
        "body": {
            "font": {"size": 13, "styles": []},
            "color": {"stepColors": [], "stepTextColors": [], "showColorStep": true},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showAxisZ": true
        },
        'calcCellStyle': {
            "label": "총합",
            "fontSize": "NORMAL",
            "fontStyles": [],
            "fontColor": "",
            "backgroundColor": "#eeeeee",
            "hAlign": "AUTO",
            "vAlign": "MIDDLE",
            "aggregationType": "SUM",
            "font": {"size": 13, "color": "", "styles": []},
            "align": {"hAlign": "AUTO", "vAlign": "MIDDLE"}
        },
        "useSelectStyle": true,
        "leftAxisWidth": 120,
        "showColorStep": false,
        "dataColumnMode": "TOP",
        "format": {"isAll": true, "each": null, "type": "number", "sign": "KRW", "decimal": 2, "useThousandsSep": true}
    });
}, false);


document.querySelector("#button_horizontal_non_x_data").addEventListener("click", function (e) {
    pivotViewer.initialize(item_horizontal_non_x, {
        "xProperties": [],
        "yProperties": [{"name": "Category"}],
        "zProperties": [{"name": "SUM(Sales)", "digits": 2}, {"name": "SUM(Profit)", "digits": 2}],
        "axisSelectMode": "MULTI",
        "onAxisXClick": null,
        "onAxisYClick": null,
        "onBodyCellClick": null,
        "cellWidth": 120,
        "cellHeight": 30,
        "showAxisZ": false,
        "min": 1847,
        "max": 6026,
        "header": {
            "font": {"size": 13, "styles": [], "color": "#959595"},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showHeader": true,
            "backgroundColor": "#ffffff"
        },
        "body": {
            "font": {"size": 13, "styles": []},
            "color": {"stepColors": [], "stepTextColors": [], "showColorStep": true},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showAxisZ": false
        },
        'calcCellStyle': {
            "label": "총합",
            "fontSize": "NORMAL",
            "fontStyles": [],
            "fontColor": "",
            "backgroundColor": "#eeeeee",
            "hAlign": "AUTO",
            "vAlign": "MIDDLE",
            "aggregationType": "SUM",
            "font": {"size": 13, "color": "", "styles": []},
            "align": {"hAlign": "AUTO", "vAlign": "MIDDLE"}
        },
        "useSelectStyle": true,
        "leftAxisWidth": 120,
        "showColorStep": false,
        "dataColumnMode": "LEFT",
        "format": {"isAll": true, "each": null, "type": "number", "sign": "KRW", "decimal": 2, "useThousandsSep": true}
    });
}, false);


document.querySelector("#button_vertical_non_x_data").addEventListener("click", function (e) {
    pivotViewer.initialize(item_horizontal_non_x, {
        "xProperties": [],
        "yProperties": [{"name": "Category"}],
        "zProperties": [{"name": "SUM(Sales)", "digits": 2}, {"name": "SUM(Profit)", "digits": 2}],
        "axisSelectMode": "MULTI",
        "onAxisXClick": null,
        "onAxisYClick": null,
        "onBodyCellClick": null,
        "cellWidth": 120,
        "cellHeight": 30,
        "showAxisZ": false,
        "min": 1847,
        "max": 6026,
        "header": {
            "font": {"size": 13, "styles": [], "color": "#959595"},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showHeader": true,
            "backgroundColor": "#ffffff"
        },
        "body": {
            "font": {"size": 13, "styles": []},
            "color": {"stepColors": [], "stepTextColors": [], "showColorStep": true},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showAxisZ": false
        },
        'calcCellStyle': {
            "fontSize": "NORMAL",
            "fontStyles": [],
            "fontColor": "",
            "backgroundColor": "#eeeeee",
            "hAlign": "AUTO",
            "vAlign": "MIDDLE",
            "aggregationType": "SUM",
            "font": {"size": 13, "color": "", "styles": []},
            "align": {"hAlign": "AUTO", "vAlign": "MIDDLE"}
        },
        "useSelectStyle": true,
        "leftAxisWidth": 120,
        "showColorStep": false,
        "dataColumnMode": "TOP",
        "format": {"isAll": true, "each": null, "type": "number", "sign": "KRW", "decimal": 2, "useThousandsSep": true}
    });
}, false);

document.querySelector("#button_2col_pivot").addEventListener("click", function (e) {
    pivotViewer.initialize(item_2col_pivot, {
        "xProperties": [{"name": "COLUMNS"}],
        "yProperties": [{"name": "&nbsp;"}],
        "zProperties": [{"name": "VALUE"}],
        "axisSelectMode": "MULTI",
        "onAxisXClick": null,
        "onAxisYClick": null,
        "onBodyCellClick": null,
        "cellWidth": 120,
        "cellHeight": 30,
        "showAxisZ": false,
        "min": 1,
        "max": 2001,
        "header": {
            "font": {"size": 13, "styles": [], "color": "#959595"},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showHeader": true,
            "backgroundColor": "#ffffff"
        },
        "body": {
            "font": {"size": 13, "styles": []},
            "color": {"stepColors": [], "stepTextColors": [], "showColorStep": true},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showAxisZ": false
        },
        "useSelectStyle": true,
        "leftAxisWidth": 120,
        "showColorStep": false,
        "dataColumnMode": "LEFT",
        "format": {"isAll": true, "each": null, "type": "number", "sign": "KRW", "decimal": 2, "useThousandsSep": true}
    });
}, false);

document.querySelector("#button_2row_pivot").addEventListener("click", function (e) {
    pivotViewer.initialize(item_2row_pivot, {
        "xProperties": [],
        "yProperties": [{"name": "Category"}, {"name": "Region"}],
        "zProperties": [],
        "axisSelectMode": "MULTI",
        "onAxisXClick": null,
        "onAxisYClick": null,
        "onBodyCellClick": null,
        "cellWidth": 120,
        "cellHeight": 30,
        "showAxisZ": false,
        "min": 1847,
        "max": 6026,
        "header": {
            "font": {"size": 13, "styles": [], "color": "#959595"},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showHeader": true,
            "backgroundColor": "#ffffff"
        },
        "body": {
            "font": {"size": 13, "styles": []},
            "color": {"stepColors": [], "stepTextColors": [], "showColorStep": true},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showAxisZ": false
        },
        "useSelectStyle": true,
        "leftAxisWidth": 120,
        "showColorStep": false,
        "dataColumnMode": "LEFT",
        "format": {"isAll": true, "each": null, "type": "number", "sign": "KRW", "decimal": 2, "useThousandsSep": true},
        remark: {
            label: "테스트",
            pos: "BOTTOM_RIGHT"
        }
    });
}, false);

document.querySelector("#button_3row_pivot").addEventListener("click", function (e) {
    pivotViewer.initialize(item_3row_pivot, {
        "xProperties": [],
        "yProperties": [{"name": "Region"}, {"name": "Category"}, {"name": "Sub-Category"}],
        "zProperties": [{"name": "SUM(Sales)", "digits": 2}],
        "axisSelectMode": "MULTI",
        "onAxisXClick": null,
        "onAxisYClick": null,
        "onBodyCellClick": null,
        "cellWidth": 120,
        "cellHeight": 30,
        "showAxisZ": false,
        "min": 504,
        "max": 101786,
        "header": {
            "font": {"size": 13, "styles": [], "color": "#959595"},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showHeader": true,
            "backgroundColor": "#ffffff"
        },
        "body": {
            "font": {"size": 13, "styles": []},
            "color": {"stepColors": [], "stepTextColors": [], "showColorStep": true},
            "align": {"hAlign": "left", "vAlign": "middle"},
            "showAxisZ": false
        },
        "useSelectStyle": true,
        "leftAxisWidth": 120,
        "showColorStep": false,
        "dataColumnMode": "LEFT",
        "subCalcCellStyle": {
            "region": {
                "fontSize": "NORMAL",
                "fontStyles": [],
                "fontColor": "",
                "backgroundColor": "#eeeeee",
                "hAlign": "AUTO",
                "vAlign": "MIDDLE",
                "aggregationType": "AVERAGE",
                "font": {"size": 13, "color": "", "styles": []},
                "align": {"hAlign": "AUTO", "vAlign": "MIDDLE"}
            },
            "category": {
                "fontSize": "NORMAL",
                "fontStyles": [],
                "fontColor": "",
                "backgroundColor": "#eeeeee",
                "hAlign": "AUTO",
                "vAlign": "MIDDLE",
                "aggregationType": "AVERAGE",
                "font": {"size": 13, "color": "", "styles": []},
                "align": {"hAlign": "AUTO", "vAlign": "MIDDLE"}
            },
            "sub-category": {
                "fontSize": "NORMAL",
                "fontStyles": [],
                "fontColor": "",
                "backgroundColor": "#eeeeee",
                "hAlign": "AUTO",
                "vAlign": "MIDDLE",
                "aggregationType": "AVERAGE",
                "font": {"size": 13, "color": "", "styles": []},
                "align": {"hAlign": "AUTO", "vAlign": "MIDDLE"}
            }
        },
        "format": {"isAll": true, "each": null, "type": "number", "sign": "KRW", "decimal": 2, "useThousandsSep": true}
    });
}, false);

document.querySelector("#button10").addEventListener("click", function (e) {
    pivotViewer.initialize(items8, {
        xProperties: [{"name": "Category"}],
        yProperties: [{"name": "City"}],
        zProperties: [{"name": "SUM(Discount)", "digits": 2}, {
            "name": "AVG(Discount)",
            "digits": 2
        }, {"name": "SUM(Sales)", "digits": 2}],
        onAxisXClick: function (selectedData) {
            console.info('onAxisXClick', selectedData);
        },
        onAxisYClick: function (selectedData) {
            console.info('onAxisYClick', selectedData);
        },
        onBodyCellClick: function (selectedData) {
            console.info('onBodyCellClick', selectedData);
        },
        leftAxisWidth: 100,
        axisSelectMode: pivotViewer.SELECT_MODE.MULTI,
        dataColumnMode: pivotViewer.DATA_COL_MODE.TOP,
        cellWidth: 100,
        cellHeight: 36,
        body: {
            showAxisZ: true
        }
    });
}, false);

document.querySelector("#sample1").addEventListener("click", function (e) {
    pivotViewer.initialize(item_sample, {
        xProperties: [
            {name: "구분"},
            {name: "구분2"}
        ],
        yProperties: [
            {name: "센터"}
        ],
        zProperties: [
            {
                alias: "SUM(건수)",
                digits: 2,
                name: "건수"
            },
            {
                alias: "SUM(금액)",
                digits: 2,
                name: "금액"
            }
        ],
        onAxisXClick: function (selectedData) {
            console.info('onAxisXClick', selectedData);
        },
        onAxisYClick: function (selectedData) {
            console.info('onAxisYClick', selectedData);
        },
        onBodyCellClick: function (selectedData) {
            console.info('onBodyCellClick', selectedData);
        },
        leftAxisWidth: 120,
        axisSelectMode: pivotViewer.SELECT_MODE.MULTI,
        dataColumnMode: pivotViewer.DATA_COL_MODE.LEFT,
        cellWidth: 120,
        cellHeight: 30,
        body: {
            align: {
                hAlign: "auto",
                vAlign: "middle"
            },
            color: {
                colorTarget: "TEXT",
                showColorStep: true,
                stepColors: [],
                stepTextColors: []
            },
            font: {
                size: 13,
                styles: []
            },
            showAxisZ: true
        },
        showAxisZ: true,
        showColorStep: false,
        useSelectStyle: true
    });
}, false);

document.querySelector("#fontSize").addEventListener("change", function (e) {
    pivotViewer.fontSize(document.querySelector("#fontSize option:checked").value);
}, false);
document.querySelector("#textAlign").addEventListener("change", function (e) {
    pivotViewer.textAlign(document.querySelector("#textAlign option:checked").value);
}, false);
document.querySelector("#textAlignVertical").addEventListener("change", function (e) {
    pivotViewer.textAlignVertical(document.querySelector("#textAlignVertical option:checked").value);
}, false);

window.onresize = function (event) {
    pivotViewer.resize();
};
