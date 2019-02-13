(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['exports', 'echarts'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    // CommonJS
    factory(exports, require('echarts'));
  } else {
    // Browser globals
    factory({}, root.echarts);
  }
}(this, function (exports, echarts) {
  var log = function (msg) {
    if (typeof console !== 'undefined') {
      console && console.error && console.error(msg);
    }
  };
  if (!echarts) {
    log('ECharts is not Loaded');
    return;
  }

  var colorPalette = [
    '#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80',
    '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa',
    '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
    '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
  ];


  var theme = {
    textStyle: {
      fontFamily: 'TitilliumWeb-Regular'
    },

    color: colorPalette,

    title: {
      textStyle: {
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: 'normal'
      }
    },

    legend: {
      textStyle: {
        fontFamily: 'TitilliumWeb-Regular'
      }
    },

    tooltip: {
      backgroundColor: 'rgba(50,50,50,0.5)',
      textStyle: {
        fontFamily: 'TitilliumWeb-Regular'
      }
    },

    dataZoom: {
      backgroundColor: '#ffffff',
      dataBackgroundColor: '#f0f1fa',
      fillerColor: 'rgba(223, 223, 240, 0.2)',
      handleColor: '#95a1c6'
    },

    grid: {
      borderColor: '#eee'
    },

    categoryAxis: {
      axisLabel: {
        textStyle: {
          fontFamily: 'TitilliumWeb-Regular'
        }
      }
    },

    valueAxis: {
      axisLabel: {
        textStyle: {
          fontFamily: 'TitilliumWeb-Regular'
        }
      }
    }
  };

  // echarts.registerTheme('exntu', theme);
}));
