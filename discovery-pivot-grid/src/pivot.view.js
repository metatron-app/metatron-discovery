function viewer(zs) {

    let ui = zs.ui;

    let SCROLL_WIDTH = void 0;
    let pivot = ui.pivot || (ui.pivot = {});
    let common = ui.common;
    let pivotStyle = ui.style;

    pivot.Viewer = (function () {

        Viewer.instances = [];

        // #20161227-01 : X/Y축 모두 클릭되도록 기능 추가
        Viewer.SELECT_MODE = common.SELECT_MODE;

        // #20161230-01 : 값 필드 표시 방향 선택 기능
        Viewer.DATA_COL_MODE = common.DATA_COL_MODE;

        // #20210225-01 : 정렬 타입 선택 기능
        Viewer.SORT_COL_MODE = common.SORT_COL_MODE;

        Viewer.FROZEN_COLUMN_ADDITIONAL_KEY = 'additional';

        Viewer.SHOW_CALCULATED_COLUMN_WIDTH = 120;

        Viewer.EMPTY_Y_AXIS_DIMENSION_KEY = "empty_y_axis_dimension";

        function Viewer(element) {
            let _this = this;
            this._itemsContext = {};
            this._itemsRange = {};
            this._element = element;
            common.addCssClass(this._element, pivotStyle.cssClass.container);
            this._elementHead = document.createElement("div");
            common.addCssClass(this._elementHead, pivotStyle.cssClass.head);
            this._elementHeadWrap = document.createElement("div");
            common.addCssClass(this._elementHeadWrap, pivotStyle.cssClass.headWrap);
            this._elementHeadFrozen = document.createElement("div");
            common.addCssClass(this._elementHeadFrozen, pivotStyle.cssClass.headFrozen);
            this._elementHeadCalculatedColumn = document.createElement("div");
            common.addCssClass(this._elementHeadCalculatedColumn, pivotStyle.cssClass.headFrozen);
            this._elementBody = document.createElement("div");
            common.addCssClass(this._elementBody, pivotStyle.cssClass.body);
            this._elementBodyWrap = document.createElement("div");
            common.addCssClass(this._elementBodyWrap, pivotStyle.cssClass.bodyWrap);
            this._elementBodyFrozen = document.createElement("div");
            common.addCssClass(this._elementBodyFrozen, pivotStyle.cssClass.bodyFrozen);
            this._elementBodyCalculatedColumn = document.createElement("div");
            common.addCssClass(this._elementBodyCalculatedColumn, pivotStyle.cssClass.bodyFrozen);
            this._elementBodyScrollListener = function (e) {
                return _this.onScroll(e);
            };
            this._elementBody.addEventListener("scroll", this._elementBodyScrollListener, false);
            this._scrollTop = 0;
            this._scrollTopMax = 0;
            this._scrollLeft = 0;
            this._scrollLeftMax = 0;
            this._scrollVertical = false;
            this._scrollHorizontal = false;

            // #20161227-01 : X/Y축 모두 클릭되도록 기능 추가
            this.SELECT_MODE = Viewer.SELECT_MODE;

            // #20161230-01 : 값 필드 표시 방향 선택 기능
            this.DATA_COL_MODE = Viewer.DATA_COL_MODE;

            // 너비를 전체 채운다.
            this.IS_FILL_WIDTH = true;

            let agent = navigator.userAgent.toLowerCase();
            this.isIE = ((navigator.appName === 'Netscape' && agent.indexOf('trident') !== -1) || (agent.indexOf("msie") !== -1));

            if (!SCROLL_WIDTH) {
                SCROLL_WIDTH = (function () {
                    let inner, outer, scrollWidth;
                    inner = document.createElement("DIV");
                    inner.style.width = "200px";
                    inner.style.height = "200px";
                    outer = document.createElement("DIV");
                    outer.style.visibility = "hidden";
                    outer.style.width = "100px";
                    outer.style.height = "100px";
                    outer.style.overflow = "scroll";
                    outer.style.msOverflowStyle = "scrollbar";
                    outer.appendChild(inner);
                    document.body.appendChild(outer);
                    scrollWidth = outer.offsetWidth - outer.clientWidth;
                    outer.parentNode.removeChild(outer);
                    return scrollWidth;
                })();
            }

            Viewer.instances.push(this);
        } // func - Viewer

        /**
         * yItem 으로 부터 전체 합 관련 필드명(key)를 얻는다. ( 없을 시 undefined )
         * @param yItem
         * @return {undefined}
         */
        function getCalcKey(yItem) {
            let subCalcKey = undefined;
            for (let key in yItem) {
                if (yItem.hasOwnProperty(key) && 'TOTAL' === yItem[key]) {
                    subCalcKey = key;
                    break;
                }
            }
            return subCalcKey;
        }   // function - getCalcKey

        /**
         * yItem 으로 부터 부분합 관련 필드명(key)를 얻는다. ( 없을 시 undefined )
         * @param yItem
         * @return {undefined}
         */
        function getSubCalcKey(yItem) {
            let subCalcKey = undefined;
            for (let key in yItem) {
                if (yItem.hasOwnProperty(key) && 'SUB-TOTAL' === yItem[key]) {
                    subCalcKey = key;
                    break;
                }
            }
            return subCalcKey;
        }   // function - getSubCalcKey

        /**
         * 화면상에 표시되는 값을 표현
         * @param val
         * @return {string}
         */
        function getDisplayValue(val) {
            return '$$empty$$' === val ? '' : val;
        }   // function - getDisplayValue

        /**
         * 그리드 초기화 함수
         */
        Viewer.prototype.initialize = function (orgItems, settings) {
            let objViewer = this;
            let items = JSON.parse(JSON.stringify(orgItems));

            /**
             * -- #20161227-01 : X/Y축 모두 클릭되도록 기능 추가
             * ONESIDE, SINGLE, MULTI
             * ONESIDE  : 한 축이 선택되면 다른 축이 선택되지 않도록 함
             * SINGLE   : 한 축이 선택된 상태에서 다른 축을 선택할 수 있음 - 이전 선택 제거 함
             * MULTI    : 한 축이 선택된 상태에서 다른 축을 선택할 수 있음 - 이전 선택 제거 안함
             * -- #20161230-01 : 값 필드 표시 방향 선택 기능
             * TOP, LEFT
             * TOP        : 상단 X축 밑에 데이터 키를 표시함
             * LEFT        : 좌측 Y축 옆에 데이터 키를 표시함 ( 기존 형태 )
             */
            this._settings = {
                xProperties: null,
                yProperties: null,
                zProperties: null,
                cellWidth: 100,
                cellHeight: 24,
                leftAxisWidth: null,
                cumulativeClick: false,
                axisSelectMode: Viewer.SELECT_MODE.ONESIDE, // ONESIDE, SINGLE, MULTI    -- #20161227-01 : X/Y축 모두 클릭되도록 기능 추가
                useSelectStyle: true,
                onAxisXClick: undefined,
                onAxisYClick: undefined,
                onAxisZClick: undefined,
                onBodyCellClick: undefined,
                dataColumnMode: Viewer.DATA_COL_MODE.LEFT, // TOP, LEFT 	-- #20161230-01 : 값 필드 표시 방향 선택 기능
                yAxisAutoSort: false, // boolean 		-- #20170629-01 : y축 자동정렬 여부
                yAxisSort: false,   // boolean      -- #20210225-01 : y축 정렬 여부
                sortColumnParentKeys: null,   // -- #20210226-01 : 정렬 컬럼의 상위 컬럼 키
                sortColumnParentVals: null,   // -- #20210226-01 : 정렬 컬럼의 상위 컬럼 값
                sortColumnMeasure: null,   // -- #20210226-01 : 정렬 컬럼의 측정값
                sortType: 'NONE',   // NONE, ASC, DESC -- #20210226-01 : 정렬 유형
                header: {
                    showHeader: true, // 헤더
                    align: { // 정렬
                        hAlign: 'auto', // 가로정렬 (기본(일반텍스트는 좌측, 숫자는 우측), 좌측, 중앙, 우측)
                        vAlign: 'center' // 세로정렬 (상단, 중간, 하단)
                    },
                    font: { // 폰트
                        size: 13, // 폰트사이즈
                        color: '', // 폰트컬러
                        styles: [] // 폰트스타일 (기본, 굵게, 기울임꼴, 굵게 & 기울임꼴)
                    },
                    backgroundColor: '' // 배경 색상
                },
                body: {
                    showAxisZ: false, // 헤더컬럼 보이기
                    align: { // 정렬
                        hAlign: 'auto', // 가로정렬
                        vAlign: 'center' // 세로정렬
                    },
                    font: { // 폰트
                        size: 13, // 폰트사이즈
                        styles: [] // 폰트스타일 (기본, 굵게, 기울임꼴, 굵게 & 기울임꼴)
                    },
                    color: {
                        showColorStep: true, // 색상 설정여부
                        stepColors: ["#a1e1f8", "#89cdeb", "#59a4d2", "#418fc5", "#297bb8", "#246ea5", "#1e6191", "#19537e", "#13466b"], // 배경색상 그라데이션값
                        stepTextColors: ["#297bb8", "#297bb8", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"], // 글자색상 그라데이션값
                        stepRangeColors: [], // 사용자 정의색상값
                        colorTarget: 'TEXT' // 색상타입 (BACKGROUND, TEXT)
                    }
                },
                remark: { // 설명
                    pos: '', // 설명 위치 (상단 오른쪽, 상단 왼쪽, 하단 오른쪽, 하단 왼쪽)
                    label: '' // 설명 입력값
                },
                // totalValueStyle: {				// 연산행
                // 	label: '',					// 연산행 라벨
                //    font: {						// 폰트
                //        size: 13,				// 폰트사이즈
                //        color: '#3c3c3c',		// 폰트컬러
                //        styles: []				// 폰트스타일 (기본, 굵게, 기울임꼴, 굵게 & 기울임꼴)
                //    },
                // 	backgroundColor: '#eeeeee',	// 배경색상
                // 	align: {
                // 		hAlign: 'auto',			// 가로정렬
                // 		vAlign: 'center'		// 세로정렬
                // 	},
                // 	aggregationType: 'SUM'		// 연산자
                // }
                format: {
                    abbr: '', // 수치표기 약어
                    decimal: 0, // 소수점 자리
                    type: '', // 종류
                    sign: '', // 종류가 통화일때 통화 기호
                    useThousandsSep: false, // 천단위 구분 사용 여부
                    customSymbol: {
                        value: '', // symbol 값
                        pos: '' // 위치 (BEFORE, AFTER)
                    }
                }
            };

            // 가로정렬, 세로정렬 폰트크기 폰트색상, 폰트스타일
            // 배경색상 = 헤더
            // 색상스타일 = 본문

            // #20161227-01 : X/Y축 모두 클릭되도록 기능 추가
            // 이전 버전에 대한 하위 호환 코드
            if (!settings['isSelectOneSideAxis']) {
                this._settings.axisSelectMode = Viewer.SELECT_MODE.SINGLE;
            }
            // #20161230-01 : 값 필드 표시 방향 선택 기능
            // 이전 버전에 대한 하위 호환 코드

            if (settings.body && settings.body.showAxisZ) {
                this._settings.dataColumnMode = Viewer.DATA_COL_MODE.LEFT;
            }

            for (let key in settings) {
                if (settings.hasOwnProperty(key)) {
                    this._settings[key] = settings[key];
                }
            }
            (this._settings.leftAxisWidth) || (this._settings.leftAxisWidth = this._settings.cellWidth);

            // #20180831-01 : 1col 지원 추가 - S
            if (0 === this._settings.zProperties.length) {
                this._settings.zProperties.push({name: "COUNT(__count)"});
            }
            // #20180831-01 : 1col 지원 추가 - E

            // 데이터 정리 - Start
            this._pivotData = items;
            this._isPivot = true;
            this._items = [];
            this._itemsContext = {};
            this._xItems = [];
            this._yItems = [];
            this._dataCriteria = {};

            // Add Property by eltriny - Start
            this._leafColumnWidth = {}; // 각 아이템별 Width 값을 저장 ( itemKey : width Value ) - 20180807 : Koo : Resize Column
            this._leafFrozenColumnWidth = {}; // 고정 헤더 Width 값을 저장

            this._axisDataset = [];
            this._selectedAxis = null;
            this._xAxisGroup = {};
            this._yAxisGroup = {};
            this._bodyCellSelectInfo = {};
            // Add Property by eltriny - end

            // 데이터 정리 - Start
            if (items.rows && 0 < items.rows.length) {
                if (this._settings.calcCellStyle) {
                    items.rows.push('TOTAL');
                    items.columns.forEach(col => {
                        if (col.value.length > col.categoryName.length) {
                            col.value.splice(col.value.length-1, 1);
                        }
                        col.value.push(this.getSummaryValue(col.value, this._settings.calcCellStyle));
                    });
                }
                if (this._settings.subCalcCellStyle) {
                    // Row 정보에 Sub Total 추가 - Start
                    const subCalc = this._settings.yProperties.map(yProp => this._settings.subCalcCellStyle[yProp.name.toLowerCase()]);
                    let rowArr = items.rows.map(row => row.split('―'));
                    let prevRowInfo = rowArr[0];
                    for (let idx1 = 0, nMax = rowArr.length; idx1 < nMax; idx1++) {
                        let rowInfo = rowArr[idx1];
                        // console.info( '%c>>>>>> rowInfo / prevRowInfo', 'color:#FF0000;background-color:#FFFF00;', rowInfo, prevRowInfo );
                        // console.info( rowInfo[0] )
                        // console.info( '\'TOTAL\' !== rowInfo[0]', 'TOTAL' !== rowInfo[0]);
                        // console.info( '%c>>>>>> rowInfo / prevRowInfo', 'color:#0000FF;', rowInfo, prevRowInfo );
                        for (let idx2 = subCalc.length - 1; idx2 >= 0; idx2--) {
                            // console.info( '>>>>> idx : %s, prevRowInfo : %s, rowInfo : %s, T/F : %s', idx2, prevRowInfo.slice(0, idx2).join('>'), rowInfo.slice(0, idx2).join('>'), prevRowInfo.slice(0, idx2).join('>') !== rowInfo.slice(0, idx2).join('>') );
                            if (subCalc[idx2]
                                && prevRowInfo.slice(0, idx2).join('>') !== rowInfo.slice(0, idx2).join('>')) {
                                // console.info( '%c>>>>> create subtotal', 'color:#FFFFFF;background-color:#0000FF;' );
                                // sub-total 항목을 넣어준다.
                                const frontArr = rowArr.slice(0, idx1);
                                const endArr = rowArr.slice(idx1, rowArr.length);
                                const subTotalItem = [].concat(prevRowInfo.slice(0, idx2));
                                subTotalItem.push('SUB-TOTAL');
                                frontArr.push(subTotalItem);
                                rowArr = frontArr.concat(endArr);
                                // sub total 이 추가되면서 변경되는 index 번호를 재조정 해준다.
                                if (nMax !== rowArr.length) {
                                    idx1 = idx1 + (rowArr.length - nMax);
                                    nMax = rowArr.length;
                                }
                            }
                        }
                        prevRowInfo = rowArr[idx1];
                    }
                    if ('TOTAL' !== prevRowInfo[0]) {
                        // 마지막 줄 SUB-TOTAL 추가
                        for (let idx2 = subCalc.length - 1; idx2 >= 0; idx2--) {
                            if (subCalc[idx2]) {
                                const frontArr = rowArr;
                                const subTotalItem = [].concat(prevRowInfo.slice(0, idx2));
                                if (0 < subTotalItem.length) {
                                    subTotalItem.push('SUB-TOTAL');
                                    frontArr.push(subTotalItem);
                                    rowArr = [].concat(frontArr);
                                }
                            }
                        }
                    }
                    items.rows = rowArr.map(rowInfo => rowInfo.join(common.__fieldSeparator));
                    // Row 정보에 Sub Total 추가 - End

                    // Column 정보에 Sub Total 에 따른 category 정보 추가 - Start
                    items.columns.forEach(col => {
                        items.rows.forEach((row, idx) => {
                            if (-1 < row.indexOf('SUB-TOTAL')) {

                                // 값 목록 추출
                                const splitRow = row.split(common.__fieldSeparator);
                                const subTotalPrefix = splitRow.slice(0, splitRow.length - 1).join(common.__fieldSeparator);
                                const valList = [];
                                for (let idx2 = idx - 1; idx2 >= 0; idx2--) {
                                    if (0 !== items.rows[idx2].indexOf(subTotalPrefix)) {
                                        break;
                                    }
                                    if (-1 < items.rows[idx2].indexOf('SUB-TOTAL')) {
                                        continue;
                                    }
                                    valList.push(col.value[idx2]);
                                }

                                const frontArr = col.value.slice(0, idx);
                                const endArr = col.value.slice(idx, col.value.length);
                                frontArr.push(this.getSummaryValue(valList, subCalc[splitRow.length - 2]));
                                col.value = frontArr.concat(endArr);
                            }
                        });
                    });
                    // Column 정보에 Sub Total 에 따른 category 정보 추가 - End
                } else {
                    items.rows = items.rows.map(row => row.split('―').join(common.__fieldSeparator));
                }
            }

            if (items.columns && 0 < items.columns.length) {
                items.columns.forEach(col => {
                    col.name = col.name.split('―').join(common.__fieldSeparator);
                });
            }
            // 데이터 정리 - End

            this.summaryMap = {};

            // zProperties를 이용하여 데이터 범위 기준 정보 형태 선언 - Start
            let min = !this._settings.min ? 0 : this._settings.min;
            let max = !this._settings.max ? 0 : this._settings.max;
            let zProp = this._settings.zProperties;
            let showColorStep = this._settings.body.color && this._settings.body.color.showColorStep ? this._settings.body.color.showColorStep : null;

            if (zProp && showColorStep) {
                let arrColors = this._settings.body.color.stepColors;
                let arrTextColors = this._settings.body.color.stepTextColors;
                zProp.forEach(function (prop) {

                    objViewer._dataCriteria[prop.name] = {
                        max: max,
                        min: min,
                        range: 0,
                        step: (arrColors && arrColors.length > 0) ? arrColors.length : arrTextColors.length,
                        color: arrColors,
                        textColor: arrTextColors,
                        getStep: function (data) {
                            let currStep = Math.floor((data - this.min) / this.range);
                            (this.step <= currStep) && (currStep = this.step - 1);
                            return currStep;
                        },
                        getTextColor: function (data) {
                            if (this.textColor) {
                                return this.textColor[this.getStep(data)];
                            } else {
                                return null;
                            }
                        },
                        getColor: function (data) {
                            if (this.color) {
                                return this.color[this.getStep(data)];
                            } else {
                                return null;
                            }
                        },
                        /**
                         * 사용자 색상범위 설정
                         * @param data 현재 컬럼의 데이터값
                         * @param rangeColors 범위색상 데이터
                         * @returns {string}
                         */
                        getUserRangeColor: function (data, rangeColors) {

                            let returnColor = '';

                            // 범위값이 있는경우 해당 범위내의 색상으로 설정
                            for (const item of rangeColors) {
                                if (item.min <= data && item.max >= data) {
                                    returnColor = item.color;
                                    break;
                                }
                            }

                            // 범위이외값인경우 범위이외의값색상으로 설정


                            if ('' === returnColor) {
                                returnColor = '#3c4950';
                            }

                            return returnColor;
                        }
                    };
                });
            } // end if - zProp
            // zProperties를 이용하여 데이터 범위 기준 정보 형태 선언 - End

            // Pivot 데이터여부
            // 20171130 taeho - 피봇 / 원본 데이터형태 모두 지원하도록 변경
            this._isPivot = !!items.columns;

            // Pivot 데이터 형태일 경우
            // 20171130 taeho - 피봇 / 원본 데이터형태 모두 지원하도록 변경
            if (this._isPivot) {

                let zPropCount = zProp.length;
                let xProps = this._settings.xProperties;
                let yProps = this._settings.yProperties;
                let zProps = this._settings.zProperties;

                items.columns.forEach((column, columnIdx) => {

                    // let colNameList = _.split(column.name, '―'); // TODO : 확인 필요 -> Github 버전
                    let colNameList = column.name ? column.name.split(common.__fieldSeparator) : [''];

                    if (columnIdx % zPropCount !== 0) return;

                    //20170811 Dolkkok - 피봇데이터기반으로 변경

                    if (objViewer._settings.showCalculatedColumnStyle) {
                        // 연산열 대상 데이터를 summaryMap에 추가
                        Viewer.prototype.appendCalculatedColumnDataToSummaryMap(column, objViewer.summaryMap);
                    }
                    column.value.forEach(function (value, valueIdx) {

                        let context = objViewer._itemsContext;
                        let xGroup = objViewer._xAxisGroup;
                        let yGroup = objViewer._yAxisGroup;

                        let item = {};

                        let arrSummaryKeys = [];
                        let arrSummaryKeysForCalculatedColumn = [];
                        for (let idx = 0, nMax = xProps.length; idx < nMax; idx++) {
                            let itemKey = xProps[idx].name;
                            let itemValue = colNameList[idx];

                            ('' === itemValue) && (itemValue = '$$empty$$');    // dimension 값이 없을 경우를 위한 임시값 설정

                            item[itemKey] = itemValue;
                            arrSummaryKeys.push(itemValue);

                            if (!context.hasOwnProperty(itemValue)) {
                                context[itemValue] = {};
                            }
                            context = context[itemValue];

                            if (!xGroup.hasOwnProperty(itemValue)) {
                                xGroup[itemValue] = {};
                            }
                            xGroup = xGroup[itemValue];
                        } // end for - xProps

                        // let rowNameList = _.split(items.rows[valueIdx], '―');    // TODO : 확인 필요 -> Github 버전
                        let rowNameList = items.rows[valueIdx] ? items.rows[valueIdx].split(common.__fieldSeparator) : [''];

                        for (let idx = 0, nMax = yProps.length; idx < nMax; idx++) {
                            let itemKey = yProps[idx].name;
                            let itemValue = rowNameList[idx];
                            item[itemKey] = itemValue;

                            if (!context.hasOwnProperty(itemValue)) {
                                context[itemValue] = {};
                            }
                            context = context[itemValue];

                            if (!yGroup.hasOwnProperty(itemValue)) {
                                yGroup[itemValue] = {};
                            }
                            yGroup = yGroup[itemValue];
                            arrSummaryKeysForCalculatedColumn.push[itemValue];
                        } // end for - yProps

                        for (let idx = 0, nMax = zProps.length; idx < nMax; idx++) {
                            let itemKey = zProps[idx].name;
                            let itemValue = items.columns[columnIdx + idx].value[valueIdx];
                            item[itemKey] = !!itemValue ? itemValue : null;

                            // 요약 정보 생성
                            let summaryKey = 0 < arrSummaryKeys.length ? arrSummaryKeys.join('||') + '||' + itemKey : itemKey;
                            objViewer.summaryMap[summaryKey] || (objViewer.summaryMap[summaryKey] = []);
                            if (itemValue) {
                                objViewer.summaryMap[summaryKey].push(itemValue);
                            }
                        }

                        if (!xGroup.item) {
                            objViewer._xItems.push(xGroup.item = item);
                        }

                    // 20210226 : Harry : _yItems(Pivot) Setting For Sorting - S
                    if (!yGroup.item) {
                        if (objViewer._settings.yAxisSort) {
                            let arrSortColumnParentKeys = objViewer._settings.sortColumnParentKeys.split(common.__fieldSeparator);
                            let arrSortColumnParentVals = objViewer._settings.sortColumnParentVals.split(common.__fieldSeparator);

                            // x축 dimension 유무에 따른 분기
                            if (arrSortColumnParentKeys.join('').trim().length > 0) {
                                let isYItem = false;
                                for (let key of arrSortColumnParentKeys) {
                                    isYItem = ( item.hasOwnProperty(key) && arrSortColumnParentVals.indexOf(item[key]) > -1 );
                                    if (!isYItem) {
                                        break;
                                    }
                                }
                                if (isYItem) {
                                    objViewer._yItems.push(yGroup.item = item);
                                }
                            } else {
                                objViewer._yItems.push(yGroup.item = item);
                            }
                        } else {
                            objViewer._yItems.push(yGroup.item = item);
                        }
                    }
                    // 20210226 : Harry : _yItems(Pivot) Setting For Sorting - E

                    objViewer._items.push(item);

                    context["item"] = item;

                    // 데이터 임계 정보 설정 - Start
                    if (showColorStep) {
                        for (let key in item) {
                            let criteria = objViewer._dataCriteria[key];
                            if (criteria && item.hasOwnProperty(key)) {
                                let itemData = item[key];
                                criteria.min = (itemData < criteria.min) ? itemData : criteria.min;
                                criteria.max = (itemData > criteria.max) ? itemData : criteria.max;
                            }
                        }
                    } // if - showColorStep
                    // 데이터 임계 정보 설정 - End
                });
                //20170811 Dolkkok - 피봇데이터기반으로 변경
            });
            }
            // 원본 데이터 형태일 경우
            // 20171130 taeho - 피봇 / 원본 데이터형태 모두 지원하도록 변경
            else {

                items.forEach(function (item) {
                    let context = objViewer._itemsContext;
                    let xProps = objViewer._settings.xProperties;
                    let yProps = objViewer._settings.yProperties;
                    let xGroup = objViewer._xAxisGroup;
                    let yGroup = objViewer._yAxisGroup;

                    for (let idx = 0, nMax = xProps.length; idx < nMax; idx++) {
                        let itemKey = xProps[idx].name;
                        let itemValue = item[itemKey];

                        if (!context.hasOwnProperty(itemValue)) {
                            context[itemValue] = {};
                        }
                        context = context[itemValue];

                        if (!xGroup.hasOwnProperty(itemValue)) {
                            xGroup[itemValue] = {};
                        }
                        xGroup = xGroup[itemValue];
                    } // end for - xProps
                    if (!xGroup.item) {
                        objViewer._xItems.push(xGroup.item = item);
                    }

                    for (let idx = 0, nMax = yProps.length; idx < nMax; idx++) {
                        let itemKey = yProps[idx].name;
                        let itemValue = item[itemKey];

                        if (!context.hasOwnProperty(itemValue)) {
                            context[itemValue] = {};
                        }
                        context = context[itemValue];

                        if (!yGroup.hasOwnProperty(itemValue)) {
                            yGroup[itemValue] = {};
                        }
                        yGroup = yGroup[itemValue];
                    } // end for - yProps

                    // 20210226 : Harry : _yItems(Original) Setting For Sorting - S
                    if (!yGroup.item) {
                        if (objViewer._settings.yAxisSort) {
                            let arrSortColumnParentKeys = objViewer._settings.sortColumnParentKeys.split(common.__fieldSeparator);
                            let arrSortColumnParentVals = objViewer._settings.sortColumnParentVals.split(common.__fieldSeparator);

                            // x축 dimension 유무에 따른 분기
                            if (arrSortColumnParentKeys.join('').trim().length > 0) {
                                let isYItem = false;
                                for (let key of arrSortColumnParentKeys) {
                                    isYItem = ( item.hasOwnProperty(key) && arrSortColumnParentVals.indexOf(item[key]) > -1 );
                                    if (!isYItem) {
                                        break;
                                    }
                                }
                                if (isYItem) {
                                    objViewer._yItems.push(yGroup.item = item);
                                }
                            } else {
                                objViewer._yItems.push(yGroup.item = item);
                            }
                        } else {
                            objViewer._yItems.push(yGroup.item = item);
                        }
                    }
                    // 20210226 : Harry : _yItems(Original) Setting For Sorting - E

                    context["item"] = item;

                    // 데이터 임계 정보 설정 - Start
                    if (showColorStep) {
                        for (let key in item) {
                            let criteria = objViewer._dataCriteria[key];
                            if (criteria && item.hasOwnProperty(key)) {
                                let itemData = item[key];
                                criteria.min = (itemData < criteria.min) ? itemData : criteria.min;
                                criteria.max = (itemData > criteria.max) ? itemData : criteria.max;
                            }
                        }
                    } // if - showColorStep
                    // 데이터 임계 정보 설정 - End
                }); // end foreach - items
            }

            if (objViewer._settings.yAxisAutoSort) {
                // _yItems 정렬 - Start
                this._yItems.sort(function (currItem, nextItem) {
                    let arrYProps = objViewer._settings.yProperties;
                    let nOrder = 0;
                    try {
                        for (let idx = 0, nMax = arrYProps.length; idx < nMax; idx++) {
                            let propertyName = arrYProps[idx].name;
                            // let currAxisItem = currItem[propertyName];
                            // let nextAxisItem = nextItem[propertyName];

                            //값이 null일 경우 정렬이 정상적이지 않는 문제로 추가된 로직
                            let currAxisItem = (currItem[propertyName]) ? currItem[propertyName] : currItem[propertyName] = "null";
                            let nextAxisItem = (nextItem[propertyName]) ? nextItem[propertyName] : nextItem[propertyName] = "null";

                            if ("number" === arrYProps[idx].type) {
                                currAxisItem = Number(currItem[propertyName].replace(common.__regexpText, ''));
                                nextAxisItem = Number(nextItem[propertyName].replace(common.__regexpText, ''));
                            }
                            if (currAxisItem < nextAxisItem) {
                                nOrder = -1;
                                break;
                            } else if (currAxisItem > nextAxisItem) {
                                nOrder = 1;
                                break;
                            }
                        } // end for - arrYProps
                    } catch (error) {
                        console.error(error);
                    }
                    return nOrder;
                }); // end sort
                // _yItems 정렬 - End
            }

            // 20210226 : Harry : _yItems Sorting - S
            if (objViewer._settings.yAxisSort) {
                // _yItems 정렬 - Start
                this._yItems.sort(function (currItem, nextItem) {
                    let nOrder = 0;

                    try {
                        let propertyName = objViewer._settings.sortColumnMeasure;

                        //값이 null일 경우 정렬이 정상적이지 않는 문제로 추가된 로직
                        let currAxisItem = (currItem[propertyName]) ? currItem[propertyName] : currItem[propertyName] = 0;
                        let nextAxisItem = (nextItem[propertyName]) ? nextItem[propertyName] : nextItem[propertyName] = 0;

                        if (currAxisItem < nextAxisItem) {
                            nOrder = (objViewer._settings.sortType === Viewer.SORT_COL_MODE.ASC) ? -1 : 1;
                        } else if (currAxisItem > nextAxisItem) {
                            nOrder = (objViewer._settings.sortType === Viewer.SORT_COL_MODE.ASC) ? 1 : -1;
                        }
                    } catch (error) {
                        console.error(error);
                    }

                    return nOrder;
                }); // end sort
                // _yItems 정렬 - End
            }
            // 20210226 : Harry : _yItems Sorting - E

            // 20210226 : Harry : Total Item Reindexing - S
            // _yItems 총합(totalItem) 지정
            let totalItem = null;
            for (let yItem of this._yItems) {
                for (let yProp of this._settings.yProperties) {
                    if (yItem[yProp.name] === 'TOTAL') {
                        totalItem = yItem;
                        break;
                    }
                }
            }
            // _yItems 총합(totalItem)의 index 재설정 (_yItems 마지막 요소로 위치하도록 설정)
            if (totalItem) {
                this._yItems.splice(this._yItems.indexOf(totalItem), 1);
                this._yItems.push(totalItem);
            }
            // 20210226 : Harry : Total Item Reindexing - E

            // 데이터 범위 정보 설정 - Start
            if (showColorStep) {
                for (let key in this._dataCriteria) {
                    if (this._dataCriteria.hasOwnProperty(key)) {
                        let objCriteria = this._dataCriteria[key];
                        objCriteria.range = (objCriteria.max - objCriteria.min) / objCriteria.step;
                    }
                }
            } // if - showColorStep
            // 데이터 범위 정보 설정 - End

            // BodyCell 선택 정보 초기값 설정 - Start
            let dataDirectionToVertical = (Viewer.DATA_COL_MODE.LEFT === this._settings.dataColumnMode) ? 1 : 0;
            let dataDirectionToHorizontal = (Viewer.DATA_COL_MODE.TOP === this._settings.dataColumnMode) ? 1 : 0;
            let xMax = (dataDirectionToVertical * this._xItems.length) + (dataDirectionToHorizontal * this._xItems.length * this._settings.zProperties.length);
            let yMax = (dataDirectionToHorizontal * this._yItems.length) + (dataDirectionToVertical * this._yItems.length * this._settings.zProperties.length);
            for (let colIdx = 0; colIdx < xMax; colIdx++) {
                this._bodyCellSelectInfo[colIdx] = {};
                for (let rowIdx = 0; rowIdx < yMax; rowIdx++) {
                    this._bodyCellSelectInfo[colIdx][rowIdx] = false;
                } // end for - rowIdx
            } // end for - colIdx
            // BodyCell 선택 정보 초기값 설정 - End
            // 데이터 정리 - End

            this._element.innerHTML = "";
            this._elementHead.innerHTML = "";
            this._elementHeadWrap.innerHTML = "";
            this._elementHeadFrozen.innerHTML = "";
            this._elementHeadCalculatedColumn.innerHTML = "";
            this._elementBody.innerHTML = "";
            this._elementBodyWrap.innerHTML = "";
            this._elementBodyFrozen.innerHTML = "";
            this._elementBodyCalculatedColumn.innerHTML = "";
            this._element.appendChild(this._elementHead);
            this._element.appendChild(this._elementBody);
            this._elementHead.appendChild(this._elementHeadFrozen);
            this._elementHead.appendChild(this._elementHeadWrap);
            this._elementBody.appendChild(this._elementBodyFrozen);
            this._elementBody.appendChild(this._elementBodyWrap);
            this.addRemark(this._settings.remark); // 설명 설정

            if (this._settings.showCalculatedColumnStyle) {
                this._elementHead.appendChild(this._elementHeadCalculatedColumn);
                this._elementBody.appendChild(this._elementBodyCalculatedColumn);
            }

            this.arrange();

            // header설정이 있을떄 - 헤더 show / hide 설정
            (this._settings.header) && (this.showHeader(this._settings.header.showHeader));

            // Add Event by eltriny - Start
            let xAxisSelector = '.' + pivotStyle.cssClass.axisX;
            let yAxisSelector = '.' + pivotStyle.cssClass.axisY;
            let resizeHandleSelector = '.' + pivotStyle.cssClass.resizeHandle;
            let cellSelector = '.' + pivotStyle.cssClass.body + ' .' + pivotStyle.cssClass.bodyWrap + ' .' + pivotStyle.cssClass.bodyCell; // #20161227-02 Cell Click Event 추가
            let $container = $(this._element);
            let $xAxis = $container.find('.' + pivotStyle.cssClass.head);
            let $yAxis = $container.find('.' + pivotStyle.cssClass.bodyFrozen);
            let $body = $container.find('.' + pivotStyle.cssClass.body + ' .' + pivotStyle.cssClass.bodyWrap);
            // Add Event by harry
            let xAxisSortSelector = '.' + pivotStyle.cssClass.axisXSort;

            //add steve
            //let $resizeHandle = $container.find('.' + pivotStyle.cssClass.resizeHandle);
            $(this._element).off('mouseenter', xAxisSelector).off('mouseleave', xAxisSelector).off('click', xAxisSelector).off('mouseenter', yAxisSelector).off('mouseleave', yAxisSelector).off('click', yAxisSelector).off('click', cellSelector).off('drag', resizeHandleSelector).off('dragend', resizeHandleSelector).on('mouseenter', xAxisSelector, function () {
                if (0 === $(this).closest('.' + pivotStyle.cssClass.axisDisable).length) {
                    // Hover 스타일 적용
                    pivotStyle.setStyleVerticalCells.apply(objViewer, [$(this), $body.find(' .' + pivotStyle.cssClass.bodyRow), pivotStyle.cssClass.bodyHover]);
                }
            }) // on - mouseenter  : xAxisSelector
                .on('mouseleave', xAxisSelector, function () {
                    $container.find('.' + pivotStyle.cssClass.bodyHover).removeClass(pivotStyle.cssClass.bodyHover);
                }) // on - mouseleave  : xAxisSelector
                .on('mouseenter', yAxisSelector, function () {
                    if (0 === $(this).closest('.' + pivotStyle.cssClass.axisDisable).length) {
                        // Hover 스타일 적용
                        pivotStyle.setStyleHorizontalCells.apply(objViewer, [$(this), $body.find(' .' + pivotStyle.cssClass.bodyRow), pivotStyle.cssClass.bodyHover]);
                    }
                }) // on - mouseenter  : yAxisSelector
                .on('mouseleave', yAxisSelector, function () {
                    $container.find('.' + pivotStyle.cssClass.bodyHover).removeClass(pivotStyle.cssClass.bodyHover);
                }) // on - mouseleave  : yAxisSelector
                .on('click', xAxisSelector, function (event) {
                    if ('function' === typeof objViewer._settings.onAxisXClick && 0 === $xAxis.filter('[data-disabled=Y]').length) {
                        // 선택된 축 정보를 조회 후, 데이터 반환
                        let evtData = pivotStyle.getSelectedAxisData.apply(objViewer, [$(this), 'X', $xAxis, $yAxis]);

                        objViewer._settings.onAxisXClick(evtData);
                    } //  if - onAxisXClick is valid function && clickable
                }) // on - click : xAxisSelector
                // 20210305 : Harry : Sort Column Click - S
                .on('click', xAxisSortSelector, function (event) {
                    event.stopImmediatePropagation();

                    let elmData = $(this).attr('title');
                    let elmParentKeys = $(this).attr('data-parent-keys');
                    let elmParentVals = $(this).attr('data-parent-vals');
                    let elmSort = $(this).attr('data-sort');

                    // body-wrap, 원본 데이터 또는 vertical(dataColumnMode === 'TOP')인 경우
                    if ( !objViewer._isPivot || objViewer._settings.dataColumnMode === 'TOP' ) {
                        objViewer._settings.sortType = (elmSort === Viewer.SORT_COL_MODE.NONE) ? Viewer.SORT_COL_MODE.ASC : ( (elmSort === Viewer.SORT_COL_MODE.ASC) ? Viewer.SORT_COL_MODE.DESC : Viewer.SORT_COL_MODE.NONE );
                        objViewer._settings.yAxisSort = (objViewer._settings.sortType !== Viewer.SORT_COL_MODE.NONE);
                        objViewer._settings.sortColumnParentKeys = elmParentKeys.split('||').join(common.__fieldSeparator);
                        objViewer._settings.sortColumnParentVals = elmParentVals.split('||').join(common.__fieldSeparator);

                        // 원본 데이터인 경우
                        if (!objViewer._isPivot) {
                            objViewer._settings.sortColumnMeasure = objViewer._settings.zProperties[0].name;
                            let objItem = objViewer._pivotData;
                            let objSettings = objViewer._settings;
                            objViewer.initialize(objItem, objSettings);
                            return;
                        }

                        // z축 컬럼이 표시되지 않고 measure(zProperties) 1개만 설정된 경우 (Aggregation Column OFF)
                        if (!objViewer._settings.body.showAxisZ && objViewer._settings.zProperties.length === 1) {
                            objViewer._settings.sortColumnMeasure = objViewer._settings.zProperties[0].name;
                            objViewer.update(objViewer._settings);
                            return;
                        }

                        // z축 컬럼이 표시된 경우 (Aggregation Column ON)
                        if (objViewer._settings.body.showAxisZ && !_.isEmpty( _.find( objViewer._settings.zProperties, function(o) { return _.eq(o.name, elmData); } ) ) ) {
                            objViewer._settings.sortColumnMeasure = elmData;
                            objViewer.update(objViewer._settings);
                            return;
                        }
                    }
                }) // on - click : xAxisSortSelector
                // 20210305 : Harry : Sort Column Click - E
                .on('click', yAxisSelector, function () {
                    if ('function' === typeof objViewer._settings.onAxisYClick && 0 === $yAxis.filter('[data-disabled=Y]').length) {
                        // 선택된 축 정보를 조회 후, 데이터 반환
                        let evtData = pivotStyle.getSelectedAxisData.apply(objViewer, [$(this), 'Y', $yAxis, $xAxis]);
                        // let elmKey = $(this).attr('data-key');
                        objViewer._settings.onAxisYClick(evtData);
                    } //  if - onAxisYClick is valid function && clickable
                }) // on -click : yAxisSelector
                // #20161227-02 Cell Click Event 추가 - Start
                .on('click', cellSelector, function (event) {

                    if ('function' === typeof objViewer._settings.onBodyCellClick) {
                        let $target = $(event.currentTarget);
                        let objData = {};
                        $target.each(function () {
                            $.each(this.attributes, function () {
                                if (this.specified && -1 < this.name.indexOf('data-item')) {
                                    // 20171130 taeho - 피봇 / 원본 데이터형태 모두 지원하도록 변경
                                    if (objViewer._isPivot) {
                                        // 구분자를 통해 key, value 세팅
                                        // let keyValue = _.split(this.value, '―'); // TODO : 확인 필요 -> Github 버전
                                        let keyValue = this.value ? this.value.split(common.__fieldSeparator) : [''];
                                        objData[keyValue[0]] = keyValue[1];
                                    } else {
                                        objData[this.name.replace(/data-item-/gi, '')] = this.value;
                                    }
                                }
                            });
                        });
                        let itemKey = $target.attr('data-key');
                        if (itemKey) {
                            let nItemIdx = $target.attr('data-idx');
                            let nColIdx = $target.attr('data-colIdx');
                            let nRowIdx = $target.attr('data-rowIdx');
                            let objItem = objViewer._items[nItemIdx];

                            // juhee - objItem null체크 추가
                            if (!objItem) return;

                            // 20171130 taeho - 피봇 / 원본 데이터형태 모두 지원하도록 변경
                            if (objViewer._isPivot) {
                                if (objItem[itemKey] == null) return;
                            }
                            (objItem.selectInfo) || (objItem.selectInfo = {});
                            if (objItem.selectInfo[itemKey]) {
                                objItem.selectInfo[itemKey] = false;
                                objData.isSelect = false;
                                objViewer._bodyCellSelectInfo[nColIdx][nRowIdx] = false;
                            } else {
                                objItem.selectInfo[itemKey] = true;
                                objData.isSelect = true;
                                objViewer._bodyCellSelectInfo[nColIdx][nRowIdx] = true;
                            }

                            // 스타일 적용
                            pivotStyle.setClickStyle.apply(objViewer);

                            // 콜백
                            objViewer._settings.onBodyCellClick(objData);
                        }
                    }
                }) // on - click : cellSelector
                // #20161227-02 Cell Click Event 추가 - End
                // Add Event by eltriny - End
                //add steve
                .on('drag', resizeHandleSelector, function (event) {
                    event.stopPropagation();

                    let oldWidth = (event.target.parentElement.style.width.replace(/px/gi, '') * 1);
                    if (objViewer.isIE) {
                        event.target.parentElement.style.width = oldWidth + event.originalEvent.offsetX + 'px';
                    } else {
                        event.target.parentElement.style.width = oldWidth + event.originalEvent.layerX + 'px';
                    }
                })
                .on('dragend', resizeHandleSelector, function (event) {
                    event.stopPropagation();
                    let $column = $(event.target.parentElement);
                    let strParent = $column.attr('data-parent-vals');
                    let strVal = $column.attr('title');
                    let strLeafColName = strParent ? strParent + '||' + strVal : strVal;
                    let dragWidth = $column.css('width').replace(/px/, '') * 1;

                    if (objViewer._leafFrozenColumnWidth[strLeafColName]) {
                        objViewer._leafFrozenColumnWidth[strLeafColName] = dragWidth;
                    }

                    let widthKeys = Object.keys(objViewer._leafColumnWidth);
                    let contentSizeWidth = widthKeys.reduce(function (acc, item) {
                        return acc + objViewer._leafColumnWidth[item];
                    }, 0);
                    let currentGridWidth = objViewer._elementBody.style.width.replace(/px/gi, '') * 1 - objViewer._elementBodyFrozen.style.width.replace(/px/gi, '') * 1;


                    if (currentGridWidth < contentSizeWidth) {
                        // current state is scroll!!
                        if (!objViewer._leafColumnWidth[strLeafColName]) {
                            const keys = widthKeys.filter(item => -1 < item.indexOf(strLeafColName + '||'));
                            if (keys && 0 < keys.length) {
                                const cellWidth = dragWidth / keys.length;
                                keys.forEach(key => {
                                    objViewer._leafColumnWidth[key] = cellWidth;
                                });
                            }
                        } else {
                            objViewer._leafColumnWidth[strLeafColName] = dragWidth;
                        }
                    } else {

                        // current state is fit!!
                        let extraWidth = currentGridWidth - dragWidth;
                        let beforeExtraWidth = widthKeys.reduce((acc, val) => {
                            return acc + ((val !== strLeafColName) ? objViewer._leafColumnWidth[val] : 0);
                        }, 0);

                        widthKeys.forEach(key => {
                            if (key === strLeafColName) {
                                objViewer._leafColumnWidth[key] = dragWidth;
                            } else {
                                const keys = widthKeys.filter(item => -1 < item.indexOf(key + '||'));
                                if (keys && 0 < keys.length) {
                                    const cellWidth = dragWidth / keys.length;
                                    keys.forEach(subKey => {
                                        objViewer._leafColumnWidth[subKey] = cellWidth;
                                    });
                                } else {
                                    objViewer._leafColumnWidth[key] = extraWidth * (objViewer._leafColumnWidth[key] / beforeExtraWidth);
                                }
                            }
                        });
                    }

                    if (Viewer.DATA_COL_MODE.TOP === objViewer._settings.dataColumnMode) {
                        objViewer.renderDataToVertical(true);
                    } else {
                        objViewer.renderDataToHorizontal(true);
                    }
                });
            //end steve
        }; // func - initialize

        /**
         * 설정 업데이트
         */
        Viewer.prototype.update = function (settings) {
            // 20171130 taeho - 피봇 / 원본 데이터형태 모두 지원하도록 변경
            let objItem = this._isPivot ? this._pivotData : this._items;
            let objSettings = this._settings;
            for (let key in settings) {
                if (settings.hasOwnProperty(key)) {
                    objSettings[key] = settings[key];
                }
            } // for - settings
            this.initialize(objItem, objSettings);
        }; // func - update

        /**
         * [클래스문자열 변경] 폰트 스타일/사이즈 변경 ( 클래스 문자열 변경 )
         * ddp-font + [폰트스타일] 클래스 적용
         * ddp-font + [fontsize] 인 클래스를 적용해준다.
         */
        Viewer.prototype.addClassFontStyle = function (classStr, font) {
            if (font) {
                if (font.styles) {
                    for (const style of font.styles) {
                        classStr = classStr + ' ddp-font-' + style.toLowerCase();
                    }
                }

                if (0 < font.size) {
                    classStr = classStr + ' ddp-font' + font.size;
                }
            }
            return classStr;
        }; // function - addClassFontStyle

        /**
         * [클래스문자열 변경] 텍스트 정렬 변경 - 가로
         * [클래스문자열 변경] 텍스트 정렬 변경 - 세로
         * ddp-txt + [가로정렬] 인 클래스를 적용해준다.
         * ddp-valign + [세로정렬] 인 클래스를 적용해준다.
         */
        Viewer.prototype.addClassTextAlign = function (classStr, text, defaultAlign) {
            if (text) {
                let strTxtAlign = '';
                (text.hAlign) && (strTxtAlign = text.hAlign.toLowerCase());
                (this.isDefaultTextAlign(text) && defaultAlign) && (strTxtAlign = defaultAlign.toLowerCase());
                switch (strTxtAlign) {
                    case 'left' :
                        classStr = classStr + ' ' + pivotStyle.cssClass.txtLeft;
                        break;
                    case 'center' :
                        classStr = classStr + ' ' + pivotStyle.cssClass.txtCenter;
                        break;
                    case 'right' :
                        classStr = classStr + ' ' + pivotStyle.cssClass.txtRight;
                        break;
                }

                if (text.vAlign) {
                    switch (text.vAlign.toLowerCase()) {
                        case 'top' :
                            classStr = classStr + ' ' + pivotStyle.cssClass.txtTop;
                            break;
                        case 'middle' :
                            classStr = classStr + ' ' + pivotStyle.cssClass.txtMiddle;
                            break;
                        case 'bottom' :
                            classStr = classStr + ' ' + pivotStyle.cssClass.txtBottom;
                            break;
                    }
                }
            }
            return classStr;
        }; // function - addClassTextAlign

        Viewer.prototype.isDefaultTextAlign = function (text) {
            return (!text.hAlign || 'auto' === text.hAlign.toLowerCase() || 'default' === text.hAlign.toLowerCase());
        };  // function - isDefaultTextAlign

        /**
         * 세로 정렬을 위한 줄높이 설정
         * @param alignInfo
         * @param cellHeight
         * @param rowspan
         */
        Viewer.prototype.getLineHeightForValign = function (alignInfo, cellHeight, rowspan) {
            let lineHeight = cellHeight;
            if (alignInfo && alignInfo.hAlign) {
                switch (alignInfo.hAlign.toLowerCase()) {
                    case 'middle':
                        lineHeight = cellHeight;
                        break;
                    case 'bottom':
                        lineHeight = cellHeight + (this._settings.cellHeight * (rowspan / 2));
                        break;
                    default:
                        lineHeight = cellHeight - (this._settings.cellHeight * (rowspan / 2));

                }
            }
            return lineHeight;
        }; // function - getLineHeightForValign

        /**
         * 헤더 보여주기 / 가리기
         * ddp-header-
         */
        Viewer.prototype.showHeader = function (showHeader) {

            // show일때
            if (showHeader) {
                common.removeCssClass(this._elementHead, "ddp-header-hide");
                common.removeCssClass(this._elementBody, "header-none");
                common.removeCssClass(this._elementBodyFrozen, "ddp-header-hide");
                common.removeCssClass(this._elementBodyWrap, "header-none");
                // hide일때
            } else {
                common.addCssClass(this._elementHead, "ddp-header-hide");
                common.addCssClass(this._elementBody, "header-none");
                common.addCssClass(this._elementBodyFrozen, "ddp-header-hide");
                common.addCssClass(this._elementBodyWrap, "header-none");
            }
        };

        /**
         * 설명 설정
         * @param remark
         */
        Viewer.prototype.addRemark = function (remark) {

            if (!remark) return;

            this._elementAnnotation = document.createElement("span");
            this._elementAnnotation.innerHTML = remark.label;

            // top인 경우 elementHead전에 설정
            if (remark.pos && remark.pos.toLowerCase().indexOf("top") !== -1) {
                this._element.insertBefore(this._elementAnnotation, this._element.firstChild);
            } else {
                this._element.appendChild(this._elementAnnotation);
            }

            // right인 경우
            if (remark.pos && remark.pos.toLowerCase().indexOf("right") !== -1) {
                common.addCssClass(this._elementAnnotation, 'remark-right');
                // left인 경우
            } else {
                common.addCssClass(this._elementAnnotation, 'remark-left');
            }
        };

        /**
         * 그리드 설정 - 표시 준비 함수
         */
        Viewer.prototype.arrange = function () {
            if (!this._settings) {
                return;
            }

            // 원본일때에는 head영역 (COLUMNS)를 표시 x
            let xPropCnt = this._isPivot ? this._settings.xProperties.length : 0;
            let yPropCnt = this._settings.yProperties.length;
            let zPropCnt = this._settings.zProperties.length;
            let isSetRemark = (this._settings.remark && '' !== this._settings.remark.pos) ? 1 : 0;
            let isSetTopRemark = (this._settings.remark && -1 < this._settings.remark.pos.toLowerCase().indexOf('top')) ? 1 : 0;

            // #20161230-01 : 값 필드 표시 방향 선택 기능 - Start
            let dataDirectionToVertical = (Viewer.DATA_COL_MODE.LEFT === this._settings.dataColumnMode) ? 1 : 0;
            let dataDirectionToHorizontal = (Viewer.DATA_COL_MODE.TOP === this._settings.dataColumnMode) ? 1 : 0;
            let isShowDataKey = this._settings.body.showAxisZ ? 1 : 0;
            // #20161230-01 : 값 필드 표시 방향 선택 기능 - End
            let remarkHeight = isSetRemark * 30;
            let frozenCellWidth = this._settings.leftAxisWidth ? this._settings.leftAxisWidth : this._settings.cellWidth;

            let availableSizeHead = {
                width: this._element.clientWidth,
                height: this._settings.cellHeight * ((0 < xPropCnt) ? 1 + xPropCnt + dataDirectionToHorizontal * isShowDataKey : 1) // #20161230-01 : 값 필드 표시 방향 선택 기능
            };

            let availableSizeBody = {
                width: this._element.clientWidth,
                height: this._element.clientHeight - (availableSizeHead.height + remarkHeight)
            };
            let wrapSize = {
                width: availableSizeBody.width,
                height: availableSizeBody.height
            };
            let contentSize = {
                width: this._settings.cellWidth * this._xItems.length * ((zPropCnt - 1) * dataDirectionToHorizontal + 1) + frozenCellWidth * (yPropCnt + dataDirectionToVertical * isShowDataKey),
                height: this._settings.cellHeight * this._yItems.length * ((zPropCnt - 1) * dataDirectionToVertical + 1)
            };

            let prevScrollVertical = false;
            let prevScrollHorizontal = false;
            while (true) {
                let scrollVertical = false;
                let scrollHorizontal = false;
                if (contentSize.height > wrapSize.height) {
                    scrollVertical = true;
                    wrapSize.width = availableSizeBody.width - SCROLL_WIDTH;
                } else {
                    wrapSize.width = availableSizeBody.width;
                }
                if (contentSize.width > wrapSize.width) {
                    scrollHorizontal = true;
                    wrapSize.height = availableSizeBody.height - SCROLL_WIDTH;
                } else {
                    wrapSize.height = availableSizeBody.height;
                }
                let b = prevScrollVertical === scrollVertical && prevScrollHorizontal === scrollHorizontal;
                prevScrollVertical = scrollVertical;
                prevScrollHorizontal = scrollHorizontal;
                if (b) {
                    this._scrollVertical = prevScrollVertical;
                    this._scrollHorizontal = prevScrollHorizontal;
                    common.removeCssClass(this._element, "pivot-view-scroll-vertical");
                    common.removeCssClass(this._element, "pivot-view-scroll-horizontal");
                    if (this._scrollVertical && this._scrollHorizontal) {
                        common.addCssClass(this._element, "pivot-view-scroll-vertical");
                        common.addCssClass(this._element, "pivot-view-scroll-horizontal");
                    } else if (this._scrollVertical) {
                        common.addCssClass(this._element, "pivot-view-scroll-vertical");
                    } else if (this._scrollHorizontal) {
                        common.addCssClass(this._element, "pivot-view-scroll-horizontal");
                    }
                    break;
                }
            }
            let frozenWidth = frozenCellWidth * (this._settings.yProperties.length + dataDirectionToVertical * isShowDataKey);
            this._elementHead.style.top = isSetTopRemark * remarkHeight + 'px';
            this._elementHead.style.width = (this._scrollVertical ? availableSizeHead.width - SCROLL_WIDTH : availableSizeHead.width) + "px";
            this._elementHead.style.height = availableSizeHead.height + "px";
            this._elementBody.style.top = availableSizeHead.height + isSetTopRemark * remarkHeight + "px";
            this._elementBody.style.width = availableSizeBody.width + "px";
            this._elementBody.style.height = availableSizeBody.height + "px";
            this._elementHeadWrap.style.width = contentSize.width - frozenWidth + "px";
            this._elementHeadWrap.style.height = availableSizeHead.height - 1 + "px"; // line 표시를 위해 1px 빼줌
            this._elementHeadWrap.style.left = frozenWidth + "px";
            this._elementHeadFrozen.style.width = frozenWidth + "px";
            this._elementHeadFrozen.style.height = availableSizeHead.height - 1 + "px"; // line 표시를 위해 1px 빼줌

            if (this._settings.showCalculatedColumnStyle) {
                this._elementHeadCalculatedColumn.style.width = Viewer.SHOW_CALCULATED_COLUMN_WIDTH + "px";
                this._elementHeadCalculatedColumn.style.height = availableSizeHead.height - 1 + "px";
                this._elementBodyCalculatedColumn.style.width = Viewer.SHOW_CALCULATED_COLUMN_WIDTH + "px";
                this._elementBodyCalculatedColumn.style.height = availableSizeHead.height - 1 + "px";
            }

            this._elementBodyWrap.style.width = contentSize.width - frozenWidth + "px";
            this._elementBodyWrap.style.height = contentSize.height + "px";
            this._elementBodyWrap.style.left = frozenWidth + "px";
            this._elementBodyFrozen.style.width = frozenWidth + "px";
            this._elementBodyFrozen.style.height = contentSize.height + "px";
            this._scrollTopMax = contentSize.height - this._elementBody.clientHeight;
            this._scrollLeftMax = contentSize.width - this._elementBody.clientWidth;
            this._scrollLeft = 0;
            this._scrollTop = 0;
            this._elementBody.scrollLeft = 0;
            this._elementBody.scrollTop = 0;
            this._elementHead.scrollLeft = this._scrollLeft;
            this._elementHeadFrozen.style.left = this._scrollLeft + "px";
            this._elementBodyFrozen.style.left = this._scrollLeft + "px";

            if (isSetRemark) {
                // this._elementAnnotation.style.width = Math.min(availableSizeHead.width, contentSize.width) + "px";
                this._elementAnnotation.style.width = availableSizeHead.width + "px";
                if (!isSetTopRemark) {
                    this._elementAnnotation.style.top = Math.min(this._element.clientHeight - remarkHeight, availableSizeHead.height + contentSize.height) + 'px';
                }
            }

            this._itemsRange.top = -1;
            this._itemsRange.bottom = -1;
            this._itemsRange.left = -1;
            this._itemsRange.right = -1;

            if (Viewer.DATA_COL_MODE.TOP === this._settings.dataColumnMode) {
                this.renderDataToVertical(true);
            } else {
                this.renderDataToHorizontal(true);
            }
        }; // func - arrange

        /**
         * 그리드 Rendering 함수
         * > 데이터 표시를 아래 방향으로 함
         * @param isForceRender true 일 경우 강제로 새로고침
         */
        Viewer.prototype.renderDataToHorizontal = function (isForceRender) {

            let _this = this;
            // #20161230-01 : 값 필드 표시 방향 선택 기능 - Start
            let isShowDataKey = this._settings.body.showAxisZ ? 1 : 0;
            // #20161230-01 : 값 필드 표시 방향 선택 기능 - End
            let html = [];
            let leafColWidth = this._leafColumnWidth; // 20180807 : Koo : Resize Column - S
            let leafFrozenColWidth = this._leafFrozenColumnWidth;
            let cellWidth = this._settings.cellWidth;
            let cellHeight = this._settings.cellHeight;
            let xPropMax = this._settings.xProperties.length;
            let yPropMax = this._settings.yProperties.length;
            let zPropMax = this._settings.zProperties.length;
            let cellHeightZ = cellHeight * zPropMax;
            let frozenCellWidth = this._settings.leftAxisWidth ? this._settings.leftAxisWidth : this._settings.cellWidth;
            let calculatedColumnWidth = this._settings.showCalculatedColumnStyle ? Viewer.SHOW_CALCULATED_COLUMN_WIDTH : 0;
            // xProp의 이름에 대한 cnt, 원본보기일때에는 title (COLUMNS)을 표시하지않으므로 0으로 설정
            const xPropTitleCnt = this._isPivot ? 1 : 0;
            let frozenHeightCnt = xPropTitleCnt + xPropMax; // #20161230-01 : 값 필드 표시 방향 선택 기능
            let frozenWidth = frozenCellWidth * (yPropMax + isShowDataKey);
            // let frozenHeight = cellHeight * frozenHeightCnt;

            // 전체 컨텐츠 너비 설정 - Start
            const widthKeys = Object.keys(this._leafColumnWidth);
            if (0 < widthKeys.length) {
                let contentSizeWidth = widthKeys.reduce((acc, item) => acc + this._leafColumnWidth[item], 0);
                // let currentGridWidth = this._elementBody.style.width.replace(/px/gi, '') * 1 - frozenWidth;
                // if (this.IS_FILL_WIDTH && contentSizeWidth < currentGridWidth) {
                //     let cellDiffWidth = (currentGridWidth - contentSizeWidth) / widthKeys.length;
                //     widthKeys.forEach(item => this._leafColumnWidth[item] = this._leafColumnWidth[item] + cellDiffWidth);
                // } else {
                this._elementHeadWrap.style.width = contentSizeWidth + "px";
                this._elementBodyWrap.style.width = contentSizeWidth + "px";
                // }
            } else if (this.IS_FILL_WIDTH) {
                // this._leafColumnWidth = {}; // 초기화
                let cnt = this._xItems.length;
                0 === cnt && (cnt = 1);
                const contentWidth = this._elementBody.style.width.replace(/px/gi, '') * 1 - frozenWidth - calculatedColumnWidth;
                if (contentWidth > cnt * cellWidth) {
                    cellWidth = contentWidth / cnt;
                    this._elementHeadWrap.style.width = contentWidth + "px";
                    this._elementBodyWrap.style.width = contentWidth + "px";
                    this._elementAnnotation && (this._elementAnnotation.style.width = this._elementBody.style.width);
                }
            }
            // 전체 컨텐츠 너비 설정 - End

            let range = {};
            range.top = Math.floor(this._scrollTop / cellHeightZ);
            range.bottom = Math.min(this._yItems.length - 1, range.top + Math.ceil((this._elementBody.clientHeight + (this._scrollTop - range.top * cellHeightZ)) / cellHeightZ) - 1);
            // 20180807 : Koo : Resize Column - S
            // range.left = Math.floor(this._scrollLeft / cellWidth);
            {
                range.left = 0;
                let leftPos = 0;
                for (let idx = 0, nMax = this._xItems.length; idx < nMax; idx++) {
                    let xItem = this._xItems[idx];
                    let xPropLeafColName = this._settings.xProperties.reduce((acc, prop) => {
                        let xVal = xItem[prop.name];
                        (xVal) && (acc = acc + ('' === acc ? xVal : '||' + xVal));
                        return acc;
                    }, '');

                    leftPos = leftPos + (Object.keys(leafColWidth).reduce((acc, currVal) => {
                        if (currVal && -1 < currVal.indexOf(xPropLeafColName)) {
                            acc = acc + leafColWidth[currVal];
                        }
                        return acc;
                    }, 0));

                    if (this._scrollLeft < leftPos) {
                        range.left = (0 > idx - 1) ? 0 : idx - 1;
                        break;
                    }
                }
            }
            // 20180807 : Koo : Resize Column - E
            range.right = Math.min(this._xItems.length - 1, range.left + Math.ceil((this._elementBody.clientWidth - frozenWidth + (this._scrollLeft - range.left * cellWidth)) / cellWidth) - 1);
            if (!isForceRender && this._isPivot && range.top === this._itemsRange.top && range.bottom === this._itemsRange.bottom && range.left === this._itemsRange.left && range.right === this._itemsRange.right) {
                let el = this._elementHeadWrap.querySelector("." + pivotStyle.cssClass.headRow + ":first-child ." + pivotStyle.cssClass.bodyCell + ":first-child");
                if (el) {
                    el.style.left = this._scrollLeft + "px";
                }
                return;
            }
            this._itemsRange.top = range.top;
            this._itemsRange.bottom = range.bottom;
            this._itemsRange.left = range.left;
            this._itemsRange.right = range.right;
            let rowAttributes = void 0;
            let rowStyles = void 0;
            let columnAttributes = void 0;
            let columnStyles = void 0;

            html.length = 0;
            // x축 - y축이 중첩되는 고정 영역 - Start
            {
                for (let xpi = 0; xpi < frozenHeightCnt; xpi++) {
                    // #20161230-01 : 값 필드 표시 방향 선택 기능
                    rowAttributes = {};
                    rowAttributes["class"] = pivotStyle.cssClass.headRow;
                    rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.header.font);
                    rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.header.align, 'LEFT');
                    rowStyles = {};
                    rowStyles["width"] = "100%";
                    rowStyles["height"] = cellHeight + "px";
                    rowStyles["top"] = xpi * cellHeight + "px";
                    html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

                    let frozenColumnStyleLeft = 0;
                    for (let ypi = 0, ypiMax = this._settings.yProperties.length + isShowDataKey; ypi < ypiMax; ypi++) {
                        columnAttributes = {};
                        columnAttributes["class"] = pivotStyle.cssClass.headCell;
                        columnStyles = {};

                        let leafFrozenColWidthKey = "";
                        if (ypi > this._settings.yProperties.length - 1) {
                            // Aggregation Column 등을 사용하는 경우
                            leafFrozenColWidthKey = Viewer.FROZEN_COLUMN_ADDITIONAL_KEY + ypi;
                        } else {
                            leafFrozenColWidthKey = this._settings.yProperties[ypi].name;
                        }
                        columnAttributes["title"] = leafFrozenColWidthKey;

                        leafFrozenColWidth[leafFrozenColWidthKey] || (leafFrozenColWidth[leafFrozenColWidthKey] = frozenCellWidth);
                        let frozenColWidth = leafFrozenColWidth[leafFrozenColWidthKey];
                        columnStyles["width"] = frozenColWidth + "px";
                        columnStyles["height"] = cellHeight + "px";
                        columnStyles["left"] = frozenColumnStyleLeft + "px";
                        columnStyles["color"] = this._settings.header.font.color;
                        columnStyles["background-color"] = this._settings.header.backgroundColor;

                        // #20161230-01 : 값 필드 표시 방향 선택 기능
                        // if (ypi < yPropMax && 0 === xpi ) {	// #20161230-01 : 값 필드 표시 방향 선택 기능
                        columnStyles["top"] = "0px";
                        // columnStyles["height"] = ( cellHeight * xPropMax ) + "px";
                        html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");

                        if (ypi < yPropMax && xpi === xPropMax) {
                            html.push(this._settings.yProperties[ypi].name);
                        }

                        columnAttributes = {};
                        columnAttributes["class"] = pivotStyle.cssClass.resizeHandle;
                        columnAttributes["draggable"] = "true";
                        columnStyles = {};
                        html.push("<div " + common.attributesString(columnAttributes, columnStyles) + "></div>");

                        html.push("</div>");

                        frozenColumnStyleLeft += frozenColWidth;
                    }
                    html.push("</div>");
                }
                this._elementHeadFrozen.innerHTML = html.join("");
            }
            // x축 - y축이 중첩되는 고정 영역 - End

            if (this._settings.showCalculatedColumnStyle) {
                // 연산 열 헤더 추가
                html.length = 0;
                {
                    for (let xpi = 0; xpi < frozenHeightCnt; xpi++) {
                        let showLabel = (xpi === xPropMax) ? true : false;
                        this.appendHeadCalculatedColumnToHtml(xpi, cellHeight, showLabel, html);
                    }
                    this._elementHeadCalculatedColumn.innerHTML = html.join("");
                }
            }

            html.length = 0;
            // Head Wrap : x축 타이틀 표시 - Start
            {
                rowAttributes = {};
                rowAttributes["class"] = pivotStyle.cssClass.headRow;
                rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.header.font);
                rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.header.align, 'LEFT');
                rowStyles = {};
                rowStyles["width"] = "100%";
                rowStyles["height"] = cellHeight + "px";
                rowStyles["top"] = "0px;";
                html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");
                columnAttributes = {};
                columnAttributes["class"] = pivotStyle.cssClass.headCell;
                columnAttributes["title"] = this._settings.xProperties.map(function (property) {
                    return property.name;
                }).join(" / ");
                columnStyles = {};
                columnStyles["height"] = cellHeight + "px";
                columnStyles["left"] = this._elementBody.scrollLeft + "px";
                columnStyles["color"] = this._settings.header.font.color;
                columnStyles["background-color"] = this._settings.header.backgroundColor;
                // 20180807 : Koo : Resize Column - S
                // columnStyles["width"] = Math.min(cellWidth * this._xItems.length, this._elementHead.offsetWidth - frozenWidth) + "px";
                let totalWidth = 0;
                this._xItems.forEach(item => {
                    let leafColumnWidthName = this._settings.xProperties.reduce((acc, currProp) => {
                        acc = ('' === acc) ? acc : acc + "||";
                        return acc + item[currProp.name];
                    }, '');
                    leafColWidth[leafColumnWidthName] || (leafColWidth[leafColumnWidthName] = cellWidth);
                    totalWidth = totalWidth + leafColWidth[leafColumnWidthName];
                });
                columnStyles["width"] = Math.min(totalWidth, this._elementHead.offsetWidth - frozenWidth) + "px";
                // 20180807 : Koo : Resize Column - E

                // 원본일때에는 COLUMNS를 표현 x
                if (this._isPivot) {
                    html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                    html.push(columnAttributes["title"]);
                    html.push("</div>");
                    html.push("</div>");
                }
            }
            // Head Wrap : x축 타이틀 표시 - End

            // Head Wrap : x축 영역 표시 - Start
            {
                for (let xpi = 0; xpi < xPropMax; xpi++) {
                    rowAttributes = {};
                    rowAttributes["class"] = pivotStyle.cssClass.headRow;
                    rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.header.font);
                    rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.header.align, 'LEFT');
                    rowStyles = {};
                    rowStyles["width"] = "100%";
                    rowStyles["height"] = cellHeight + "px";
                    rowStyles["top"] = (xpi + (this._isPivot ? 1 : 0)) * cellHeight + "px;"; // 원본일때에는 COLUMNS를 표현 x
                    html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

                    let prevValue = '';
                    for (let xii = range.left; xii <= range.right; xii++) {
                        let xItem = this._xItems[xii];
                        let propertyName = this._settings.xProperties[xpi].name;
                        let value = common.format(xItem[propertyName], this._settings.xProperties[xpi].digits);
                        let checkVal = '';
                        for (let checkIdx = 0; checkIdx <= xpi; checkIdx++) {
                            checkVal = checkVal + common.format(xItem[this._settings.xProperties[checkIdx].name], this._settings.xProperties[checkIdx].digits);
                        }
                        if (prevValue === checkVal) {
                            continue;
                        }

                        // 프로퍼티 이름 갱신 ( 중복된 프러퍼티를 생성하지 않기 위해 )
                        prevValue = checkVal;

                        columnAttributes = {};

                        // Add Property by eltriny
                        columnAttributes["class"] = pivotStyle.cssClass.headCell + ' ' + pivotStyle.cssClass.axisX;
                        columnAttributes["title"] = getDisplayValue(value);
                        columnAttributes["data-key"] = propertyName;
                        // columnAttributes[ "data-colIdx" ] = ( xii - range.left );		// colIdx 가 무조건 0부터 시작
                        columnAttributes["data-colIdx"] = xii; // colIdx 가 인덱스 번호대로 시작

                        // #20161229-01 : 축 선택 시 상위 축 정보 포함 제공 - Start
                        let arrKeys = [];
                        let arrVals = [];
                        for (let idx = 0; idx < xpi; idx++) {
                            arrKeys.push(this._settings.xProperties[idx].name);
                            arrVals.push(xItem[this._settings.xProperties[idx].name]);
                        } // end for - xProperties
                        if (0 < arrKeys.length) {
                            columnAttributes["data-parent-keys"] = arrKeys.join("||");
                            columnAttributes["data-parent-vals"] = arrVals.join("||");
                        }
                        // #20161229-01 : 축 선택 시 상위 축 정보 포함 제공 - End

                        columnStyles = {};
                        columnStyles["height"] = cellHeight + "px";
                        columnStyles["color"] = this._settings.header.font.color;
                        columnStyles["background-color"] = this._settings.header.backgroundColor;
                        // 20180807 : Koo : Resize Column - S
                        // columnStyles["left"] = (xii * cellWidth) + "px";
                        // columnStyles["width"] = (colspan * cellWidth) + "px";
                        let leftPos = 0;
                        let currLeafColName = (columnAttributes["data-parent-vals"]) ? columnAttributes["data-parent-vals"] + "||" + xItem[propertyName] : xItem[propertyName];
                        let xPrevItemList = this._xItems.slice(0, xii);
                        xPrevItemList
                            .map(xPrevItem => {
                                return this._settings.xProperties.slice(0, xpi + 1).map(xProp => xPrevItem[xProp.name]).join('||');
                            })
                            .reduce((acc, currVal) => {
                                (-1 === acc.indexOf(currVal)) && (acc.push(currVal));
                                return acc;
                            }, [])
                            .filter(item => item !== currLeafColName)
                            .forEach(leafColName => {
                                leftPos = leftPos + Object.keys(leafColWidth).reduce((acc, currVal) => {
                                    if (currVal && (currVal === leafColName || -1 < currVal.indexOf(leafColName + '||'))) {
                                        acc = acc + leafColWidth[currVal];
                                    }
                                    return acc;
                                }, 0);
                            });
                        columnStyles["left"] = leftPos + "px";

                        columnStyles["width"] = Object.keys(leafColWidth).reduce((acc, currVal) => {
                            if (currVal && (currVal === currLeafColName || -1 < currVal.indexOf(currLeafColName + '||'))) {
                                acc = acc + leafColWidth[currVal];
                            }
                            return acc;
                        }, 0) + "px";
                        // 20180807 : Koo : Resize Column - E
                        html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                        html.push(getDisplayValue(value));

                        // 20210305 : Harry : Sort Column - S
                        if ( !this._isPivot ) {
                            columnAttributes["class"] = pivotStyle.cssClass.axisXSort;

                            let arrKeys = [];
                            let arrVals = [];

                            for (let idx = 0; idx < xpi; idx++) {
                                arrKeys.push(this._settings.xProperties[idx].name);
                                arrVals.push(xItem[this._settings.xProperties[idx].name]);
                            } // end for - xProperties

                            arrKeys.push(columnAttributes['data-key']);
                            arrVals.push(columnAttributes['title']);

                            // parent key, value setting
                            if (0 < arrKeys.length) {
                                columnAttributes["data-parent-keys"] = arrKeys.join("||");
                                columnAttributes["data-parent-vals"] = arrVals.join("||");
                            }

                            // sort type setting
                            if (this._settings.sortColumnParentVals + common.__fieldSeparator + this._settings.sortColumnMeasure
                                === columnAttributes['data-parent-vals'].split('||').join(common.__fieldSeparator) + common.__fieldSeparator + this._settings.zProperties[0].name) {
                                columnAttributes["data-sort"] = this._settings.sortType;
                            } else {
                                columnAttributes["data-sort"] = Viewer.SORT_COL_MODE.NONE;
                            }

                            columnStyles = {};
                            html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                            html.push(columnAttributes["data-sort"] === Viewer.SORT_COL_MODE.NONE ? '-' : ( columnAttributes["data-sort"] === Viewer.SORT_COL_MODE.ASC ? '▲' : '▼'));
                            html.push("</div>");
                        }
                        // 20210305 : Harry : Sort Column - E

                        // 20180807 : Koo : Resize Column - S
                        if (xpi === xPropMax - 1) {
                            columnAttributes = {};
                            columnAttributes["class"] = pivotStyle.cssClass.resizeHandle;
                            columnAttributes["draggable"] = "true";
                            columnStyles = {};
                            html.push("<div " + common.attributesString(columnAttributes, columnStyles) + "></div>");
                        }
                        // 20180807 : Koo : Resize Column - E
                        html.push("</div>");

                    }	// end for - xii
                    html.push("</div>");
                }	// end for - xpi
                this._elementHeadWrap.innerHTML = html.join("");
            }
            // Head Wrap : x축 영역 표시 - End

            this.arrangeFrozenColumnRelatedElements();

            // body-frozen : y축 영역 표시 - Start
            html.length = 0;
            let calculatedColumns = [];
            {
                let predicate = function (a, b, ypi) {
                    for (let i = ypi; i >= 0; i--) {
                        let propertyName = _this._settings.yProperties[i].name;
                        if (a[propertyName] !== b[propertyName]) {
                            return false;
                        }
                    }
                    return true;
                };
                for (let yii = range.top; yii <= range.bottom; yii++) {
                    for (let zpi = 0; zpi < zPropMax; zpi++) {
                        let index = yii * zPropMax + zpi;
                        // let rowIdx 	= ( zPropMax * ( yii - range.top ) ) + zpi;	// rowIdx 가 무조건 0부터 시작
                        let rowIdx = zPropMax * yii + zpi; // rowIdx 가 인덱스 번호대로 생성
                        rowAttributes = {};
                        rowAttributes["class"] = pivotStyle.cssClass.headRow;

                        let yItem = this._yItems[yii];
                        let subCalcKey = getSubCalcKey(yItem);
                        if (this._settings.calcCellStyle && undefined !== getCalcKey(yItem)) {
                            rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.calcCellStyle.font);
                            rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.calcCellStyle.align, 'CENTER');
                        } else if (this._settings.subCalcCellStyle && undefined !== subCalcKey) {
                            const subCalcCellStyle = this._settings.subCalcCellStyle[subCalcKey.toLowerCase()];
                            rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], subCalcCellStyle.font);
                            rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], subCalcCellStyle.align, 'CENTER');
                        } else {
                            rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.header.font);
                            rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.header.align, 'LEFT');
                        }

                        rowStyles = {};
                        rowStyles["width"] = "100%";
                        rowStyles["height"] = cellHeight + "px";
                        rowStyles["top"] = index * cellHeight + "px;";
                        html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");
                        let frozenColumnStylesLeft = 0;
                        if (zpi === 0) {
                            let yItem = this._yItems[yii];
                            for (let ypi = 0; ypi < this._settings.yProperties.length; ypi++) {
                                let propertyName = this._settings.yProperties[ypi].name;
                                if (undefined === yItem[propertyName]) {
                                    // 값이 없을 때는 셀을 그리지 않는다. ( subtotal 의 하위 셀 경우 )
                                    continue;
                                }
                                let value = common.format(yItem[propertyName], this._settings.yProperties[ypi].digits);
                                let rowspan = 1;
                                // Add by burgerboy2
                                // #20160220-01 : 스크롤시 디자인 깨지는 현상 수정
                                if (index > range.top && this._yItems[yii - 1] && predicate(this._yItems[yii - 1], yItem, ypi) && html.indexOf(value) > -1) {
                                    frozenColumnStylesLeft += leafFrozenColWidth[propertyName];
                                    continue;
                                }
                                for (let i = yii + 1; i < this._yItems.length; i++) {
                                    if (predicate(this._yItems[i], yItem, ypi)) {
                                        rowspan++;
                                    } else {
                                        break;
                                    }
                                }
                                columnAttributes = {};
                                // Add Property by eltriny
                                columnAttributes["class"] = pivotStyle.cssClass.headCell + ' ' + pivotStyle.cssClass.axisY;
                                columnAttributes["title"] = getDisplayValue(value);
                                columnAttributes["data-key"] = propertyName;

                                if (1 === zPropMax) {
                                    columnAttributes["data-rowIdx"] = rowIdx;
                                }

                                // #20161229-01 : 축 선택 시 상위 축 정보 포함 제공 - Start
                                let arrKeys = [];
                                let arrVals = [];
                                for (let idx = 0; idx < ypi; idx++) {
                                    arrKeys.push(this._settings.yProperties[idx].name);
                                    arrVals.push(yItem[this._settings.yProperties[idx].name]);
                                } 	// end for - yProperties
                                if (0 < arrKeys.length) {
                                    columnAttributes["data-parent-keys"] = arrKeys.join("||");
                                    columnAttributes["data-parent-vals"] = arrVals.join("||");
                                }
                                // #20161229-01 : 축 선택 시 상위 축 정보 포함 제공 - End

                                columnStyles = {};
                                columnStyles["left"] = frozenColumnStylesLeft + "px";
                                columnStyles["width"] = leafFrozenColWidth[propertyName] + "px";
                                let tempCellHeight = rowspan * this._settings.zProperties.length * cellHeight;
                                columnStyles["height"] = tempCellHeight + "px";
                                // columnStyles["line-height"] = this.getLineHeightForValign( this._settings.header.align, tempCellHeight, rowspan ) + "px !important";
                                columnStyles["z-index"] = range.bottom - yii; // 영역 클릭 이슈 해결 위해 추가

                                if ('TOTAL' === value) {
                                    value = !this._settings.calcCellStyle.label || '' === this._settings.calcCellStyle.label
                                        ? pivotStyle.summaryLabel[this._settings.calcCellStyle.aggregationType] : this._settings.calcCellStyle.label;
                                    columnStyles["width"] = (frozenCellWidth * this._settings.yProperties.length) + "px";
                                    columnStyles["color"] = this._settings.calcCellStyle.font.color;
                                    columnStyles["background-color"] = this._settings.calcCellStyle.backgroundColor;
                                } else if ('SUB-TOTAL' === value) {
                                    columnStyles["width"] = ((yPropMax - ypi) * frozenCellWidth) + "px";
                                    const subTotalPropName = this._settings.yProperties[ypi - 1].name;
                                    const subCellStyle = this._settings.subCalcCellStyle[subTotalPropName.toLowerCase()];
                                    // value = common.capitalize(subCellStyle.aggregationType) + '(' + yItem[subTotalPropName] + ')';
                                    value = !subCellStyle.label || '' === subCellStyle.label
                                        ? pivotStyle.subSummaryLabel[subCellStyle.aggregationType] : subCellStyle.label;
                                    columnStyles["color"] = subCellStyle.font.color;
                                    columnStyles["background-color"] = subCellStyle.backgroundColor;
                                } else {
                                    columnStyles["width"] = frozenCellWidth + "px";
                                    columnStyles["color"] = this._settings.header.font.color;
                                    columnStyles["background-color"] = this._settings.header.backgroundColor;
                                }

                                html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                                html.push(getDisplayValue(value));
                                html.push("</div>");

                                frozenColumnStylesLeft += leafFrozenColWidth[propertyName];

                                if (this._settings.showCalculatedColumnStyle && (ypi == this._settings.yProperties.length - 1) && value) {
                                    calculatedColumns.push({
                                        summaryMapKey: arrVals.concat([value]).join("||"),
                                        top: index * cellHeight
                                    });
                                }
                            }
                        } // end if - zpi is zero

                        // z-axis 추가
                        if (this._settings.body.showAxisZ) {
                            // #20161230-01 : 값 필드 표시 방향 선택 기능
                            columnAttributes = {};
                            columnAttributes["class"] = pivotStyle.cssClass.headCell;
                            columnAttributes["title"] = this._settings.zProperties[zpi].name;
                            columnAttributes["data-key"] = 'dataAxis';
                            columnAttributes["data-rowIdx"] = rowIdx;
                            columnStyles = {};
                            // columnStyles["left"] = frozenColumnStylesLeft + "px";
                            // columnStyles["width"] = leafFrozenColWidth[Viewer.FROZEN_COLUMN_ADDITIONAL_KEY + this._settings.yProperties.length] + "px";
                            columnStyles["left"] = (yPropMax * frozenCellWidth) + "px";
                            columnStyles["width"] = frozenCellWidth + "px";
                            columnStyles["height"] = cellHeight + "px";
                            // columnStyles["line-height"] = this.getLineHeightForValign( this._settings.header.align, cellHeight, 1 ) + "px !important";
                            columnStyles["color"] = this._settings.header.font.color;
                            columnStyles["background-color"] = this._settings.header.backgroundColor;
                            html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                            html.push(this._settings.zProperties[zpi].name);
                            html.push("</div>");
                        } // end if - data key display mode : left

                        html.push("</div>");
                    } // for - zpi

                    // 요약 정보 타이틀 설정 - Start
                    if (this._settings.totalValueStyle && yii === this._yItems.length - 1) {
                        for (let _zpi = 0; _zpi < zPropMax; _zpi++) {
                            rowAttributes = {};
                            rowAttributes["class"] = pivotStyle.cssClass.headRow;
                            rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.totalValueStyle.font);
                            rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.totalValueStyle.align, 'LEFT');
                            rowStyles = {};
                            rowStyles["width"] = "100%";
                            rowStyles["height"] = cellHeight + "px";
                            rowStyles["top"] = this._yItems.length * zPropMax * cellHeight + _zpi * cellHeight + "px;";
                            html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

                            if (0 === _zpi && 0 < this._settings.yProperties.length) {
                                columnAttributes = {};
                                columnAttributes["class"] = pivotStyle.cssClass.headCell;
                                columnStyles = {};
                                columnStyles["left"] = 0 + "px";
                                columnStyles["width"] = frozenCellWidth * this._settings.yProperties.length + "px";
                                let _tempCellHeight = cellHeight * zPropMax;
                                columnStyles["height"] = _tempCellHeight + "px";
                                // columnStyles["line-height"] = this.getLineHeightForValign( this._settings.totalValueStyle.align, tempCellHeight, zPropMax ) + "px !important";
                                columnStyles["color"] = this._settings.totalValueStyle.font.color;
                                columnStyles["background-color"] = this._settings.totalValueStyle.backgroundColor;

                                html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                                html.push(!this._settings.totalValueStyle.label || '' === this._settings.totalValueStyle.label ? pivotStyle.summaryLabel[this._settings.totalValueStyle.aggregationType] : this._settings.totalValueStyle.label);
                                html.push("</div>");
                            }

                            // z-axis 추가
                            if (this._settings.body.showAxisZ) {
                                columnAttributes = {};
                                columnAttributes["class"] = pivotStyle.cssClass.headCell;
                                columnAttributes["title"] = this._settings.zProperties[_zpi].name;
                                columnStyles = {};
                                columnStyles["width"] = frozenCellWidth + "px";
                                columnStyles["height"] = cellHeight + "px";
                                columnStyles["left"] = this._settings.yProperties.length * frozenCellWidth + "px";

                                columnStyles["color"] = this._settings.totalValueStyle.font.color;
                                columnStyles["background-color"] = this._settings.totalValueStyle.backgroundColor;

                                html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                                html.push(this._settings.zProperties[_zpi].name);
                                html.push("</div>");
                            } // end if - data key display mode : left

                            html.push("</div>");
                        } // end for - zpi
                    }
                    // 요약 정보 타이틀 설정 - End
                } // for - yii
                this._elementBodyFrozen.innerHTML = html.join("");
            }
            // body-frozen : y축 영역 표시 - End

            // 연산 열 body
            if (this._settings.showCalculatedColumnStyle) {
                // 연산 열 데이터 표시
                html.length = 0;
                if (this.summaryMap[Viewer.EMPTY_Y_AXIS_DIMENSION_KEY]) {
                    // Y축 차원이 존재하지 않는 경우
                    this.appendBodyCalculatedColumnToHtml(Viewer.EMPTY_Y_AXIS_DIMENSION_KEY, 0, cellHeight, html);
                } else {
                    for (let i = 0; i < calculatedColumns.length; i++) {
                        this.appendBodyCalculatedColumnToHtml(calculatedColumns[i].summaryMapKey, calculatedColumns[i].top, cellHeight, html);
                    }
                }

                this._elementBodyCalculatedColumn.innerHTML = html.join("");
            }

            // body-wrap : 데이터 영역 마크업 생성 - Start
            html.length = 0;
            {
                // Data Cell 단계 색상 표시 여부
                let showColorStep = this._settings.body.color && this._settings.body.color.showColorStep ? this._settings.body.color.showColorStep : null;
                let items = this._items;
                let stepRangeColors = this._settings.body.color && this._settings.body.color.stepRangeColors ? this._settings.body.color.stepRangeColors : null;
                for (let yii = range.top; yii <= range.bottom; yii++) {
                    let yItem = this._yItems[yii];
                    let subCalcKey = getSubCalcKey(yItem);
                    let isCalcRow = (this._settings.calcCellStyle && undefined !== getCalcKey(yItem));

                    for (let zpi = 0; zpi < zPropMax; zpi++) {
                        let index = (yii * zPropMax + zpi);
                        // let rowIdx 	= ( zPropMax * ( yii - range.top ) ) + zpi;	// rowIdx 가 무조건 0부터 시작
                        let rowIdx = (zPropMax * yii) + zpi;						// rowIdx 가 인덱스 번호대로 생성
                        let zpiProp = this._settings.zProperties[zpi];
                        let objCriteria = null;
                        if (showColorStep) {
                            objCriteria = this._dataCriteria[zpiProp.name];
                        }
                        rowAttributes = {};
                        rowAttributes["data-rowIdx"] = rowIdx;
                        rowAttributes["class"] = pivotStyle.cssClass.bodyRow + (index % 2 === 0 ? " odd" : "");
                        if (isCalcRow) {
                            rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.calcCellStyle.font);
                            rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.calcCellStyle.align);
                        } else if (undefined !== subCalcKey) {
                            const subCalcCellStyle = this._settings.subCalcCellStyle[subCalcKey.toLowerCase()];
                            rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], subCalcCellStyle.font);
                            rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], subCalcCellStyle.align);
                        } else {
                            rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.body.font);
                            rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.body.align);
                        }

                        rowStyles = {};
                        rowStyles["width"] = "100%";
                        rowStyles["height"] = cellHeight + "px";
                        rowStyles["top"] = index * cellHeight + "px;";
                        html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

                        for (let xii = range.left; xii <= range.right; xii++) {

                            let xItem = this._xItems[xii];
                            let context = this._itemsContext;
                            let contains = false;

                            columnAttributes = {};
                            columnAttributes["class"] = pivotStyle.cssClass.bodyCell;
                            columnAttributes["data-rowIdx"] = rowIdx;
                            // columnAttributes[ "data-colIdx" ] = ( xii - range.left );		// colIdx 가 무조건 0부터 시작
                            columnAttributes["data-colIdx"] = xii; // colIdx 가 인덱스 번호대로 시작

                            columnStyles = {};
                            columnStyles["height"] = cellHeight + "px";
                            // 20180807 : Koo : Resize Column - S
                            // columnStyles["left"] = (xii * cellWidth) + "px";
                            // columnStyles["width"] = cellWidth + "px";
                            let leftPos = 0;
                            for (let idx = 0; idx < xii; idx++) {
                                let tempItem = this._xItems[idx];
                                let leafColName = this._settings.xProperties.map(item => tempItem[item.name]).join('||');
                                leftPos = leftPos + leafColWidth[leafColName];
                            }
                            columnStyles["left"] = leftPos + "px";

                            let leafColName = '';
                            this._settings.xProperties.forEach(function (prop) {
                                let xVal = xItem[prop.name];
                                if (xVal) {
                                    leafColName = leafColName + ('' === leafColName ? xVal : '||' + xVal);
                                }
                            });
                            columnStyles["width"] = leafColWidth[leafColName] + "px";
                            // 20180807 : Koo : Resize Column - E

                            let arrParentKey = []; // 20180807 : Koo : Resize Column
                            let arrParentVal = []; // 20180807 : Koo : Resize Column
                            for (let i = 0; i < this._settings.xProperties.length; i++) {
                                const xPropKey = this._settings.xProperties[i].name;
                                context = context[xItem[xPropKey]];
                                arrParentKey.push(xPropKey); // 20180807 : Koo : Resize Column
                                arrParentVal.push(xItem[xPropKey]); // 20180807 : Koo : Resize Column
                            }
                            columnAttributes["data-parent-keys"] = arrParentKey.join('||'); // 20180807 : Koo : Resize Column
                            columnAttributes["data-parent-vals"] = arrParentVal.join('||'); // 20180807 : Koo : Resize Column
                            for (let i = 0; i < this._settings.yProperties.length; i++) {
                                context = context[yItem[this._settings.yProperties[i].name]];
                            }

                            try {
                                if (context) {
                                    let itemData = context.item[zpiProp.name];
                                    columnAttributes["data-key"] = zpiProp.name;
                                    columnAttributes["title"] = zpiProp.name + ":" + itemData;

                                    // #20161227-02 Cell Click Event 추가 : Cell Data 설정 - Start
                                    for (let key in context.item) {
                                        if (context.item.hasOwnProperty(key)) {
                                            const keyData = context.item[key];
                                            // 20171130 taeho - 피봇 / 원본 데이터형태 모두 지원하도록 변경
                                            // columnAttributes["data-item-" + key] = this._isPivot ? key + '―' + keyData : keyData;    // TODO : 확인 필요 -> Github 버전
                                            columnAttributes["data-item-" + key] = this._isPivot ? key + common.__fieldSeparator + keyData : keyData;
                                        }
                                    }
                                    // #20161227-02 Cell Click Event 추가 : Cell Data 설정 - End

                                    // Cell Index 추출 및 설정 - Start
                                    let nItemIdx = -1;
                                    for (let idx = 0, nMax = items.length; idx < nMax; idx++) {
                                        let objItem = items[idx];
                                        let isUnMatch = false;
                                        for (let key in context.item) {
                                            if (context.item.hasOwnProperty(key) && objItem[key] !== context.item[key]) {
                                                isUnMatch = true;
                                                break;
                                            }
                                        }	// end for - context.item
                                        if (!isUnMatch) {
                                            nItemIdx = idx;
                                            break;
                                        }	// end if - isUnMatch
                                    } // end for - items
                                    if (-1 < nItemIdx) {
                                        columnAttributes["data-idx"] = nItemIdx;
                                    }
                                    // Cell Index 추출 및 설정 - End

                                    if (isCalcRow) {
                                        if (this.isDefaultTextAlign(this._settings.calcCellStyle.align)) {
                                            columnAttributes["class"] += ' ' + pivotStyle.cssClass.txtRight
                                        }
                                        columnAttributes["class"] += ' ' + pivotStyle.cssClass.numeric;
                                        columnStyles["color"] = this._settings.calcCellStyle.font.color;
                                        columnStyles["background-color"] = this._settings.calcCellStyle.backgroundColor;
                                    } else if (undefined !== subCalcKey) {
                                        const subCalcCellStyle = this._settings.subCalcCellStyle[subCalcKey.toLowerCase()];
                                        if (this.isDefaultTextAlign(subCalcCellStyle.align)) {
                                            columnAttributes["class"] += ' ' + pivotStyle.cssClass.txtRight;
                                        }
                                        columnAttributes["class"] += ' ' + pivotStyle.cssClass.numeric;
                                        columnStyles["color"] = subCalcCellStyle.font.color;
                                        columnStyles["background-color"] = subCalcCellStyle.backgroundColor;
                                    } else if ('number' === typeof itemData) {
                                        columnAttributes["class"] += ' ' + pivotStyle.cssClass.numeric;
                                        // 단계별 색상 설정 추가 - Start
                                        if (showColorStep) {
                                            let strColor = objCriteria.getColor(itemData);
                                            let strTxtColor = objCriteria.getTextColor(itemData);
                                            strTxtColor && (columnStyles["color"] = strTxtColor);
                                            strColor && (columnStyles["background-color"] = strColor);

                                            // 사용자 색상 범위설정이 있을때
                                            if (stepRangeColors && stepRangeColors.length > 0) {

                                                // 색상타입이 글자일때
                                                if ('TEXT' === this._settings.body.color.colorTarget) {
                                                    strColor = '#ffffff';
                                                    strTxtColor = objCriteria.getUserRangeColor(itemData, stepRangeColors);

                                                    // 배경일때
                                                } else {
                                                    strColor = objCriteria.getUserRangeColor(itemData, stepRangeColors);
                                                    strTxtColor = '#ffffff';
                                                }

                                                // textColor가 있는경우 해당 textColor로 설정
                                                if (this._settings.body.color.stepTextColors && this._settings.body.color.stepTextColors.length > 0) {
                                                    strTxtColor = this._settings.body.color.stepTextColors;
                                                }

                                                strTxtColor && (columnStyles["color"] = strTxtColor);
                                                strColor && (columnStyles["background-color"] = strColor);
                                            }
                                        }
                                        // 단계별 색상 설정 추가 - End
                                    }
                                    // TODO 숫자가 아닌부분은 header영역 색상으로 설정
                                    // else {
                                    //     columnStyles["color"] = this._settings.header.font.color;
                                    //     columnStyles["background-color"] = this._settings.header.backgroundColor;
                                    // }

                                    html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                                    if (zpiProp.type && 'origin' === this._settings.format.type && !this._isPivot) {
                                        if (context.item.COLUMNS) {
                                            if (zpiProp.type[context.item.COLUMNS]) {
                                                html.push(common.numberFormat(itemData, this._settings.format, zpiProp.type[context.item.COLUMNS]));
                                            } else {
                                                html.push(common.numberFormat(itemData, this._settings.format));
                                            }
                                        } else {
                                            html.push(common.numberFormat(itemData, this._settings.format, zpiProp.type));
                                        }
                                    } else {
                                        html.push(common.numberFormat(itemData, this._settings.format));
                                    }
                                    html.push("</div>");
                                    contains = true;
                                } // end if - context is valid
                            } catch (e) {
                                console.error(e);
                            }
                            if (!contains) {
                                html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                                html.push("</div>");
                            }
                        } // for - xii

                        html.push("</div>");
                    } // end for - zpi

                    // 요약 정보 데이터 표시 설정 - Start
                    if (this._settings.totalValueStyle && yii === this._yItems.length - 1) {

                        for (let zpi3 = 0; zpi3 < zPropMax; zpi3++) {

                            let zpiProp = this._settings.zProperties[zpi3];

                            rowAttributes = {};
                            rowAttributes["class"] = pivotStyle.cssClass.bodyRow;
                            rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.totalValueStyle.font);
                            rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.totalValueStyle.align, 'RIGHT');
                            rowStyles = {};
                            rowStyles["width"] = "100%";
                            rowStyles["height"] = cellHeight + "px";
                            rowStyles["top"] = this._yItems.length * zPropMax * cellHeight + zpi3 * cellHeight + "px;";
                            html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

                            for (let xii = range.left; xii <= range.right; xii++) {
                                let xItem = this._xItems[xii];

                                // cell설정
                                columnAttributes = {};
                                columnAttributes["class"] = pivotStyle.cssClass.bodyCell;
                                columnStyles = {};
                                columnStyles["color"] = this._settings.totalValueStyle.font.color;
                                columnStyles["background-color"] = this._settings.totalValueStyle.backgroundColor;
                                columnStyles["height"] = cellHeight + "px";

                                // 20180807 : Koo : Resize Column - S
                                // columnStyles["left"] = (((zPropMax * xii) + zpi) * cellWidth) + "px";
                                // columnStyles["width"] = cellWidth + "px";
                                let leftPos = 0;
                                for (let idx6 = 0; idx6 < xii; idx6++) {
                                    let tempItem = this._xItems[idx6];
                                    let leafColName = this._settings.xProperties.map(function (item) {
                                        return tempItem[item.name];
                                    }).join('||');
                                    leftPos = leftPos + leafColWidth[leafColName];
                                }
                                columnStyles["left"] = leftPos + "px";

                                let leafColName = '';
                                this._settings.xProperties.forEach(function (prop) {
                                    let xVal = xItem[prop.name];
                                    if (xVal) {
                                        leafColName = leafColName + ('' === leafColName ? xVal : '||' + xVal);
                                    }
                                });

                                columnStyles["width"] = leafColWidth[leafColName] + "px";
                                // 20180807 : Koo : Resize Column - E

                                let summaryKey = '' === leafColName ? zpiProp.name : leafColName + '||' + zpiProp.name;
                                html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                                if (zpiProp.type && 'origin' === this._settings.format.type && !this._isPivot) {
                                    html.push(common.numberFormat(this.getSummaryValue(this.summaryMap[summaryKey], this._settings.totalValueStyle), this._settings.format, zpiProp.type));
                                } else {
                                    html.push(common.numberFormat(this.getSummaryValue(this.summaryMap[summaryKey], this._settings.totalValueStyle), this._settings.format));
                                }
                                html.push("</div>");
                            } // end for - xii

                            html.push("</div>");
                        } // end for - zpi
                    }
                    // 요약 정보 데이터 표시 설정 - End
                } // end for - yii

                this._elementBodyWrap.innerHTML = html.join("");
            }
            // body-wrap : 데이터 영역 마크업 생성 - End

            // add execute function - Start
            pivotStyle.setClickStyle.apply(this);
            // add execute function - End
        }; // func - renderDataToHorizontal

        /**
         * 그리드 Rendering 함수
         * > 데이터 표시를 아래 방향으로 함
         * @param isForceRender true 일 경우 강제로 새로고침
         */
        Viewer.prototype.renderDataToVertical = function (isForceRender) {

            let _this = this;

            let isShowDataKey = this._settings.body.showAxisZ ? 1 : 0;

            let html = [];
            let leafColWidth = this._leafColumnWidth; // 20180807 : Koo : Resize Column - S
            let leafFrozenColWidth = this._leafFrozenColumnWidth;
            let cellWidth = this._settings.cellWidth;
            let cellHeight = this._settings.cellHeight;
            let xPropMax = this._settings.xProperties.length;
            let yPropMax = this._settings.yProperties.length;
            let zPropMax = this._settings.zProperties.length;
            let cellWidthZ = cellWidth * zPropMax;
            let frozenCellWidth = this._settings.leftAxisWidth ? this._settings.leftAxisWidth : this._settings.cellWidth;
            let xPropTitleCnt = 0 < xPropMax ? 1 : 0; // #20181116-01 : 상단 공백 타이틀 제거
            let frozenHeightCnt = xPropMax + isShowDataKey; // #20181116-01 : 상단 공백 타이틀 제거
            frozenHeightCnt = frozenHeightCnt + (0 < xPropMax || 0 < yPropMax ? 1 : 0); // #20181116-01 : 상단 공백 타이틀 제거
            // let frozenHeightCnt = (1 + xPropMax + isShowDataKey);	// #20161230-01 : 값 필드 표시 방향 선택 기능
            let frozenWidth = frozenCellWidth * yPropMax;
            let calculatedColumnWidth = this._settings.showCalculatedColumnStyle ? Viewer.SHOW_CALCULATED_COLUMN_WIDTH : 0;

            // 전체 컨텐츠 너비 설정 - Start
            const widthKeys = Object.keys(this._leafColumnWidth);
            if (0 < widthKeys.length) {
                let contentSizeWidth = widthKeys.reduce((acc, item) => acc + this._leafColumnWidth[item], 0);
                // let currentGridWidth = (this._elementBody.style.width.replace(/px/gi, '') * 1) - frozenWidth;
                // if (this.IS_FILL_WIDTH && contentSizeWidth < currentGridWidth) {
                //     // let cellDiffWidth = (currentGridWidth - contentSizeWidth) / widthKeys.length;
                //     // widthKeys.forEach(item => this._leafColumnWidth[item] = this._leafColumnWidth[item] + cellDiffWidth);
                // } else {
                this._elementHeadWrap.style.width = contentSizeWidth + "px";
                this._elementBodyWrap.style.width = contentSizeWidth + "px";
                // }
            } else if (this.IS_FILL_WIDTH) {
                // this._leafColumnWidth = {}; // 초기화
                const cnt = this._xItems.length * zPropMax;
                const contentWidth = this._elementBody.style.width.replace(/px/gi, '') * 1 - frozenWidth - calculatedColumnWidth;
                if (contentWidth > cnt * cellWidth) {
                    cellWidth = contentWidth / cnt;
                    this._elementHeadWrap.style.width = contentWidth + "px";
                    this._elementBodyWrap.style.width = contentWidth + "px";
                    this._elementAnnotation && (this._elementAnnotation.style.width = this._elementBody.style.width);
                }
            }
            // 전체 컨텐츠 너비 설정 - End

            let range = {};
            range.top = Math.floor(this._scrollTop / cellHeight);
            range.bottom = Math.min(this._yItems.length - 1, range.top + Math.ceil((this._elementBody.clientHeight + (this._scrollTop - range.top * cellHeight)) / cellHeight) - 1);
            // 20180807 : Koo : Resize Column - S
            // range.left = Math.floor(this._scrollLeft / cellWidthZ);
            {
                range.left = 0;
                let leftPos = 0;
                for (let idx = 0, nMax = this._xItems.length; idx < nMax; idx++) {
                    let xItem = this._xItems[idx];
                    let xPropLeafColName = this._settings.xProperties.reduce((acc, prop) => {
                        let xVal = xItem[prop.name];
                        xVal && (acc = acc + ('' === acc ? xVal : '||' + xVal));
                        return acc;
                    }, '');

                    leftPos = leftPos + Object.keys(leafColWidth).reduce((acc, currVal) => {
                        if (currVal && -1 < currVal.indexOf(xPropLeafColName)) {
                            acc = acc + leafColWidth[currVal];
                        }
                        return acc;
                    }, 0);

                    if (this._scrollLeft < leftPos) {
                        range.left = 0 > idx - 1 ? 0 : idx - 1;
                        break;
                    }
                }
            }
            // 20180807 : Koo : Resize Column - E

            range.right = Math.min(this._xItems.length - 1, range.left + Math.ceil((this._elementBody.clientWidth - frozenWidth + (this._scrollLeft - range.left * cellWidthZ)) / cellWidthZ) - 1);
            if (!isForceRender && range.top === this._itemsRange.top && range.bottom === this._itemsRange.bottom && range.left === this._itemsRange.left && range.right === this._itemsRange.right) {
                let el = this._elementHeadWrap.querySelector("." + pivotStyle.cssClass.headRow + ":first-child ." + pivotStyle.cssClass.bodyCell + ":first-child");
                if (el) {
                    el.style.left = this._scrollLeft + "px";
                }
                return;
            }
            this._itemsRange.top = range.top;
            this._itemsRange.bottom = range.bottom;
            this._itemsRange.left = range.left;
            this._itemsRange.right = range.right;
            let rowAttributes = void 0;
            let rowStyles = void 0;
            let columnAttributes = void 0;
            let columnStyles = void 0;

            html.length = 0;
            // x축 - y축이 중첩되는 고정 영역 - Start
            {
                for (let xpi = 0; xpi < frozenHeightCnt; xpi++) {
                    // #20161230-01 : 값 필드 표시 방향 선택 기능
                    rowAttributes = {};
                    rowAttributes["class"] = pivotStyle.cssClass.headRow;
                    rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.header.font);
                    rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.header.align, 'LEFT');
                    rowStyles = {};
                    rowStyles["width"] = "100%";
                    rowStyles["height"] = cellHeight + "px";
                    rowStyles["top"] = xpi * cellHeight + "px";
                    html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

                    let frozenColumnStyleLeft = 0;
                    for (let ypi = 0; ypi < yPropMax; ypi++) {
                        columnAttributes = {};
                        columnAttributes["class"] = pivotStyle.cssClass.headCell;
                        columnAttributes["title"] = this._settings.yProperties[ypi].name;

                        columnStyles = {};
                        columnStyles["height"] = cellHeight + "px";
                        columnStyles["color"] = this._settings.header.font.color;
                        columnStyles["background-color"] = this._settings.header.backgroundColor;

                        leafFrozenColWidth[this._settings.yProperties[ypi].name] || (leafFrozenColWidth[this._settings.yProperties[ypi].name] = frozenCellWidth);
                        let frozenColWidth = leafFrozenColWidth[this._settings.yProperties[ypi].name];
                        columnStyles["width"] = frozenColWidth + "px";
                        columnStyles["left"] = frozenColumnStyleLeft + "px";

                        // #20161230-01 : 값 필드 표시 방향 선택 기능, #20181116-01 : 상단 공백 타이틀 제거
                        // if (ypi < yPropMax && 0 === xpi ) {	// #20161230-01 : 값 필드 표시 방향 선택 기능
                        // columnStyles["height"] = ( cellHeight * xPropMax ) + "px";
                        html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");

                        if (ypi < yPropMax && (0 === xPropMax || xpi === xPropMax + isShowDataKey)) {
                            columnStyles["top"] = "0px";
                            html.push(this._settings.yProperties[ypi].name);
                        }

                        columnAttributes = {};
                        columnAttributes["class"] = pivotStyle.cssClass.resizeHandle;
                        columnAttributes["draggable"] = "true";
                        columnStyles = {};
                        html.push("<div " + common.attributesString(columnAttributes, columnStyles) + "></div>");

                        html.push("</div>");

                        frozenColumnStyleLeft += frozenColWidth;
                    }
                    html.push("</div>");
                }
                this._elementHeadFrozen.innerHTML = html.join("");
            }
            // x축 - y축이 중첩되는 고정 영역 - End

            if (this._settings.showCalculatedColumnStyle) {
                // 연산 열 헤더 추가
                html.length = 0;
                for (let xpi = 0; xpi < frozenHeightCnt; xpi++) {
                    let showLabel = (xpi === xPropMax + isShowDataKey) ? true : false;
                    this.appendHeadCalculatedColumnToHtml(xpi, cellHeight, showLabel, html);
                }
                this._elementHeadCalculatedColumn.innerHTML = html.join("");
            }
            html.length = 0;
            // Head Wrap : x축 타이틀 표시 - Start
            {
                let totalWidth = 0;
                this._xItems.forEach((item) => {
                    let leafColumnWidthName = this._settings.xProperties.reduce((acc, currProp) => {
                        acc = '' === acc ? acc : acc + "||";
                        return acc + item[currProp.name];
                    }, '');
                    this._settings.zProperties.forEach(zProp => {
                        let name = '' !== leafColumnWidthName ? leafColumnWidthName + "||" + zProp.name : zProp.name;
                        'undefined' === typeof leafColWidth[name] && (leafColWidth[name] = cellWidth);
                        totalWidth = totalWidth + leafColWidth[name];
                    });
                });

                if (0 < xPropMax) {
                    rowAttributes = {};
                    rowAttributes["class"] = pivotStyle.cssClass.headRow;
                    rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.header.font);
                    rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.header.align, 'LEFT');
                    rowStyles = {};
                    rowStyles["width"] = "100%";
                    rowStyles["height"] = cellHeight + "px";
                    rowStyles["top"] = "0px;";
                    html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");
                    columnAttributes = {};
                    columnAttributes["class"] = pivotStyle.cssClass.headCell;
                    columnAttributes["title"] = this._settings.xProperties.map(property => property.name).join(" / ");
                    columnStyles = {};
                    columnStyles["height"] = cellHeight + "px";
                    columnStyles["left"] = this._elementBody.scrollLeft + "px";
                    columnStyles["color"] = this._settings.header.font.color;
                    columnStyles["background-color"] = this._settings.header.backgroundColor;
                    // 20180807 : Koo : Resize Column - S
                    // columnStyles["width"] = Math.min(cellWidthZ * this._xItems.length, this._elementHead.offsetWidth - frozenWidth) + "px";

                    columnStyles["width"] = Math.min(totalWidth, this._elementHead.offsetWidth - frozenWidth) + "px";
                    // 20180807 : Koo : Resize Column - E
                    html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                    html.push(columnAttributes["title"]);
                    html.push("</div>");
                    html.push("</div>");
                }
            }
            // Head Wrap : x축 타이틀 표시 - End

            // Head Wrap : x축 & 데이터 영역 표시 - Start
            {
                for (let xpi = 0; xpi < xPropMax; xpi++) {
                    rowAttributes = {};
                    rowAttributes["class"] = pivotStyle.cssClass.headRow;
                    rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.header.font);
                    rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.header.align, 'LEFT');
                    rowStyles = {};
                    rowStyles["width"] = "100%";
                    rowStyles["height"] = cellHeight + "px";
                    rowStyles["top"] = (xpi + xPropTitleCnt) * cellHeight + "px;";
                    html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

                    let prevValue = '';
                    for (let xii = range.left; xii <= range.right; xii++) {
                        let xItem = this._xItems[xii];
                        let propertyName = this._settings.xProperties[xpi].name;
                        let value = common.format(xItem[propertyName], this._settings.xProperties[xpi].digits);
                        let checkVal = '';
                        for (let checkIdx = 0; checkIdx <= xpi; checkIdx++) {
                            checkVal = checkVal + common.format(xItem[this._settings.xProperties[checkIdx].name], this._settings.xProperties[checkIdx].digits);
                        }
                        if (prevValue === checkVal) {
                            continue;
                        }
                        // 프로퍼티 이름 갱신 ( 중복된 프러퍼티를 생성하지 않기 위해 )
                        prevValue = checkVal;

                        columnAttributes = {};

                        // Add Property by eltriny
                        columnAttributes["class"] = pivotStyle.cssClass.headCell + ' ' + pivotStyle.cssClass.axisX;
                        columnAttributes["title"] = getDisplayValue(value);
                        columnAttributes["data-key"] = propertyName;

                        if (1 === zPropMax) {
                            // columnAttributes[ "data-colIdx" ] = ( xii - range.left );		// colIdx 가 무조건 0부터 시작
                            columnAttributes["data-colIdx"] = xii; // colIdx 가 인덱스 번호대로 시작
                        }

                        // #20161229-01 : 축 선택 시 상위 축 정보 포함 제공 - Start
                        let arrKeys = [];
                        let arrVals = [];
                        for (let idx = 0; idx < xpi; idx++) {
                            arrKeys.push(this._settings.xProperties[idx].name);
                            arrVals.push(xItem[this._settings.xProperties[idx].name]);
                        } // end for - xProperties
                        if (0 < arrKeys.length) {
                            columnAttributes["data-parent-keys"] = arrKeys.join("||");
                            columnAttributes["data-parent-vals"] = arrVals.join("||");
                        }
                        // #20161229-01 : 축 선택 시 상위 축 정보 포함 제공 - End

                        columnStyles = {};
                        columnStyles["height"] = cellHeight + "px";
                        columnStyles["color"] = this._settings.header.font.color;
                        columnStyles["background-color"] = this._settings.header.backgroundColor;
                        // 20180807 : Koo : Resize Column - S
                        // columnStyles["left"] = (zPropMax * xii * cellWidth) + "px";
                        // columnStyles["width"] = (colspan * zPropMax * cellWidth) + "px";
                        let leftPos = 0;
                        let currLeafColName = (columnAttributes["data-parent-vals"]) ? columnAttributes["data-parent-vals"] + "||" + xItem[propertyName] : xItem[propertyName];
                        let xPrevItemList = this._xItems.slice(0, xii);
                        xPrevItemList
                            .map(xPrevItem => {
                                return this._settings.xProperties.slice(0, xpi + 1).map(xProp => xPrevItem[xProp.name]).join('||');
                            })
                            .reduce((acc, currVal) => {
                                (-1 === acc.indexOf(currVal)) && (acc.push(currVal));
                                return acc;
                            }, [])
                            .filter(item => item !== currLeafColName)
                            .forEach(leafColName => {
                                leftPos = leftPos + Object.keys(leafColWidth).reduce((acc, currVal) => {
                                    if (currVal && (currVal === leafColName || -1 < currVal.indexOf(leafColName + '||'))) {
                                        acc = acc + leafColWidth[currVal];
                                    }
                                    return acc;
                                }, 0);
                            });
                        columnStyles["left"] = leftPos + "px";

                        columnStyles["width"] = Object.keys(leafColWidth).reduce((acc, currVal) => {
                            if (currVal && (currVal === currLeafColName || -1 < currVal.indexOf(currLeafColName + '||'))) {
                                acc = acc + leafColWidth[currVal];
                            }
                            return acc;
                        }, 0) + "px";
                        // 20180807 : Koo : Resize Column - E
                        html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                        html.push(getDisplayValue(value));

                        // 20210303 : Harry : Sort Column - S
                        if ( !this._settings.body.showAxisZ && zPropMax === 1 && this._settings.xProperties.slice(-1)[0].name === columnAttributes['data-key'] ) {
                            columnAttributes["class"] = pivotStyle.cssClass.axisXSort;

                            let arrKeys = [];
                            let arrVals = [];

                            for (let idx = 0; idx < xpi; idx++) {
                                arrKeys.push(this._settings.xProperties[idx].name);
                                arrVals.push(xItem[this._settings.xProperties[idx].name]);
                            } // end for - xProperties

                            arrKeys.push(columnAttributes['data-key']);
                            arrVals.push(columnAttributes['title']);

                            // parent key, value setting
                            if (0 < arrKeys.length) {
                                columnAttributes["data-parent-keys"] = arrKeys.join("||");
                                columnAttributes["data-parent-vals"] = arrVals.join("||");
                            }

                            // sort type setting
                            if (this._settings.sortColumnParentVals + common.__fieldSeparator + this._settings.sortColumnMeasure
                                === columnAttributes['data-parent-vals'].split('||').join(common.__fieldSeparator) + common.__fieldSeparator + this._settings.zProperties[0].name) {
                                columnAttributes["data-sort"] = this._settings.sortType;
                            } else {
                                columnAttributes["data-sort"] = Viewer.SORT_COL_MODE.NONE;
                            }

                            columnStyles = {};
                            html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                            html.push(columnAttributes["data-sort"] === Viewer.SORT_COL_MODE.NONE ? '-' : ( columnAttributes["data-sort"] === Viewer.SORT_COL_MODE.ASC ? '▲' : '▼'));
                            html.push("</div>");
                        }
                        // 20210303 : Harry : Sort Column - E

                        // 20180807 : Koo : Resize Column - E
                        if (!this._settings.body.showAxisZ && xpi === xPropMax - 1) {
                            columnAttributes = {};
                            columnAttributes["class"] = pivotStyle.cssClass.resizeHandle;
                            columnAttributes["draggable"] = "true";
                            columnStyles = {};
                            html.push("<div " + common.attributesString(columnAttributes, columnStyles) + "></div>");
                        }
                        // 20180807 : Koo : Resize Column - E
                        html.push("</div>");

                    } // end for - xii
                    html.push("</div>");
                } // end for - xpi

                if (this._settings.body.showAxisZ) {
                    // #20161230-01 : 값 필드 표시 방향 선택 기능
                    rowAttributes = {};
                    rowAttributes["class"] = pivotStyle.cssClass.headRow;
                    rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.header.font);
                    rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.header.align, 'LEFT');
                    rowStyles = {};
                    rowStyles["width"] = "100%";
                    rowStyles["height"] = cellHeight + "px";
                    rowStyles["top"] = (xPropMax + xPropTitleCnt) * cellHeight + "px;";
                    html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

                    for (let xii = range.left; xii <= range.right; xii++) {

                        // #20161229-01 : 축 선택 시 상위 축 정보 포함 제공 - Start
                        let xItem = this._xItems[xii];
                        let strKeys = this._settings.xProperties.map(xProp => xProp.name).join('||');
                        let strVals = this._settings.xProperties.map(xProp => xItem[xProp.name]).join('||');
                        // #20161229-01 : 축 선택 시 상위 축 정보 포함 제공 - End

                        for (let zpi = 0; zpi < zPropMax; zpi++) {
                            // z-axis 추가
                            columnAttributes = {};

                            // 20210226 : Harry : X Axis Class For Sorting - S
                            columnAttributes["class"] = pivotStyle.cssClass.headCell + ' ' + pivotStyle.cssClass.axisX;
                            // 20210226 : Harry : X Axis Class For Sorting - E

                            columnAttributes["title"] = this._settings.zProperties[zpi].name;
                            columnAttributes["data-key"] = 'dataAxis';
                            columnAttributes["data-colIdx"] = zPropMax * xii + zpi;

                            // #20161229-01 : 축 선택 시 상위 축 정보 포함 제공 - Start
                            columnAttributes["data-parent-keys"] = strKeys;
                            columnAttributes["data-parent-vals"] = strVals;
                            // #20161229-01 : 축 선택 시 상위 축 정보 포함 제공 - End

                            columnStyles = {};
                            columnStyles["height"] = cellHeight + "px";

                            let zPropName = this._settings.zProperties[zpi].name;

                            // 20180807 : Koo : Resize Column - S
                            // columnStyles["left"] = (((zPropMax * xii) + zpi) * cellWidth) + "px";
                            // columnStyles["width"] = frozenCellWidth + "px";
                            let leftPos = 0;
                            let xPrevItemList = this._xItems.slice(0, xii);
                            xPrevItemList
                                .map(xPrevItem => {
                                    return this._settings.xProperties.map(xProp => xPrevItem[xProp.name]).join('||');
                                })
                                .reduce((acc, currVal) => {
                                    (-1 === acc.indexOf(currVal)) && (acc.push(currVal));
                                    return acc;
                                }, [])
                                .forEach(leafColName => {
                                    leftPos = leftPos + Object.keys(leafColWidth).reduce((acc, currVal) => {
                                        if (currVal && -1 < currVal.indexOf(leafColName)) {
                                            acc = acc + leafColWidth[currVal];
                                        }
                                        return acc;
                                    }, 0);
                                });
                            leftPos = leftPos + this._settings.zProperties.slice(0, zpi).reduce((acc, currVal) => {
                                let leafColName = (columnAttributes["data-parent-vals"]) ? columnAttributes["data-parent-vals"] + "||" + currVal.name : currVal.name;
                                return acc + leafColWidth[leafColName];
                            }, 0);
                            columnStyles["left"] = leftPos + "px";

                            let leafColName = (columnAttributes["data-parent-vals"]) ? columnAttributes["data-parent-vals"] + "||" + zPropName : zPropName;
                            columnStyles["width"] = Object.keys(leafColWidth).reduce((acc, currVal) => {
                                if (currVal === leafColName) {
                                    acc = acc + leafColWidth[currVal];
                                }
                                return acc;
                            }, 0) + "px";
                            // 20180807 : Koo : Resize Column - E

                            columnStyles["color"] = this._settings.header.font.color;
                            columnStyles["background-color"] = this._settings.header.backgroundColor;
                            html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                            html.push(zPropName);

                            // 20210305 : Harry : Sort Column - S
                            columnAttributes["class"] = pivotStyle.cssClass.axisXSort;

                            // columnAttributes 정보가 선택한 z축 cell 정보와 일치하는 경우, 선택한 정렬 타입에 따라 columnAttributes["data-sort"] 설정
                            if (this._settings.sortColumnParentVals + common.__fieldSeparator + this._settings.sortColumnMeasure
                                === columnAttributes['data-parent-vals'].split('||').join(common.__fieldSeparator) + common.__fieldSeparator + columnAttributes['title']) {
                                columnAttributes["data-sort"] = this._settings.sortType;
                            } else {
                                columnAttributes["data-sort"] = Viewer.SORT_COL_MODE.NONE;
                            }

                            columnStyles = {};
                            html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                            html.push(columnAttributes["data-sort"] === Viewer.SORT_COL_MODE.NONE ? '-' : ( columnAttributes["data-sort"] === Viewer.SORT_COL_MODE.ASC ? '▲' : '▼'));
                            html.push("</div>");
                            // 20210305 : Harry : Sort Column - E

                            // 20180807 : Koo : Resize Column - E
                            columnAttributes = {};
                            columnAttributes["class"] = pivotStyle.cssClass.resizeHandle;
                            columnAttributes["draggable"] = "true";
                            columnStyles = {};
                            html.push("<div " + common.attributesString(columnAttributes, columnStyles) + "></div>");
                            // 20180807 : Koo : Resize Column - E
                            html.push("</div>");
                        } // end for - zpi

                    } // end for - xii
                } // end if - data key display mode : top

                this._elementHeadWrap.innerHTML = html.join("");
            }
            // Head Wrap : x축 & 데이터 영역 표시 - End

            this.arrangeFrozenColumnRelatedElements();

            // body-frozen : y축 영역 표시 - Start
            html.length = 0;
            let calculatedColumns = [];
            {
                let predicate = function (a, b, ypi) {
                    for (let i = ypi; i >= 0; i--) {
                        let propertyName = _this._settings.yProperties[i].name;
                        if (a[propertyName] !== b[propertyName]) {
                            return false;
                        }
                    }
                    return true;
                };
                for (let yii = range.top; yii <= range.bottom; yii++) {
                    let index = yii;
                    let rowIdx = yii;
                    rowAttributes = {};
                    rowAttributes["class"] = pivotStyle.cssClass.headRow;

                    let yItem = this._yItems[yii];
                    let subCalcKey = getSubCalcKey(yItem);
                    if (this._settings.calcCellStyle && undefined !== getCalcKey(yItem)) {
                        rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.calcCellStyle.font);
                        rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.calcCellStyle.align, 'CENTER');
                    } else if (undefined !== subCalcKey) {
                        const subCalcCellStyle = this._settings.subCalcCellStyle[subCalcKey.toLowerCase()];
                        rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], subCalcCellStyle.font);
                        rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], subCalcCellStyle.align, 'CENTER');
                    } else {
                        rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.header.font);
                        rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.header.align, 'LEFT');
                    }

                    rowStyles = {};
                    rowStyles["width"] = "100%";
                    rowStyles["height"] = cellHeight + "px";
                    rowStyles["top"] = index * cellHeight + "px;";
                    html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

                    let frozenColumnStylesLeft = 0;

                    for (let ypi = 0; ypi < yPropMax; ypi++) {
                        let propertyName = this._settings.yProperties[ypi].name;
                        if (undefined === yItem[propertyName]) {
                            // 값이 없을 때는 셀을 그리지 않는다. ( subtotal 의 하위 셀 경우 )
                            continue;
                        }
                        let value = common.format(yItem[propertyName], this._settings.yProperties[ypi].digits);
                        let rowspan = 1;
                        if (index > range.top && this._yItems[yii - 1] && predicate(this._yItems[yii - 1], yItem, ypi)) {
                            frozenColumnStylesLeft += leafFrozenColWidth[propertyName];
                            continue;
                        }
                        for (let i = yii + 1; i < this._yItems.length; i++) {
                            if (predicate(this._yItems[i], yItem, ypi)) {
                                rowspan++;
                            } else {
                                break;
                            }
                        }
                        columnAttributes = {};
                        // Add Property by eltriny
                        columnAttributes["class"] = pivotStyle.cssClass.headCell + ' ' + pivotStyle.cssClass.axisY;
                        columnAttributes["title"] = getDisplayValue(value);
                        columnAttributes["data-key"] = propertyName;
                        columnAttributes["data-rowIdx"] = rowIdx;

                        // #20161229-01 : 축 선택 시 상위 축 정보 포함 제공 - Start
                        let arrKeys = [];
                        let arrVals = [];
                        for (let idx = 0; idx < ypi; idx++) {
                            arrKeys.push(this._settings.yProperties[idx].name);
                            arrVals.push(yItem[this._settings.yProperties[idx].name]);
                        } 	// end for - yProperties

                        if (0 < arrKeys.length) {
                            columnAttributes["data-parent-keys"] = arrKeys.join("||");
                            columnAttributes["data-parent-vals"] = arrVals.join("||");
                        }
                        // #20161229-01 : 축 선택 시 상위 축 정보 포함 제공 - End

                        columnStyles = {};
                        columnStyles["left"] = frozenColumnStylesLeft + "px";
                        columnStyles["width"] = leafFrozenColWidth[propertyName] + "px";
                        let tempCellHeight = rowspan * cellHeight;
                        columnStyles["height"] = tempCellHeight + "px";
                        // columnStyles["line-height"] = this.getLineHeightForValign( this._settings.header.align, tempCellHeight, rowspan ) + "px !important";
                        columnStyles["z-index"] = range.bottom - yii; // 영역 클릭 이슈 해결 위해 추가

                        if ('TOTAL' === value) {
                            value = !this._settings.calcCellStyle.label || '' === this._settings.calcCellStyle.label
                                ? pivotStyle.summaryLabel[this._settings.calcCellStyle.aggregationType] : this._settings.calcCellStyle.label;
                            columnStyles["width"] = (frozenCellWidth * this._settings.yProperties.length) + "px";
                            columnStyles["color"] = this._settings.calcCellStyle.font.color;
                            columnStyles["background-color"] = this._settings.calcCellStyle.backgroundColor;
                        } else if ('SUB-TOTAL' === value) {
                            columnStyles["width"] = ((yPropMax - ypi) * frozenCellWidth) + "px";
                            const subTotalPropName = this._settings.yProperties[ypi - 1].name;
                            const subCellStyle = this._settings.subCalcCellStyle[subTotalPropName.toLowerCase()];
                            // value = common.capitalize(subCellStyle.aggregationType) + '(' + yItem[subTotalPropName] + ')';
                            value = !subCellStyle.label || '' === subCellStyle.label
                                ? pivotStyle.subSummaryLabel[subCellStyle.aggregationType] : subCellStyle.label;
                            columnStyles["color"] = subCellStyle.font.color;
                            columnStyles["background-color"] = subCellStyle.backgroundColor;
                        } else {
                            columnStyles["width"] = frozenCellWidth + "px";
                            columnStyles["color"] = this._settings.header.font.color;
                            columnStyles["background-color"] = this._settings.header.backgroundColor;
                        }

                        html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                        html.push(getDisplayValue(value));
                        html.push("</div>");

                        frozenColumnStylesLeft += leafFrozenColWidth[propertyName];
                        if (this._settings.showCalculatedColumnStyle && (ypi == this._settings.yProperties.length - 1) && value) {
                            calculatedColumns.push({
                                summaryMapKey: arrVals.concat([value]).join("||"),
                                top: index * cellHeight
                            });
                        }
                    }

                    html.push("</div>");

                    // 요약 정보 타이틀 설정 - Start
                    if (this._settings.totalValueStyle && 0 < yPropMax && yii === this._yItems.length - 1) {
                        rowAttributes = {};
                        rowAttributes["class"] = pivotStyle.cssClass.headRow;
                        rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.totalValueStyle.font);
                        rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.totalValueStyle.align, 'LEFT');
                        rowStyles = {};
                        rowStyles["width"] = "100%";
                        rowStyles["height"] = cellHeight + "px";
                        rowStyles["top"] = this._yItems.length * cellHeight + "px;";
                        html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

                        // cell설정
                        columnAttributes = {};
                        columnAttributes["class"] = pivotStyle.cssClass.headCell;
                        columnStyles = {};
                        columnStyles["width"] = frozenCellWidth * yPropMax + "px";
                        columnStyles["height"] = cellHeight + "px";

                        columnStyles["color"] = this._settings.totalValueStyle.font.color;
                        columnStyles["background-color"] = this._settings.totalValueStyle.backgroundColor;
                        columnStyles["left"] = 0 + "px";

                        html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                        html.push(!this._settings.totalValueStyle.label || '' === this._settings.totalValueStyle.label ? pivotStyle.summaryLabel[this._settings.totalValueStyle.aggregationType] : this._settings.totalValueStyle.label);
                        html.push("</div>");

                        html.push("</div>");
                    }
                    // 요약 정보 타이틀 설정 - End
                } // for - yii

                this._elementBodyFrozen.innerHTML = html.join("");
            }
            // body-frozen : y축 영역 표시 - End

            // 연산열 - body
            if (this._settings.showCalculatedColumnStyle) {
                html.length = 0;
                // 연산 열 데이터 표시
                if (this.summaryMap[Viewer.EMPTY_Y_AXIS_DIMENSION_KEY]) {
                    // Y축 차원이 존재하지 않는 경우
                    this.appendBodyCalculatedColumnToHtml(Viewer.EMPTY_Y_AXIS_DIMENSION_KEY, 0, cellHeight, html);
                } else {
                    for (let i = 0; i < calculatedColumns.length; i++) {
                        this.appendBodyCalculatedColumnToHtml(calculatedColumns[i].summaryMapKey, calculatedColumns[i].top, cellHeight, html);
                    }
                }

                this._elementBodyCalculatedColumn.innerHTML = html.join("");
            }
            // body-wrap : 데이터 영역 마크업 생성 - Start
            html.length = 0;
            {
                // Data Cell 단계 색상 표시 여부
                let showColorStep = this._settings.body.color && this._settings.body.color.showColorStep ? this._settings.body.color.showColorStep : null;
                let items = this._items;
                let stepRangeColors = this._settings.body.color && this._settings.body.color.stepRangeColors ? this._settings.body.color.stepRangeColors : null;
                for (let yii = range.top; yii <= range.bottom; yii++) {
                    let index = yii;
                    let rowIdx = yii;	// rowIdx 가 인덱스 번호대로 생성
                    let yItem = this._yItems[yii];
                    rowAttributes = {};
                    rowAttributes["data-rowIdx"] = rowIdx;
                    rowAttributes["class"] = pivotStyle.cssClass.bodyRow + (index % 2 === 0 ? " odd" : "");

                    let subCalcKey = getSubCalcKey(yItem);
                    if (this._settings.calcCellStyle && undefined !== getCalcKey(yItem)) {
                        rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.calcCellStyle.font);
                        rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.calcCellStyle.align);
                    } else if (undefined !== subCalcKey) {
                        const subCalcCellStyle = this._settings.subCalcCellStyle[subCalcKey.toLowerCase()];
                        rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], subCalcCellStyle.font);
                        rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], subCalcCellStyle.align);
                    } else {
                        rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.body.font);
                        rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.body.align);
                    }

                    rowStyles = {};
                    rowStyles["width"] = "100%";
                    rowStyles["height"] = cellHeight + "px";
                    rowStyles["top"] = index * cellHeight + "px;";
                    html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

                    for (let xii = range.left; xii <= range.right; xii++) {
                        for (let zpi = 0; zpi < zPropMax; zpi++) {
                            let zpiProp = this._settings.zProperties[zpi];
                            let objCriteria = null;
                            if (showColorStep) {
                                objCriteria = this._dataCriteria[zpiProp.name];
                            }

                            let xItem = this._xItems[xii];
                            let context = this._itemsContext;
                            let contains = false;

                            columnAttributes = {};
                            columnAttributes["class"] = pivotStyle.cssClass.bodyCell;
                            columnAttributes["data-rowIdx"] = rowIdx;
                            columnAttributes["data-colIdx"] = zPropMax * xii + zpi; // colIdx 가 인덱스 번호대로 시작

                            columnStyles = {};
                            columnStyles["height"] = cellHeight + "px";
                            // 20180807 : Koo : Resize Column - S
                            // columnStyles["left"] = (((zPropMax * xii) + zpi) * cellWidth) + "px";
                            // columnStyles["width"] = cellWidth + "px";
                            let xPropLeafColName = this._settings.xProperties.reduce(function (acc, prop) {
                                let xVal = xItem[prop.name];
                                xVal && (acc = acc + ('' === acc ? xVal : '||' + xVal));
                                return acc;
                            }, '');

                            let leftPos = 0;
                            let xPrevItemList = this._xItems.slice(0, xii);
                            xPrevItemList
                                .map(xPrevItem => {
                                    return this._settings.xProperties.map(xProp => xPrevItem[xProp.name]).join('||');
                                })
                                .reduce((acc, currVal) => {
                                    (-1 === acc.indexOf(currVal)) && (acc.push(currVal));
                                    return acc;
                                }, [])
                                .forEach(leafColName => {
                                    leftPos = leftPos + Object.keys(leafColWidth).reduce((acc, currVal) => {
                                        if (currVal && (currVal === leafColName || -1 < currVal.indexOf(leafColName + '||'))) {
                                            acc = acc + leafColWidth[currVal];
                                        }
                                        return acc;
                                    }, 0);
                                });
                            leftPos = leftPos + this._settings.zProperties.slice(0, zpi).reduce((acc, currVal) => {
                                let leafColName = ('' !== xPropLeafColName) ? xPropLeafColName + "||" + currVal.name : currVal.name;
                                return acc + leafColWidth[leafColName];
                            }, 0);
                            columnStyles["left"] = leftPos + "px";
                            if ('' === xPropLeafColName) {
                                columnStyles["width"] = leafColWidth[zpiProp.name] + "px";
                            } else {
                                columnStyles["width"] = leafColWidth[xPropLeafColName + '||' + zpiProp.name] + "px";
                            }
                            // 20180807 : Koo : Resize Column - E

                            try {

                                let arrParentKey = [];  // 20180807 : Koo : Resize Column
                                let arrParentVal = [];  // 20180807 : Koo : Resize Column
                                for (let i = 0; i < xPropMax; i++) {
                                    const xPropKey = this._settings.xProperties[i].name;
                                    context = context[xItem[xPropKey]];
                                    arrParentKey.push(xPropKey);                       // 20180807 : Koo : Resize Column
                                    arrParentVal.push(xItem[xPropKey]);         // 20180807 : Koo : Resize Column
                                }
                                columnAttributes["data-parent-keys"] = arrParentKey.join('||');       // 20180807 : Koo : Resize Column
                                columnAttributes["data-parent-vals"] = arrParentVal.join('||');       // 20180807 : Koo : Resize Column
                                for (let i = 0; i < yPropMax; i++) {
                                    context = context[yItem[this._settings.yProperties[i].name]];
                                }

                                if (context) {
                                    let itemData = context.item[zpiProp.name];

                                    columnAttributes["data-key"] = zpiProp.name;
                                    columnAttributes["title"] = zpiProp.name + ":" + itemData;

                                    // #20161227-02 Cell Click Event 추가 : Cell Data 설정 - Start
                                    let isCalRow = false;
                                    let subCalcKey = undefined;
                                    for (let key in context.item) {
                                        if (context.item.hasOwnProperty(key)) {
                                            const keyData = context.item[key];
                                            // 20170811 Dolkkok - key-value로 세팅
                                            // 20171130 taeho - 피봇 / 원본 데이터형태 모두 지원하도록 변경
                                            // columnAttributes["data-item-" + key] = this._isPivot ? key + '―' + keyData : keyData;    // TODO : 확인 필요 -> Github 버전
                                            columnAttributes["data-item-" + key] = this._isPivot ? key + common.__fieldSeparator + keyData : keyData;
                                            if ('SUB-TOTAL' === keyData) {
                                                subCalcKey = key;
                                            } else if ('TOTAL' === keyData) {
                                                isCalRow = true;
                                            }
                                        }
                                    }
                                    // #20161227-02 Cell Click Event 추가 : Cell Data 설정 - End

                                    // Cell Index 추출 및 설정 - Start
                                    let nItemIdx = -1;
                                    for (let idx = 0, nMax = items.length; idx < nMax; idx++) {
                                        let objItem = items[idx];
                                        let isUnMatch = false;
                                        for (let key in context.item) {
                                            if (context.item.hasOwnProperty(key) && objItem[key] !== context.item[key]) {
                                                isUnMatch = true;
                                                break;
                                            }
                                        }	// end for - context.item
                                        if (!isUnMatch) {
                                            nItemIdx = idx;
                                            break;
                                        }	// end if - isUnMatch
                                    }	// end for - items
                                    if (-1 < nItemIdx) {
                                        columnAttributes["data-idx"] = nItemIdx;
                                    }
                                    // Cell Index 추출 및 설정 - End

                                    if (isCalRow) {
                                        if (this.isDefaultTextAlign(this._settings.calcCellStyle.align)) {
                                            columnAttributes["class"] += ' ' + pivotStyle.cssClass.txtRight
                                        }
                                        columnAttributes["class"] += ' ' + pivotStyle.cssClass.numeric;
                                        columnStyles["color"] = this._settings.calcCellStyle.font.color;
                                        columnStyles["background-color"] = this._settings.calcCellStyle.backgroundColor;
                                    } else if (undefined !== subCalcKey) {

                                        const subCalcCellStyle = this._settings.subCalcCellStyle[subCalcKey.toLowerCase()];
                                        // rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], subCalcCellStyle.align, 'RIGHT');

                                        if (this.isDefaultTextAlign(subCalcCellStyle.align)) {
                                            columnAttributes["class"] += ' ' + pivotStyle.cssClass.txtRight;
                                        }
                                        columnAttributes["class"] += ' ' + pivotStyle.cssClass.numeric;
                                        columnStyles["color"] = subCalcCellStyle.font.color;
                                        columnStyles["background-color"] = subCalcCellStyle.backgroundColor;

                                    } else if ('number' === typeof itemData) {
                                        columnAttributes["class"] += ' ' + pivotStyle.cssClass.numeric;
                                        // 단계별 색상 설정 추가 - Start
                                        if (showColorStep) {
                                            let strColor = objCriteria.getColor(itemData);
                                            let strTxtColor = objCriteria.getTextColor(itemData);
                                            strTxtColor && (columnStyles["color"] = strTxtColor);
                                            strColor && (columnStyles["background-color"] = strColor);

                                            // 사용자 색상 범위설정이 있을때
                                            if (stepRangeColors && stepRangeColors.length > 0) {

                                                if ('TEXT' === this._settings.body.color.colorTarget) {
                                                    // 색상타입이 글자일때
                                                    strColor = '#ffffff';
                                                    strTxtColor = objCriteria.getUserRangeColor(itemData, stepRangeColors);

                                                } else {
                                                    // 배경일때
                                                    strColor = objCriteria.getUserRangeColor(itemData, stepRangeColors);
                                                    strTxtColor = '#ffffff';
                                                }

                                                // textColor가 있는경우 해당 textColor로 설정
                                                if (this._settings.body.color.stepTextColors && this._settings.body.color.stepTextColors.length > 0) {
                                                    strTxtColor = this._settings.body.color.stepTextColors;
                                                }

                                                strTxtColor && (columnStyles["color"] = strTxtColor);
                                                strColor && (columnStyles["background-color"] = strColor);
                                            }
                                        }
                                        // 단계별 색상 설정 추가 - End
                                    }
                                    // TODO 숫자가 아닌부분은 header영역 색상으로 설정
                                    // else {
                                    //     columnStyles["color"] = this._settings.header.font.color;
                                    //     columnStyles["background-color"] = this._settings.header.backgroundColor;
                                    // }

                                    html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                                    if (zpiProp.type && 'origin' === this._settings.format.type && !this._isPivot) {
                                        html.push(common.numberFormat(itemData, this._settings.format, zpiProp.type));
                                    } else {
                                        html.push(common.numberFormat(itemData, this._settings.format));
                                    }
                                    html.push("</div>");
                                    contains = true;
                                } // end if - context is valid
                            } catch (e) {
                                console.error(e);
                            }
                            if (!contains) {
                                html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                                html.push("</div>");
                            }

                        } // end for - zpi
                    } // end for - xii
                    html.push("</div>");

                    // 요약 정보 데이터 표시 설정 - Start
                    if (this._settings.totalValueStyle && yii === this._yItems.length - 1) {
                        rowAttributes = {};
                        rowAttributes["class"] = pivotStyle.cssClass.bodyRow;
                        rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.totalValueStyle.font);
                        rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.totalValueStyle.align, 'RIGHT');
                        rowStyles = {};
                        rowStyles["width"] = "100%";
                        rowStyles["height"] = cellHeight + "px";
                        rowStyles["top"] = this._yItems.length * cellHeight + "px;";
                        html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

                        for (let _xii = range.left; _xii <= range.right; _xii++) {
                            for (let zpi = 0; zpi < zPropMax; zpi++) {

                                let zpiProp = this._settings.zProperties[zpi];
                                let xItem = this._xItems[_xii];

                                // cell설정
                                columnAttributes = {};
                                columnAttributes["class"] = pivotStyle.cssClass.bodyCell;
                                columnStyles = {};
                                columnStyles["color"] = this._settings.totalValueStyle.font.color;
                                columnStyles["background-color"] = this._settings.totalValueStyle.backgroundColor;
                                columnStyles["height"] = cellHeight + "px";

                                // 20180807 : Koo : Resize Column - S
                                // columnStyles["left"] = (((zPropMax * xii) + zpi) * cellWidth) + "px";
                                // columnStyles["width"] = cellWidth + "px";
                                let xPropLeafColName = this._settings.xProperties.reduce(function (acc, prop) {
                                    let xVal = xItem[prop.name];
                                    xVal && (acc = acc + ('' === acc ? xVal : '||' + xVal));
                                    return acc;
                                }, '');

                                let leftPos = 0;
                                let xPrevItemList = this._xItems.slice(0, _xii);
                                xPrevItemList.map((xPrevItem) => {
                                    return this._settings.xProperties.map(function (xProp) {
                                        return xPrevItem[xProp.name];
                                    }).join('||');
                                }).reduce(function (acc, currVal) {
                                    -1 === acc.indexOf(currVal) && acc.push(currVal);
                                    return acc;
                                }, []).forEach(function (leafColName) {
                                    leftPos = leftPos + Object.keys(leafColWidth).reduce(function (acc, currVal) {
                                        if (currVal && (currVal === leafColName || -1 < currVal.indexOf(leafColName + '||'))) {
                                            acc = acc + leafColWidth[currVal];
                                        }
                                        return acc;
                                    }, 0);
                                });
                                leftPos = leftPos + this._settings.zProperties.slice(0, zpi).reduce(function (acc, currVal) {
                                    let leafColName = '' !== xPropLeafColName ? xPropLeafColName + "||" + currVal.name : currVal.name;
                                    return acc + leafColWidth[leafColName];
                                }, 0);
                                columnStyles["left"] = leftPos + "px";

                                let summaryKey = '' === xPropLeafColName ? zpiProp.name : xPropLeafColName + '||' + zpiProp.name;
                                columnStyles["width"] = leafColWidth[summaryKey] + "px";
                                // 20180807 : Koo : Resize Column - E

                                html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
                                if (zpiProp.type && 'origin' === this._settings.format.type && !this._isPivot) {
                                    html.push(common.numberFormat(this.getSummaryValue(this.summaryMap[summaryKey], this._settings.totalValueStyle), this._settings.format, zpiProp.type));
                                } else {
                                    html.push(common.numberFormat(this.getSummaryValue(this.summaryMap[summaryKey], this._settings.totalValueStyle), this._settings.format));
                                }
                                html.push("</div>");

                            } // end for - zpi
                        } // end for - xii

                        html.push("</div>");
                    }
                    // 요약 정보 데이터 표시 설정 - End
                } // end for - yii

                this._elementBodyWrap.innerHTML = html.join("");
            }
            // body-wrap : 데이터 영역 마크업 생성 - End

            // add execute function - Start
            pivotStyle.setClickStyle.apply(this);
            // add execute function - End
        }; // func - renderDataToHorizontal

        /**
         * Table Contents Rendering Function for Download
         * > 데이터 표시를 좌->우 방향으로 함
         */
        Viewer.prototype.generateDownloadTableHorizontal = function () {

            let _this = this;
            let html = [];
            let xPropMax = this._settings.xProperties.length;
            let yPropMax = this._settings.yProperties.length;
            let zPropMax = this._settings.zProperties.length;

            let isShowDataKey = (this._settings.body.showAxisZ) ? 1 : 0;
            const xPropTitleCnt = this._isPivot ? 1 : 0;
            let frozenHeightCnt = (xPropTitleCnt + xPropMax);

            html.push('<table>');
            html.push('<thead>');
            if (this._isPivot) {
                html.push('<tr>');
                // x/y축 중첩 영역 - Start
                for (let ypi = 0; ypi < yPropMax; ypi++) {
                    html.push('<th rowspan="' + frozenHeightCnt + '" >');
                    html.push(this._settings.yProperties[ypi].name);
                    html.push('</th>');
                }
                if (isShowDataKey) {
                    html.push('<th rowspan="' + frozenHeightCnt + '" ></th>');
                }
                // x/y축 중첩 영역 - End
                // x축 헤더 타이틀 영역 - Start
                if (0 < xPropMax) {
                    // xProp 이름 묶음 출력
                    let nColspan = this._xItems.length * this._settings.zProperties.length;
                    html.push('<th colspan="' + nColspan + '" >');
                    html.push(this._settings.xProperties.map(property => property.name).join(" / "));
                    html.push('</th>');
                }
                // x축 헤더 타이틀 영역 - End
                html.push('</tr>');
            }

            for (let xpi = 0; xpi < xPropMax; xpi++) {
                html.push('<tr>');

                if (!this._isPivot && 0 === xpi) {
                    // 원본보기 일 경우 행번호 컬럼에 대한 빈 헤더 추가
                    html.push('<th rowspan="' + xPropMax + '" ></th>');
                }

                let prevValue = '';
                let nColspan = 0;
                for (let xii = 0, nXiiMax = this._xItems.length; xii < nXiiMax; xii++) {
                    let xItem = this._xItems[xii];
                    let propertyName = this._settings.xProperties[xpi].name;
                    let value = common.format(xItem[propertyName], this._settings.xProperties[xpi].digits);
                    if ('' === prevValue || prevValue === value) {
                        prevValue = value;
                        nColspan++;
                        continue;
                    }

                    html.push('<th colspan="' + nColspan + '" >' + prevValue + '</th>');

                    // 이전 정보 저장 ( colspan 을 체크하기 위해 )
                    nColspan = 1;
                    prevValue = value;
                }	// end for - xii

                html.push('<th colspan="' + nColspan + '" >' + prevValue + '</th>');

                html.push('</tr>');
            }	// end for - xpi
            html.push('</thead>');

            html.push('<tbody>');
            {
                let predicate = function (a, b, ypi) {
                    for (let i = ypi; i >= 0; i--) {
                        let propertyName = _this._settings.yProperties[i].name;
                        if (a[propertyName] !== b[propertyName]) {
                            return false;
                        }
                    }
                    return true;
                };
                for (let yii = 0, nYiiMax = this._yItems.length; yii < nYiiMax; yii++) {
                    let yItem = this._yItems[yii];
                    for (let zpi = 0; zpi < zPropMax; zpi++) {
                        html.push('<tr>');
                        let zpiProp = this._settings.zProperties[zpi];

                        if (zpi === 0) {
                            // y축 yProp 영역 - Start
                            for (let ypi = 0; ypi < yPropMax; ypi++) {
                                let propertyName = this._settings.yProperties[ypi].name;
                                if (undefined === yItem[propertyName]) {
                                    // 값이 없을 때는 셀을 그리지 않는다. ( subtotal 의 하위 셀 경우 )
                                    continue;
                                }
                                let value = common.format(yItem[propertyName], this._settings.yProperties[ypi].digits);
                                let nRowspan = 1;
                                if (this._yItems[yii - 1] && predicate(this._yItems[yii - 1], yItem, ypi)) {
                                    continue;
                                }
                                for (let i = yii + 1; i < this._yItems.length; i++) {
                                    if (predicate(this._yItems[i], yItem, ypi)) {
                                        nRowspan++;
                                    } else {
                                        break;
                                    }
                                }

                                if ('TOTAL' === value) {
                                    const nColspan = yPropMax - ypi;
                                    value = !this._settings.calcCellStyle.label || '' === this._settings.calcCellStyle.label
                                        ? pivotStyle.summaryLabel[this._settings.calcCellStyle.aggregationType] : this._settings.calcCellStyle.label;
                                    html.push('<td rowspan="' + (nRowspan * zPropMax) + '"  colspan="' + nColspan + '" >' + value + '</td>');
                                } else if ('SUB-TOTAL' === value) {
                                    const nColspan = (yPropMax - ypi);
                                    const subTotalPropName = this._settings.yProperties[ypi - 1].name;
                                    const subCellStyle = this._settings.subCalcCellStyle[subTotalPropName.toLowerCase()];
                                    // value = common.capitalize(subCellStyle.aggregationType) + '(' + yItem[subTotalPropName] + ')';
                                    value = !subCellStyle.label || '' === subCellStyle.label
                                        ? pivotStyle.subSummaryLabel[subCellStyle.aggregationType] : subCellStyle.label;
                                    html.push('<td rowspan="' + (nRowspan * zPropMax) + '"  colspan="' + nColspan + '" >' + value + '</td>');
                                } else {
                                    html.push('<td rowspan="' + (nRowspan * zPropMax) + '" >' + value + '</td>');
                                }
                            }
                            // y축 yProp 영역 - End
                        }	// end if - zpi is zero

                        // z-axis 추가
                        if (this._settings.body.showAxisZ) {		// #20161230-01 : 값 필드 표시 방향 선택 기능
                            html.push('<td>' + zpiProp.alias + '</td>');
                        } // end if - data key display mode : left

                        // 데이터 영역 ( 피벗 및 부분합 데이터 ) - Start
                        for (let xii = 0, nXiiMax = this._xItems.length; xii < nXiiMax; xii++) {
                            let xItem = this._xItems[xii];
                            let context = this._itemsContext;
                            let contains = false;
                            try {
                                for (let i = 0; i < xPropMax; i++) {
                                    const xPropKey = this._settings.xProperties[i].name;
                                    context = context[xItem[xPropKey]];
                                }
                                for (let i = 0; i < yPropMax; i++) {
                                    context = context[yItem[this._settings.yProperties[i].name]];
                                }
                                if (context) {
                                    let itemData = context.item[zpiProp.name];
                                    if (undefined === itemData || null === itemData) {
                                        html.push('<td></td>');
                                    } else {
                                        html.push('<td>' + itemData + '</td>');
                                    }
                                    contains = true;
                                }	// end if - context is valid
                            } catch (e) {
                                console.error(e);
                            }
                            if (!contains) {
                                html.push('<td></td>');
                            }
                        } // for - xii
                        html.push('</tr>');
                    }	// for - zpi
                } 	// for - yii
                /*
                                // 요약 정보 타이틀 설정 - Start
                                if (this._settings.calcCellStyle) {
                                    for (let zpi = 0; zpi < zPropMax; zpi++) {
                                        html.push('<tr>');
                                        let zpiProp = this._settings.zProperties[zpi];
                                        // 총합 타이틀 추가
                                        if (0 === zpi && 0 < yPropMax) {
                                            html.push('<td rowspan="' + zPropMax + '" colspan="' + yPropMax + '" >');
                                            html.push(
                                                !this._settings.calcCellStyle.label || '' === this._settings.calcCellStyle.label
                                                    ? pivotStyle.summaryLabel[this._settings.calcCellStyle.aggregationType] : this._settings.calcCellStyle.label
                                            );
                                            html.push('</td>');
                                        }
                                        // z-axis 추가
                                        if (this._settings.body.showAxisZ) {
                                            html.push('<td>' + this._settings.zProperties[zpi].name + '</td>');
                                        }

                                        // 총합 데이터 추가
                                        for (let xii = 0, nXiiMax = this._xItems.length; xii < nXiiMax; xii++) {
                                            let xItem = this._xItems[xii];
                                            let xPropLeafColName = this._settings.xProperties.reduce((acc, prop) => {
                                                let xVal = xItem[prop.name];
                                                (xVal) && (acc = acc + ('' === acc ? xVal : '||' + xVal));
                                                return acc;
                                            }, '');
                                            const summaryKey = ('' === xPropLeafColName) ? zpiProp.name : xPropLeafColName + '||' + zpiProp.name;
                                            html.push('<td>');
                                            html.push(this.getSummaryValue(_this.summaryMap[summaryKey]));
                                            html.push('</td>');
                                        }	// end for - xii

                                        html.push('</tr>');
                                    }   // end for - zpi
                                }
                                // 요약 정보 타이틀 설정 - End
                 */
            }
            html.push('</tbody>');

            return html.join('');
        };   // func - generateDownloadTableHorizontal

        /**
         * 다운로드용 Table Contents Rendering 함수
         * > 데이터 표시를 아래 방향으로 함
         */
        Viewer.prototype.generateDownloadTableVertical = function () {

            let _this = this;

            let html = [];
            let xPropMax = this._settings.xProperties.length;
            let yPropMax = this._settings.yProperties.length;
            let zPropMax = this._settings.zProperties.length;

            html.push('<table>');
            html.push('<thead>');
            {
                html.push('<tr>');
                // x/y축 중첩 영역 - Start
                let isShowDataKey = (this._settings.body.showAxisZ) ? 1 : 0;
                let nRowspan = (0 < xPropMax) ? xPropMax + 1 + isShowDataKey : isShowDataKey;
                for (let ypi = 0; ypi < yPropMax; ypi++) {
                    html.push('<th rowspan="' + nRowspan + '" >');
                    html.push(this._settings.yProperties[ypi].name);
                    html.push('</th>');
                }
                // x/y축 중첩 영역 - End
                // x축 헤더 타이틀 영역 - Start
                if (0 < xPropMax) {
                    // xProp 이름 묶음 출력
                    let nColspan = this._xItems.length * this._settings.zProperties.length;
                    html.push('<th colspan="' + nColspan + '" >');
                    html.push(this._settings.xProperties.map(property => property.name).join(" / "));
                    html.push('</th>');
                } else {
                    // zProp 출력
                    if (this._settings.body.showAxisZ) {		// #20161230-01 : 값 필드 표시 방향 선택 기능
                        for (let zpi = 0; zpi < zPropMax; zpi++) {
                            html.push('<th>' + this._settings.zProperties[zpi].name + '</th>');
                        }
                    } else {
                        html.push('<th colspan="' + this._settings.zProperties.length + '" ></th>');
                    }
                }
                // x축 헤더 타이틀 영역 - End
                html.push('</tr>');
            }

            {
                // x축 헤더 영역 - Start
                for (let xpi = 0; xpi < xPropMax; xpi++) {
                    html.push('<tr>');

                    let prevValue = '';
                    let nColspan = 0;
                    for (let xii = 0, nXiiMax = this._xItems.length; xii < nXiiMax; xii++) {
                        let xItem = this._xItems[xii];
                        let propertyName = this._settings.xProperties[xpi].name;
                        let value = common.format(xItem[propertyName], this._settings.xProperties[xpi].digits);
                        if ('' === prevValue || prevValue === value) {
                            prevValue = value;
                            nColspan++;
                            continue;
                        }

                        if (this._settings.body.showAxisZ) {
                            html.push('<th colspan="' + nColspan * zPropMax + '" >');
                        } else {
                            html.push('<th colspan="' + nColspan + '" >');
                        }
                        html.push(prevValue);
                        html.push('</th>');

                        // 이전 정보 저장 ( colspan 을 체크하기 위해 )
                        nColspan = 1;
                        prevValue = value;
                    }	// end for - xii

                    if (this._settings.body.showAxisZ) {
                        html.push('<th colspan="' + nColspan * zPropMax + '" >');
                    } else {
                        html.push('<th colspan="' + nColspan + '" >');
                    }
                    html.push(prevValue);
                    html.push('</th>');

                    html.push('</tr>');
                }	// end for - xpi
                // x축 헤더 영역 - End

                // x축 zProp 영역 - Start
                if (0 < xPropMax && this._settings.body.showAxisZ) {
                    html.push('<tr>');
                    for (let xii = 0, nXiiMax = this._xItems.length; xii < nXiiMax; xii++) {
                        for (let zpi = 0; zpi < zPropMax; zpi++) {
                            // z-axis 추가
                            html.push('<th>' + this._settings.zProperties[zpi].alias + '</th>');
                        }	// end for - zpi
                    }
                    html.push('</tr>');
                }
                // x축 zProp 영역 - End
            }
            html.push('</thead>');

            html.push('<tbody>');
            {
                let predicate = function (a, b, ypi) {
                    for (let i = ypi; i >= 0; i--) {
                        let propertyName = _this._settings.yProperties[i].name;
                        if (a[propertyName] !== b[propertyName]) {
                            return false;
                        }
                    }
                    return true;
                };
                for (let yii = 0, nYiiMax = this._yItems.length; yii < nYiiMax; yii++) {
                    let yItem = this._yItems[yii];
                    html.push('<tr>');

                    // y축 yProp 영역 - Start
                    for (let ypi = 0; ypi < yPropMax; ypi++) {
                        let propertyName = this._settings.yProperties[ypi].name;
                        if (undefined === yItem[propertyName]) {
                            // 값이 없을 때는 셀을 그리지 않는다. ( subtotal 의 하위 셀 경우 )
                            continue;
                        }
                        let value = common.format(yItem[propertyName], this._settings.yProperties[ypi].digits);
                        let nRowspan = 1;
                        if (this._yItems[yii - 1] && predicate(this._yItems[yii - 1], yItem, ypi)) {
                            continue;
                        }
                        for (let i = yii + 1; i < this._yItems.length; i++) {
                            if (predicate(this._yItems[i], yItem, ypi)) {
                                nRowspan++;
                            } else {
                                break;
                            }
                        }

                        if ('TOTAL' === value) {
                            const nColspan = yPropMax;
                            value = !this._settings.calcCellStyle.label || '' === this._settings.calcCellStyle.label
                                ? pivotStyle.summaryLabel[this._settings.calcCellStyle.aggregationType] : this._settings.calcCellStyle.label;
                            html.push('<td colspan="' + nColspan + '" >' + value + '</td>');
                        } else if ('SUB-TOTAL' === value) {
                            const nColspan = (yPropMax - ypi);
                            const subTotalPropName = this._settings.yProperties[ypi - 1].name;
                            const subCellStyle = this._settings.subCalcCellStyle[subTotalPropName.toLowerCase()];
                            // value = common.capitalize(subCellStyle.aggregationType) + '(' + yItem[subTotalPropName] + ')';
                            value = !subCellStyle.label || '' === subCellStyle.label
                                ? pivotStyle.subSummaryLabel[subCellStyle.aggregationType] : subCellStyle.label;
                            html.push('<td colspan="' + nColspan + '" >' + value + '</td>');
                        } else {
                            html.push('<td rowspan="' + nRowspan + '" >' + value + '</td>');
                        }
                    }
                    // y축 yProp 영역 - End

                    // 데이터 영역 ( 피벗 및 부분합 데이터 ) - Start
                    for (let xii = 0, nXiiMax = this._xItems.length; xii < nXiiMax; xii++) {
                        for (let zpi = 0; zpi < zPropMax; zpi++) {
                            let zpiProp = this._settings.zProperties[zpi];
                            let xItem = this._xItems[xii];
                            let context = this._itemsContext;
                            let contains = false;
                            try {
                                for (let i = 0; i < xPropMax; i++) {
                                    const xPropKey = this._settings.xProperties[i].name;
                                    context = context[xItem[xPropKey]];
                                }
                                for (let i = 0; i < yPropMax; i++) {
                                    context = context[yItem[this._settings.yProperties[i].name]];
                                }

                                if (context) {
                                    let itemData = context.item[zpiProp.name];
                                    if (undefined === itemData || null === itemData) {
                                        html.push('<td></td>');
                                    } else {
                                        html.push('<td>' + itemData + '</td>');
                                    }
                                    contains = true;
                                }	// end if - context is valid

                            } catch (e) {
                                console.error(e);
                            }
                            if (!contains) {
                                html.push('<td></td>');
                            }
                        } // end for - zpi
                    }	// end for - xii
                    // 데이터 영역 ( 피벗 및 부분합 데이터 ) - End
                    html.push('</tr>');
                }   // end - yii
            }
            html.push('</tbody>');

            return html.join('');

        };	// func - generateDownloadTableVertical

        /**
         * get download contents ( table markup and all data )
         * @return {string}
         */
        Viewer.prototype.getDownloadContents = function () {
            if (Viewer.DATA_COL_MODE.TOP === this._settings.dataColumnMode) {
                return this.generateDownloadTableVertical();
            } else {
                return this.generateDownloadTableHorizontal();
            }
        };   // func -  getDownloadContents

        /**
         * 스크롤 이벤트 핸들러
         * 스크롤 시 그리드 Rendering을 하기 위한 핸들러
         */
        Viewer.prototype.onScroll = function () {

            let scrollTop = this._elementBody.scrollTop;
            let scrollTopChanged = this._scrollTop !== scrollTop;
            let scrollLeft = this._elementBody.scrollLeft;
            let scrollLeftChanged = this._scrollLeft !== scrollLeft;
            if (scrollTopChanged) {
                this._scrollTop = Math.min(scrollTop, this._scrollTopMax);
            }
            if (scrollLeftChanged) {
                this._scrollLeft = scrollLeft;

                this._elementHead.scrollLeft = this._scrollLeft;
                this._elementHeadFrozen.style.left = this._scrollLeft + "px";
                this._elementBodyFrozen.style.left = this._scrollLeft + "px";
            }
            if (scrollTopChanged || scrollLeftChanged) {
                if (Viewer.DATA_COL_MODE.TOP === this._settings.dataColumnMode) {
                    this.renderDataToVertical();
                } else {
                    this.renderDataToHorizontal();
                }
            }
        }; // func - onScroll

        /**
         * 그리드 사이즈 재조정 함수
         * > 원래 arrange 함수를 호출하면 되지만 Metatron 의 interface를 맞추기 위해 추가함
         */
        Viewer.prototype.resize = function () {
            (this.timer) && (clearTimeout(this.timer));

            const redraw = () => {
                let widthKeys = Object.keys(this._leafColumnWidth);
                let contentSizeWidth = widthKeys.reduce((acc, item) => acc + this._leafColumnWidth[item], 0);
                let currentGridWidth = (this._elementBody.style.width.replace(/px/gi, '') * 1) - (this._elementBodyFrozen.style.width.replace(/px/gi, '') * 1);

                if (contentSizeWidth <= currentGridWidth && 0 < widthKeys.length) {
                    widthKeys.forEach(key => {
                        this._leafColumnWidth[key] = currentGridWidth * (this._leafColumnWidth[key] / contentSizeWidth);
                    });
                }
                this.arrange();
            };

            redraw();

            this.timer = setTimeout(() => redraw(), 200);
        };  // func - resize

        /**
         * 특정 데이터 목록에 대한 요약 정보 계산
         * @param dataList
         * @param summarySettings
         */
        Viewer.prototype.getSummaryValue = function (dataList, summarySettings) {
            //  - Start
            let summaryValue = '';
            if( dataList.some( val => 'number' === typeof val ) ) {
                if (summarySettings && summarySettings.aggregationType) {
                    switch (summarySettings.aggregationType) {
                        case "SUM" :
                            summaryValue = dataList.reduce((acc, val) => acc + Number(val), 0);
                            break;
                        case "AVERAGE":
                            summaryValue = dataList.reduce((acc, val) => acc + Number(val), 0) / dataList.length;
                            break;
                        case "MAX":
                            summaryValue = Math.max.apply(null, dataList);
                            break;
                        case "MIN":
                            summaryValue = Math.min.apply(null, dataList);
                            break;
                        case "COUNT":
                            summaryValue = dataList.reduce((acc, val) => {
                                return acc + ((null === val || undefined === val) ? 0 : 1);
                            }, 0);
                            break;
                    }
                }
            }
            return summaryValue;
        };   // function - getSummaryValue

        Viewer.prototype.arrangeFrozenColumnRelatedElements = function () {
            let _this2 = this;
            let frozenWidthWidthKeys = Object.keys(this._leafFrozenColumnWidth);
            let frozenWidth = frozenWidthWidthKeys.reduce(function (acc, item) {
                return acc + _this2._leafFrozenColumnWidth[item];
            }, 0);

            this._elementHeadWrap.style.left = frozenWidth + "px";
            this._elementBodyWrap.style.left = frozenWidth + "px";

            this._elementHeadFrozen.style.width = frozenWidth + "px";
            this._elementBodyFrozen.style.width = frozenWidth + "px";

            if (_this2._settings.showCalculatedColumnStyle) {
                let widthKeys = Object.keys(this._leafColumnWidth);
                let contentSizeWidth = widthKeys.reduce(function (acc, item) {
                    return acc + _this2._leafColumnWidth[item];
                }, 0);

                this._elementHeadCalculatedColumn.style.left = contentSizeWidth + frozenWidth - 1 + "px";
                // TODO css 로 따로 빼야...
                this._elementHeadCalculatedColumn.style["border-left"] = "1px solid #dddddd";

                this._elementBodyCalculatedColumn.style.left = contentSizeWidth + frozenWidth + "px";
            }
        };

        Viewer.prototype.appendCalculatedColumnDataToSummaryMap = function (column, summaryMap) {
            for (let i = 0; i < column.seriesName.length; i++) {
                let key = _.split(column.seriesName[i], '―').join("||");

                if (key === '') {
                    key = Viewer.EMPTY_Y_AXIS_DIMENSION_KEY;
                }

                summaryMap[key] || (summaryMap[key] = []);

                if (column.value[i]) {
                    summaryMap[key].push(column.value[i])
                }
            }
            ;
        };

        Viewer.prototype.appendBodyCalculatedColumnToHtml = function (summaryMapKey, columnTop, columnHeight, html) {
            let rowAttributes = {};
            rowAttributes["class"] = pivotStyle.cssClass.bodyRow;
            rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.showCalculatedColumnStyle.font);
            rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.showCalculatedColumnStyle.align, 'RIGHT');
            let rowStyles = {};
            rowStyles["width"] = "100%";
            rowStyles["height"] = columnHeight + "px";
            rowStyles["top"] = columnTop + "px;";

            html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

            let columnAttributes = {};
            columnAttributes["class"] = pivotStyle.cssClass.headCell + ' ' + pivotStyle.cssClass.numeric;
            let columnStyles = {};
            columnStyles["height"] = columnHeight + "px";
            columnStyles["width"] = "100%";
            columnStyles["color"] = this._settings.showCalculatedColumnStyle.font.color;
            columnStyles["background-color"] = this._settings.showCalculatedColumnStyle.backgroundColor;

            html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
            html.push(common.numberFormat(this.getSummaryValue(this.summaryMap[summaryMapKey], this._settings.showCalculatedColumnStyle), this._settings.format));

            html.push("</div>");

            html.push("</div>")
        };

        Viewer.prototype.appendHeadCalculatedColumnToHtml = function (index, cellHeight, showLabel, html) {
            let rowAttributes = {};
            rowAttributes["class"] = pivotStyle.cssClass.headRow;
            rowAttributes["class"] = this.addClassFontStyle(rowAttributes["class"], this._settings.showCalculatedColumnStyle.font);
            rowAttributes["class"] = this.addClassTextAlign(rowAttributes["class"], this._settings.showCalculatedColumnStyle.align, 'LEFT');
            let rowStyles = {};
            rowStyles["width"] = "100%";
            rowStyles["height"] = cellHeight + "px";
            rowStyles["top"] = index * cellHeight + "px";
            html.push("<div " + common.attributesString(rowAttributes, rowStyles) + ">");

            let columnAttributes = {};
            columnAttributes["class"] = pivotStyle.cssClass.headCell;
            let columnStyles = {};
            columnStyles["width"] = Viewer.SHOW_CALCULATED_COLUMN_WIDTH + "px";
            columnStyles["height"] = cellHeight + "px";
            columnStyles["color"] = this._settings.showCalculatedColumnStyle.font.color;
            columnStyles["background-color"] = this._settings.showCalculatedColumnStyle.backgroundColor;

            html.push("<div " + common.attributesString(columnAttributes, columnStyles) + ">");
            if (showLabel) {
                html.push(!this._settings.showCalculatedColumnStyle.label || '' === this._settings.showCalculatedColumnStyle.label
                    ? pivotStyle.summaryLabel[this._settings.showCalculatedColumnStyle.aggregationType] : this._settings.showCalculatedColumnStyle.label);
            }
            html.push("</div>");

            html.push("</div>");
        };

        return Viewer;
    }());

    return zs;
}

module.exports = viewer;
