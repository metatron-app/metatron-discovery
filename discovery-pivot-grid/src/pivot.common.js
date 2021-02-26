const style = require('./pivot.style');

function zs() {
    var zs = {
        ui: {
            common: {},
            style: {}
        }
    };
    var ui = zs.ui;
    var common = ui.common;

    // 필드 구분자
    common.__fieldSeparator = '@@>>';

    common.__regexpComma = /(\d{1})(\d{3}[,.])/;
    common.__regexpText = /\D/gi;

    // #20161227-01 : X/Y축 모두 클릭되도록 기능 추가
    common.SELECT_MODE = {
        'ONESIDE': 'ONESIDE',
        'SINGLE': 'SINGLE',
        'MULTI': 'MULTI'
    };

    // #20161230-01 : 값 필드 표시 방향 선택 기능
    common.DATA_COL_MODE = {
        'TOP': 'TOP',
        'LEFT': 'LEFT'
    };

    // #20210225-01 - harry : 정렬 타입 선택 기능
    common.SORT_COL_MODE = {
        'NONE': 'NONE',
        'ASC': 'ASC',
        'DESC': 'DESC'
    };

    common.capitalize = function (str) {
        if (typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };  // func - capitalize

    /**
     *
     */
    common.attributesString = function (attributes, styles) {
        if (styles) {
            var ssb = [];
            for (var key in styles) {
                if (styles.hasOwnProperty(key)) {
                    ssb.push(key + ":" + styles[key] + ";");
                }
            }
            attributes["style"] = ssb.join("");
        }
        var sb = [];
        for (var name in attributes) {
            if (attributes.hasOwnProperty(name)) {
                sb.push(name + "=\"" + attributes[name] + "\"");
            }
        }
        return sb.join(" ");
    }; // func - attributesString

    /**
     *
     */
    common.hasCssClass = function (element, cssClass) {
        var currentCssClass = " " + element.className + " ";
        return currentCssClass.indexOf(" " + cssClass + " ") !== -1;
    }; // func - hasCssClass

    /**
     *
     */
    common.removeCssClass = function (element, cssClass) {
        var currentCssClass = " " + element.className + " ";
        var index = currentCssClass.indexOf(" " + cssClass + " ");
        if (index !== -1) {
            element.className = (currentCssClass.substr(0, index) + " " + currentCssClass.substring(index + cssClass.length + 1, currentCssClass.length).trim()).trim();
            return true;
        }
        return false;
    }; // func - removeCssClass

    /**
     *
     */
    common.addCssClass = function (element, cssClass) {
        if (this.hasCssClass(element, cssClass)) {
            return;
        }
        if (element.className) {
            element.className += " " + cssClass;
        } else {
            element.className = cssClass;
        }
    }; // func - addCssClass

    /**
     *
     */
    common.format = function (value, digits) {

        const addComma = function (num, scope) {
            do {
                num = num.replace(scope.__regexpComma, '$1,$2');
            } while (scope.__regexpComma.test(num));
            return num;
        };

        if (digits === void 0) {
            digits = 2;
        }
        if (typeof (value) !== 'number') {
            return value;
        }
        if (value == null || isNaN(value)) {
            return '';
        }

        let numArray = String(value).split('.');
        numArray[0] += '.';

        numArray[0] = addComma(numArray[0], this);
        if (numArray.length > 1) {
            // return numArray[0] + ((numArray[1].length > digits) ? numArray[1].substring(0, digits) : numArray[1]);

            //소수점 셋째자리에서 반올림으로 변경
            if (numArray[1].length > digits) {
                return addComma(value.toFixed(2), this);
            } else {
                return numArray[0] + numArray[1];
            }
        } else {
            return numArray[0].substr(0, numArray[0].length - 1);
        }
    }; // func - format

    /**
     * 소수점을 반올림 한다.
     * @param value
     * @param format
     * @return {*}
     */
    common.roundFloat = function (value, format) {
        let result = value;
        if (format.type !== 'exponent10') {
            result = Math.round(Number(value) * Math.pow(10, format.decimal)) / Math.pow(10, format.decimal);
        }
        return result.toFixed(format.decimal);
    };

    /**
     * 포맷 옵션에 해당하는 값으로 변환한다.
     * @param value
     * @param paramFormat
     * @param fieldType {Optional}
     * @returns {*}
     */
    common.numberFormat = function (value, paramFormat, fieldType ) {

        if (undefined === value || null === value || !paramFormat) return;

        if (typeof (value) !== 'number') {
            return value;
        }

        let format = JSON.parse( JSON.stringify(paramFormat));
        if( fieldType && 'INTEGER' === fieldType.toUpperCase() ) {
            format.decimal = 0;
        }

        const customSymbol = format.customSymbol;
        const originalValue = _.cloneDeep(value);

        // 수치표기 약어설정
        if (format.abbr && format.type != 'exponent10') {
            switch (format.abbr) {
                case 'AUTO':
                    value = value > 1000000000 ? Number(value) / 1000000000 : value > 1000000 ? Number(value) / 1000000 : value > 1000 ? Number(value) / 1000 : value;
                    break;
                case 'KILO':
                    value = Number(value) / 1000;
                    break;
                case 'MEGA':
                    value = Number(value) / 1000000;
                    break;
                case 'GIGA':
                    value = Number(value) / 1000000000;
                    break;
            }
        }
        // 퍼센트
        else if (!customSymbol && format.type == 'percent') {
            value = value * 100;
        }

        // 소수점 자리수
        value = this.roundFloat(value, format);

        // 천단위 표시여부
        if (format.type !== 'exponent10' && format.useThousandsSep) {

            let arrSplitFloatPoint = String(value).split('.');

            // Decimal Separation
            let floatValue = '';
            if (1 < arrSplitFloatPoint.length) {
                floatValue = arrSplitFloatPoint[1];
            }

            // Thousand units
            value = arrSplitFloatPoint[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            // Append Decimal
            if ('' !== floatValue) {
                value += '.' + floatValue;
            }
        }

        // Add decimal zero
        if (value && format.type != 'exponent10' && format.decimal > 0) {
            let stringValue = value + '';
            if (stringValue.indexOf('.') == -1) {
                value += '.';
                for (let num = 0; num < format.decimal; num++) {
                    value += '0';
                }
            } else {
                for (let _num = stringValue.split('.')[1].length; _num < format.decimal; _num++) {
                    value += '0';
                }
            }
        }

        // 수치표기 약어설정
        if (format.abbr && format.type != 'exponent10') {
            switch (format.abbr) {
                case 'AUTO':
                    value += originalValue > 1000000000 ? "B" : originalValue > 1000000 ? "M" : originalValue > 1000 ? "K" : "";
                    break;
                case 'KILO':
                    value += 'K';
                    break;
                case 'MEGA':
                    value += 'M';
                    break;
                case 'GIGA':
                    value += 'B';
                    break;
            }
        }

        // 통화
        if ((!customSymbol || customSymbol.value.trim().length == 0) && format.type == 'currency') {
            switch (format.sign) {
                case 'KRW':
                    value = '₩ ' + value;
                    break;
                case 'USD':
                    value = '$ ' + value;
                    break;
                case 'USCENT':
                    value = '￠ ' + value;
                    break;
                case 'GBP':
                    value = '£ ' + value;
                    break;
                case 'JPY':
                    value = '¥ ' + value;
                    break;
                case 'EUR':
                    value = '€ ' + value;
                    break;
            }
        }
        // 퍼센트
        else if ((!customSymbol || customSymbol.value.trim().length == 0) && format.type == 'percent') {
            value = value + '%';
        }
        // 지수
        else if (format.type == 'exponent10') {
            value = Number(value).toExponential(format.decimal);
        }

        // 사용자 기호 , value값이 빈값이 아닐때
        if (customSymbol && customSymbol.value.trim().length > 0) {

            const symbolValue = customSymbol.value.trim();

            // front / back에 따라서 customsymbol 설정
            value = 'BEFORE' == customSymbol.pos ? symbolValue + value : value + symbolValue;
        }

        return value;
    };

    zs = style(zs);

    return zs;
};

module.exports = zs;
