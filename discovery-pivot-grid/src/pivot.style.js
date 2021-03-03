import 'babel-polyfill';
import * as _ from 'lodash';

function style(zs) {
	let ui = zs.ui;
	let PivotStyle = ui.style;
	let common = zs.ui.common;

	PivotStyle.summaryLabel = {
		SUM: 'Total',
		AVERAGE: 'Average',
		MAX: 'Max',
		MIN: 'Min',
		COUNT: 'Count'
	};

	PivotStyle.subSummaryLabel = {
		SUM : 'Sub Total',
		AVERAGE : 'Sub Total',
		MAX : 'Sub Total',
		MIN : 'Sub Total',
		COUNT : 'Sub Total'
	};

	PivotStyle.cssClass = {
		container: "pivot-view",
		head: "pivot-view-head",
		headWrap: "pivot-view-wrap",
		headFrozen: "pivot-view-frozen",
		headRow: "pivot-view-row",
		headCell: "pivot-view-cell",
		body: "pivot-view-body",
		bodyWrap: "pivot-view-wrap",
		bodyFrozen: "pivot-view-frozen",
		bodyRow: "pivot-view-row",
		bodyCell: "pivot-view-cell",

		// Add Property by eltriny - Start
		axisX: "pivot-axis-x",
		axisY: "pivot-axis-y",
		axisDisable: "pivot-axis-disable",
		axisSelected: "pivot-axis-selected",
		axisSelectedBody: "pivot-axis-selected-body",
		bodySelected: "pivot-body-selected",
		bodyHover: "pivot-body-hover",
		numeric: "numeric",
		// Add Property by eltriny - End
		totalValue: "pivot-total",
		totalValueFrozen: "pivot-total-frozen",
		totalValueWrap: "pivot-total-wrap",
		txtLeft 		 : "ddp-txt-left",
		txtCenter 		 : "ddp-txt-center",
		txtRight 		 : "ddp-txt-right",
		txtTop			 : "ddp-valign-top",
		txtMiddle		 : "ddp-valign-middle",
		txtBottom		 : "ddp-valign-bottom",
		//add steve
		resizeHandle: "pivot-resizable-handle",
		//add harry
		axisXSort: "pivot-axis-x-sort"
	}; // end of PivotStyle.cssClass

	// Add Function by eltriny - Start
	// xAxis 선택에 대한 Vertical Cell 선택 표시를 추가함
	PivotStyle.setStyleVerticalCells = function ($elm, $bodyRow, cellStyle) {

		let parentVal = $elm.attr('data-parent-vals');
		let elmVals = $elm.attr('title');
		let strHierachy = parentVal ? parentVal + '||' + elmVals : elmVals;

		// body cell 스타일 적용
		$bodyRow.find('[data-parent-vals^="' + strHierachy + '"]').addClass(cellStyle);

		/*
          // Body Cell Index 범위 초기값 정의
          let startIdx = 0;
          let endIdx = $elm.css('width').replace( common.__regexpText, '') / cellWidth;

          // 선택 Axis 의 body cell 영역 산정
          $elm.prevAll().each(function(prevIdx, prevElm) {
              let $prevElm = $(prevElm);
              startIdx += $prevElm.css('width').replace( common.__regexpText, '') / cellWidth;
          }); // each - $elm.prevAll
          endIdx += startIdx;

          // xAxis 하위 cell 스타일 적용
          $elm.parent().nextAll().each(function(axisIdx, axisElm) {
              let $axisElm = $(axisElm);
              let currIdx = startIdx;
              while (currIdx < endIdx) {
                  let $target = $axisElm.find('.' + PivotStyle.cssClass.bodyCell + ':eq(' + currIdx + ')');
                  $target.addClass(cellStyle);

                  if (0 === $target.length) {
                      // 그리드데이터 너비보다 적게 그려져서 게산값보다 적은 경우 무한루프를 방지하기 위해 강제적으로 종료
                      break;
                  } else {
                      currIdx += ( $target.css('width').replace( common.__regexpText, '') / cellWidth );
                  }
              }
          });

          // body cell 스타일 적용
          $bodyRow.each(function(rowIdx, rowElm) {
              let $rowElm = $(rowElm);
              for (let idx2 = startIdx; idx2 < endIdx; idx2++) {
                  $rowElm.find('.' + PivotStyle.cssClass.bodyCell + ':eq(' + idx2 + ')').addClass(cellStyle);
              }
          }); // each - $bodyRow
  */
	}; // func - setStyleVerticalCells

	// yAixs 선택에 대한 Horizontal Cell 선택 표시를 추가함
	PivotStyle.setStyleHorizontalCells = function ($elm, $bodyRow, cellStyle) {
		let cellHeight = this._settings.cellHeight;

		// Body Cell Index 범위 초기값 정의
		let startIdx = $elm.parent().prevAll().length;
		let endIdx = startIdx + ($elm.css('height').replace(common.__regexpText, '') / cellHeight);

		// xAxis 하위 cell 스타일 적용
		let heightCnt = $elm.css('height').replace(common.__regexpText, '') / cellHeight;
		$elm.nextAll().each(function (idx, axisElm) {
			let $axisElm = $(axisElm);
			let currTargetKey = $axisElm.attr('data-key');
			let targetCnt = heightCnt;
			while (0 < targetCnt && 0 < $axisElm.length) {
				$axisElm.addClass(cellStyle);
				let currHeightCnt = $axisElm.css('height').replace(common.__regexpText, '') / cellHeight;
				targetCnt -= currHeightCnt;
				$axisElm = $axisElm.parent();
				for (let idx2 = 0; idx2 < currHeightCnt; idx2++) {
					$axisElm = $axisElm.next();
				}
				$axisElm = $axisElm.find("[data-key='" + currTargetKey + "']");
			}
		});

		// body cell 스타일 적용
		for (let idx = startIdx; idx < endIdx; idx++) {
			$bodyRow.eq(idx).addClass(cellStyle);
		}
	}; // func - setStyleHorizontalCells

	// Axis 스타일 적용
	PivotStyle.setClickStyle = function () {

		let objViewer = this;

		// 초기 데이터 정의
		let selectedBodyStyle = PivotStyle.cssClass.bodySelected;
		let selectedAxisStyle = PivotStyle.cssClass.axisSelected;
		let selectAxisBodyStyle = PivotStyle.cssClass.axisSelectedBody;
		let disabledAxisStyle = PivotStyle.cssClass.axisDisable;
		let $container = $(this._element);

		// 기존 스타일 및 정보 제거
		$container.find('.' + selectAxisBodyStyle).removeClass(selectAxisBodyStyle);
		$container.find('.' + selectedAxisStyle).removeClass(selectedAxisStyle);
		$container.find('.' + disabledAxisStyle).removeClass(disabledAxisStyle);
		$container.find('.' + selectedBodyStyle).removeClass(selectedBodyStyle);
		$container.find('[data-selected]').removeAttr('data-selected');

		// 공통 엘레멘트 사전 정의
		let $bodyRow = $container.find('.' + PivotStyle.cssClass.body + ' .' + PivotStyle.cssClass.bodyWrap + ' .' + PivotStyle.cssClass.bodyRow);
		let $xAxis = $container.find('.' + PivotStyle.cssClass.head);
		let $yAxis = $container.find('.' + PivotStyle.cssClass.bodyFrozen);

		// 비활성 처리
		if (this._settings.useSelectStyle) {
			$container.find('[data-disabled=Y]').addClass(disabledAxisStyle);
		}

		// -- #20161227-01 : X/Y축 모두 클릭되도록 기능 추가
		function targetFilter(index, elm, selectedData) {
			let $elm = $(elm);
			let isTarget = true;
			if (selectedData.data === $elm.text() && selectedData.key === $elm.attr('data-key')) {
				if ($elm.is('[data-parent-keys]')) {
					let arrKeys = $elm.attr('data-parent-keys').split('||');
					let arrVals = $elm.attr('data-parent-vals').split('||');
					for (let idx = 0, nMax = arrKeys.length; idx < nMax; idx++) {
						if (arrVals[idx] !== selectedData.parentData[arrKeys[idx]]) {
							isTarget = false;
							break;
						}
					}
				}
			} else {
				isTarget = false;
			}
			return isTarget;
		} // func - targetFilter

		// 멀티 선택
		if (common.SELECT_MODE.MULTI === this._settings.axisSelectMode) {
			for (let idx = 0, nMax = objViewer._axisDataset.length; idx < nMax; idx++) {
				let selectedData = objViewer._axisDataset[idx];
				let $target = $xAxis.find('.' + PivotStyle.cssClass.headCell).filter(function (idx, elm) {
					return targetFilter(idx, elm, selectedData);
				});
				if (0 < $target.length) {
					$target.attr('data-selected', 'Y');
					if (objViewer._settings.useSelectStyle) {
						// 선택 Axis 스타일 적용
						$target.addClass(selectedAxisStyle);
						// 선택 Axis에 대한 body cell 스타일 적용
						PivotStyle.setStyleVerticalCells.apply(objViewer, [$target, $bodyRow, selectAxisBodyStyle]);
					}
				}
			} // for - objViewer._axisDataset

			for (let idx = 0, nMax = objViewer._axisDataset.length; idx < nMax; idx++) {
				let selectedData = objViewer._axisDataset[idx];
				let $target = $yAxis.find('.' + PivotStyle.cssClass.bodyCell).filter(function (idx, elm) {
					return targetFilter(idx, elm, selectedData);
				});
				if (0 < $target.length) {
					$target.attr('data-selected', 'Y');
					if (objViewer._settings.useSelectStyle) {
						// 선택 Axis 스타일 적용
						$target.addClass(selectedAxisStyle);
						// 선택 Axis에 대한 body cell 스타일 적용
						PivotStyle.setStyleHorizontalCells.apply(objViewer, [$target, $bodyRow, selectAxisBodyStyle]);
					}
				}
			} // for - objViewer._axisDataset
		} // end if - axisSelectMode is multi
		// 싱글 선택
		else {
			// X Axis
			if ('X' === this._selectedAxis) {
				for (let idx = 0, nMax = objViewer._axisDataset.length; idx < nMax; idx++) {
					let selectedData = objViewer._axisDataset[idx];
					let $target = $xAxis.find('.' + PivotStyle.cssClass.headCell).filter(function (idx, elm) {
						return targetFilter(idx, elm, selectedData);
					});
					if (0 < $target.length) {
						$target.attr('data-selected', 'Y');
						if (objViewer._settings.useSelectStyle) {
							// 선택 Axis 스타일 적용
							$target.addClass(selectedAxisStyle);
							// 선택 Axis에 대한 body cell 스타일 적용
							PivotStyle.setStyleVerticalCells.apply(objViewer, [$target, $bodyRow, selectAxisBodyStyle]);
						}
					}
				} // for - objViewer._axisDataset
			} // if - selectedAxis is X
			// Y Axis
			else if ('Y' === this._selectedAxis) {
				for (let idx = 0, nMax = objViewer._axisDataset.length; idx < nMax; idx++) {
					let selectedData = objViewer._axisDataset[idx];
					let $target = $yAxis.find('.' + PivotStyle.cssClass.bodyCell).filter(function (idx, elm) {
						return targetFilter(idx, elm, selectedData);
					});
					if (0 < $target.length) {
						$target.attr('data-selected', 'Y');
						if (objViewer._settings.useSelectStyle) {
							// 선택 Axis 스타일 적용
							$target.addClass(selectedAxisStyle);
							// 선택 Axis에 대한 body cell 스타일 적용
							PivotStyle.setStyleHorizontalCells.apply(objViewer, [$target, $bodyRow, selectAxisBodyStyle]);
						}
					}
				} // for - objViewer._axisDataset
			} // if - selectedAxis is Y
		} // end if - axisSelectMode is not multi

		// 데이터 셀 선택 표시 추가 - Start
		let zProp = this._settings.zProperties;
		let $bodyContainer = $container.find('.' + PivotStyle.cssClass.body + ' .' + PivotStyle.cssClass.bodyWrap);
		for (let idx = 0, nMax = this._items.length; idx < nMax; idx++) {
			let objItemInfo = this._items[idx];
			for (let zIdx = 0, zMax = zProp.length; zIdx < zMax; zIdx++) {
				let strKey = zProp[zIdx].name;
				if (objItemInfo.selectInfo && objItemInfo.selectInfo[strKey]) {
					let $elmCell = $bodyContainer.find('.' + PivotStyle.cssClass.bodyCell + '[data-idx=' + idx + '][data-key="' + strKey + '"]');
					$elmCell.addClass(selectedBodyStyle);
				}
			}
		} // end for - _items

		let dataDirectionToVertical = common.DATA_COL_MODE.LEFT === this._settings.dataColumnMode ? 1 : 0;
		let dataDirectionToHorizontal = common.DATA_COL_MODE.TOP === this._settings.dataColumnMode ? 1 : 0;
		let xMax = dataDirectionToVertical * this._xItems.length + dataDirectionToHorizontal * this._xItems.length * this._settings.zProperties.length;
		let yMax = dataDirectionToHorizontal * this._yItems.length + dataDirectionToVertical * this._yItems.length * this._settings.zProperties.length;
		for (let colIdx = 0; colIdx < xMax; colIdx++) {
			for (let rowIdx = 0; rowIdx < yMax; rowIdx++) {
				if (this._bodyCellSelectInfo[colIdx][rowIdx]) {
					$bodyContainer.find('[data-rowIdx=' + rowIdx + ']').addClass(selectAxisBodyStyle);
					$bodyContainer.find('[data-colIdx=' + colIdx + ']').addClass(selectAxisBodyStyle);
					$xAxis.find('[data-colIdx=' + colIdx + ']').addClass(selectAxisBodyStyle);
					$yAxis.find('[data-rowIdx=' + rowIdx + ']').addClass(selectAxisBodyStyle);
				}
			} // end for - rowIdx
		} // end for - colIdx
		// 데이터 셀 선택 표시 추가 - End
	}; // function - setClickStyle

	// get clicked axis data
	PivotStyle.getSelectedAxisData = function ($elm, eventAxis, $eventAxisElm, $otherAxisElm) {

		// let axisGroup = ( 'X' === eventAxis ) ? this._xAxisGroup : this._yAxisGroup;

		let evtData = null;
		let elmKey = $elm.attr('data-key');
		let elmData = $elm.attr('title');
		let isSelect = false;

		if (!_.isEmpty(_.find(this._settings.zProperties, function (o) {
			return _.eq(o.name, elmData);
		}))) {
			return;
		}

		// 상위 축 정보 객체 생성 - Start
		let objParentData = {};
		let existParent = false;
		if ($elm.is('[data-parent-keys]')) {
			existParent = true;
			let arrKeys = $elm.attr('data-parent-keys').split('||');
			let arrVals = $elm.attr('data-parent-vals').split('||');
			for (let idx = 0, nMax = arrKeys.length; idx < nMax; idx++) {
				objParentData[arrKeys[idx]] = arrVals[idx];
			}
		}
		// 상위 축 정보 객체 생성 - End

		// -- #20161227-01 : X/Y축 모두 클릭되도록 기능 추가
		// 다른 축 선택이 허용일때 다른 축이 선택되어 있을 경우, 선택을 해제하고 데이터를 초기화 한다.
		if (common.SELECT_MODE.SINGLE === this._settings.axisSelectMode && eventAxis !== this._selectedAxis) {
			this._axisDataset = [];
		} // if - axisSelectMode is SINGLE

		this._selectedAxis = eventAxis; // 선택 선택축 저장

		if ('Y' === $elm.attr('data-selected')) {

			isSelect = false;

			// 선택된 데이터 삭제
			let selectedIdx = -1;
			for (let _idx = 0, _nMax = this._axisDataset.length; _idx < _nMax; _idx++) {
				let objData = this._axisDataset[_idx];
				// 20170811 Dolkkok - 중복체크시 부모 key/value 도 확인
				if (objData.data === elmData && _.isMatch(objData.parentData, objParentData)) {
					selectedIdx = _idx;
					break;
				} // if - equal data.key
			} // for - this._axisDataset
			if (-1 < selectedIdx) {
				this._axisDataset.splice(selectedIdx, 1);
			}
		} // if - selected Axis
		else {

			isSelect = true;

			// 선택된 데이터 추가
			let existData = false;
			for (let _idx2 = 0, _nMax2 = this._axisDataset.length; _idx2 < _nMax2; _idx2++) {
				let _objData = this._axisDataset[_idx2];
				// 20170811 Dolkkok - 중복체크시 부모 key/value 도 확인
				if (_objData.data === elmData && _.isMatch(_objData.parentData, objParentData)) {
					existData = true;
					break;
				} // if - equal data.key
			} // for - this._axisDataset
			if (!existData) {
				this._axisDataset.push({
					key: elmKey,
					data: elmData,
					parentData: existParent ? objParentData : null // 상위 축 정보
				});
			}
		} // if - non-selected Axis

		// -- #20161227-01 : X/Y축 모두 클릭되도록 기능 추가
		// 다른 축 선택 여부 체크
		if (common.SELECT_MODE.ONESIDE === this._settings.axisSelectMode) {
			if (0 < this._axisDataset.length) {
				this._selectedAxis = eventAxis;
				$otherAxisElm.attr('data-disabled', 'Y');
			} else {
				this._axisDataset = [];
				this._selectedAxis = null;
				$otherAxisElm.removeAttr('data-disabled');
			}
		} // if - axisSelectMode is ONESIDE

		// 반환 데이터 설정
		if (this._settings.cumulativeClick) {
			evtData = { selectData: this._axisDataset };
		} // if - cumulativeClick
		else {
			evtData = {
				key: elmKey,
				data: elmData,
				isSelect: isSelect,
				parentData: existParent ? objParentData : null // 상위 축 정보
			};
		} // if - not cumulativeClick

		// 스타일 적용
		PivotStyle.setClickStyle.apply(this);

		return evtData;
	}; // function - getSelectedAxisData
	// Add Function by eltriny - End

	return zs;
}

module.exports = style;
