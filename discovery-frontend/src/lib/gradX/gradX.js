;

/*
 *
 * SAMPLE USAGE DETAILS :
 *
 * sliders structure :
 *
 * [
 *  {
 *     color: "COLOR",
 *     position: "POSITION" //0 to 100 without % symbol
 *  },
 *  {
 *     ....
 *     ....
 *  },
 *  ....
 * ]
 *
 */

'use strict';

//make me jquery UI  independent
if (typeof jQuery.fn.draggable === "undefined") {

    (function($) {

        $.fn.draggable = function() {
            var ele = document.getElementById(this.attr("id"));

            ele.style.top = "121px";
            // Drag.init(ele, null, 26, 426, 86, 86, false, false);
            return this;
        };

    }(jQuery));

}

var gradx = {};

var gradX = function(id, _options) {


    var options = {
        targets: [], //[element selector] -> array
        sliders: [],
        direction: 'left',
        //if linear left | top | right | bottom
        //if radial left | center | right , top | center | bottom
        type: 'linear', //linear | circle | ellipse
        code_shown: false, //false | true
        change: function(sliders, styles) {
            //nothing to do here by default
        }
    };

    //make global
    gradx = {
        rand_RGB: [],
        rand_pos: [],
        id: null,
        slider_ids: [],
        slider_index: 0, //global index for sliders
        sliders: [], //contains styles of each slider
        min: null,  // slider의 min value
        max: null,  // slider의 max value
        positionMin: -4, // slider의 위치 min value
        positionMax: 215, // slider의 위치 min value
        separateValue: 10, // slider를 쪼개는 개수
        diffValue: null, // 개당의 slider값
        diffpositionValue: null, // 개당의 slider position값
        deleteLength: 2, // slider의 개수 n개이하일때 delete 버튼 hide
        deleteIndexList: [], // 삭제된 index 리스트, 슬라이더 생성시 사용
        direction: "left", //direction of gradient or position of centre in case of radial gradients
        type: "linear", //linear or radial
        shape: "cover", //radial gradient size
        slider_hovered: [],
        jQ_present: true,
        code_shown: false,
        load_jQ: function() {

            //handle any library conflicts here
            this.gx = jQuery;
        },
        //very lazy to replace this by jQuery
        add_event: function(el, evt, evt_func) {
            add_event(el, evt, evt_func);
        },
        add_new_range_index: function(index) {

          var position = gradx.sliders[index][2] + gradx.diffpositionValue;
          gradx.add_new_range(position);
        },
        // 새로운 슬라이더를 만들고 설정값 변경
        add_new_range: function(position) {

          // 가까운 위치의 색상값을 리턴
          var color = get_close_color(position);

          // position을 separateValue로 나뉜 해당위치에 설정, value값을 구하기
          var obj = get_position_value_byposition(position);

          // validation
          // 같은 position, value가 존재하는경우 return false
          var result = duplicatePositionCheck(obj.position, obj.value);

          // validation 통과하는경우에만 진행
          if (result.isValid) {

            gradx.add_slider([
              {
                color: color,
                position: obj.position, //no % symbol
                value: obj.value
              }
            ]);

            // 현재의 hover아이콘은 -으로 변경
            changeSliderIcon(obj.position);

            gradx.update_style_array();

            gradx.add_select_class(gradx.current_slider_id);

            // sliders가 설정된 개수보다 많은경우 +버튼 display none 설정
            if (gradx.sliders.length >= gradx.separateValue) {
              $('.gradx_panel').find('.ddp-hover').css('display', 'none');
            }
          }
        },
        delete_range: function(currentSliderId) {

          gradx.current_slider_id = currentSliderId;

          // 선택된 클래스 제거
          gradx.gx('.gradx_slider').removeClass('sp-active');

          delete_slider();
        },
        // 현재 선택된 slider의 value값 변경
        change_value_current_index: function(value) {

          // max보다 크거나 min보다 작을때
          if (gradx.max < gradx.gx(event.target).val() || gradx.min > value) {

            // value값 재설정, 선택클래스 설정
            gradx.add_select_class(gradx.current_slider_id);
            return;
          }

          // 해당 입력값의 seperateValue로 나눈값의 근처로 이동
          var obj = get_value_position_byvalue(value);

          if (isNaN(obj.position) || isNaN(obj.value)) {
            return;
          }

          // 입력된 해당값이 없는경우 해당 위치로 이동
          if (duplicatePositionCheck(obj.position, obj.value)['isValid']) {

            var slider = gradx.get_current_slider(gradx.current_slider_id);

            // slider 리스트에도 재설정
            slider[3] = obj.value;
            slider[2] = obj.position;

            gradx.gx(gradx.current_slider_id).css("left", obj.position);
            // input이 따라다니게 left설정
            gradx.gx(gradx.current_slider_id).parent().find('.ddp-data-num').css('left', gradx.gx(gradx.current_slider_id).css('left'));

            // array update
            gradx.update_style_array();

            // value값 재설정, 선택클래스 설정
            gradx.add_select_class(gradx.current_slider_id);
          }
        },
        /**
         * 선택 클래스 설정
         * @param sliderId
         * @param deleteShowFl 삭제버튼 show / hide 여부
         */
        add_select_class: function(sliderId) {
          // 현재 슬라이더값 가져오기
          var currentSlider = gradx.get_current_slider(sliderId);

          // 다른 선택된 클래스 제거
          gradx.gx('.gradx_slider').removeClass('sp-active');
          // 선택클래스 추가
          gradx.gx(currentSlider[4]).addClass('sp-active');

          // 현재 슬라이더 아이값 설정
          gradx.current_slider_id = sliderId;

          var currentSliderValue = addComma(parseInt(currentSlider[3].toFixed(0)));
          gradx.apply_style(gradx.panel, gradx.get_style_value(), currentSliderValue);//(where,style)
        },
        /**
         * 현재 선택된 슬라이더에 해당되는않는경우 선택클래스 모두해제
         */
        remove_select_class: function(sliderId) {

          // 현재 선택된 슬라이더 id설정
          gradx.current_slider_id = sliderId;

          // 다른 선택된 클래스 제거
          gradx.gx('.gradx_slider').removeClass('sp-active');

          // 선택된 slider에 선택 클래스 적용
          gradx.gx(gradx.current_slider_id).addClass('sp-active');
        },
        get_random_position: function() {
            var pos;

            do {
                pos = parseInt(Math.random() * 100);
            }
            while (this.rand_pos.indexOf(pos) > -1);

            this.rand_pos.push(pos);
            return pos;

        },
        // 선택된 slider id의 색상을 변경
        set_slider_id_color: function(sliderId, color) {

          gradx.gx(sliderId).css('background-color', color);
          gradx.update_style_array();
          gradx.apply_style(gradx.panel, gradx.get_style_value());
        },
        get_random_rgb: function() {

            var R, G, B, color;

            do {
                R = parseInt(Math.random() * 255);
                G = parseInt(Math.random() * 255);
                B = parseInt(Math.random() * 255);

                color = "rgb(" + R + ", " + G + ", " + B + ")";
            }
            while (this.rand_RGB.indexOf(color) > -1);

            this.rand_RGB.push(color);
            return color;

        },
        //if target element is specified the target's style (background) is updated
        update_target: function(values) {

            if (this.targets.length > 0) {
                //target elements exist

                var i, j, ele, len = this.targets.length, v_len = values.length;
                for (i = 0; i < len; i++) {
                    ele = gradx.gx(this.targets[i]);

                    for (j = 0; j < v_len; j++) {
                        ele.css("background-image", values[j]);
                    }

                }
            }
        },
        // 해당 slider id에 해당하는 slider값 리턴
        get_current_slider: function(sliderId) {
          for (var num = 0; num < gradx.sliders.length; num++) {

            var item = gradx.sliders[num];

            var index = item.indexOf(sliderId);
            if (-1 !== index) {
              return item;
            }
          }
        },
        //apply styles on fly
        apply_style: function(ele, value, currentSliderValue) {

            var type = 'linear';

            if (gradx.type != 'linear') {
                type = 'radial';
            }

            if (value.indexOf(this.direction) > -1) {
                //add cross-browser compatibility
                var values = [
                    "-webkit-" + type + "-gradient(" + value + ")",
                    "-moz-" + type + "-gradient(" + value + ")",
                    "-ms-" + type + "-gradient(" + value + ")",
                    "-o-" + type + "-gradient(" + value + ")",
                    type + "-gradient(" + value + ")"
                ];
            } else {
                //normal color
                values = [value];
            }



            var len = values.length, css = '';

            while (len > 0) {
                len--;
                ele.css("background", values[len]);
                css += "background: " + values[len] + ";\n";
            }

            //call the userdefined change function

            this.change(changeSliderTypeList(this.sliders), values, changeSliderTypeList(fill_empty_list()), currentSliderValue);
            this.update_target(values);


            gradx.gx('#gradx_code').html(css);

        },
        // 고르게 분포되게 설정
        equalize_slider: function() {

          // seperateValue에서 개당 차이나는값을 구하기
          // var multiple = parseInt(gradx.separateValue / gradx.sliders.length);
          var positionValue = gradx.positionMax / (gradx.sliders.length - 1);

          var originValue = gradx.max / (gradx.sliders.length - 1);
          // var addPosValue = (gradx.positionMax + Math.abs(gradx.positionMin)) / (gradx.sliders.length - 1);
          var addValue = (gradx.max - Math.abs(gradx.min)) / (gradx.sliders.length - 1);

          var maxValue = JSON.parse(JSON.stringify(gradx.max));
          var maxPosValue = JSON.parse(JSON.stringify(gradx.positionMax));

          for (var num = gradx.sliders.length - 1; num >= 0; num--) {

            // 최소값
            if (0 == num) {

              // position
              gradx.sliders[num][3] = gradx.min;
              // value
              gradx.sliders[num][2] = gradx.positionMin;

              // 최대값
            } else if (gradx.sliders.length - 1 == num) {

              // position
              gradx.sliders[num][3] = gradx.max;
              // value
              gradx.sliders[num][2] = gradx.positionMax;
              // 그이외의값
            } else {
              // position
              gradx.sliders[num][2] = Math.round(positionValue * num);

              // value
              gradx.sliders[num][3] = Math.round(originValue * num);
            }

            // left값에 적용
            gradx.gx(gradx.sliders[num][4]).css("left", gradx.sliders[num][2]);
          }

          gradx.update_style_array();
          // apply
          gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)

          // var addPosValue = (gradx.positionMax + Math.abs(gradx.positionMin)) / (gradx.sliders.length - 1);
          // var addValue = (gradx.max - Math.abs(gradx.min)) / (gradx.sliders.length - 1);
          //
          // var maxValue = JSON.parse(JSON.stringify(gradx.max));
          // var maxPosValue = JSON.parse(JSON.stringify(gradx.positionMax));
          //
          // for (var num = gradx.sliders.length - 1; num >= 0; num--) {
          //
          //   // 최소값
          //   if (0 == num) {
          //
          //     // position
          //     gradx.sliders[num][3] = gradx.min;
          //     // value
          //     gradx.sliders[num][2] = gradx.positionMin;
          //
          //   // 최대값
          //   } else if (gradx.sliders.length - 1 == num) {
          //
          //     // position
          //     gradx.sliders[num][3] = gradx.max;
          //     // value
          //     gradx.sliders[num][2] = gradx.positionMax;
          //   // 그이외의값
          //   } else {
          //     // position
          //     maxPosValue = Math.round(maxPosValue - addPosValue);
          //     gradx.sliders[num][2] = maxPosValue;
          //
          //     // value
          //     maxValue = Math.round(maxValue - addValue);
          //     gradx.sliders[num][3] = maxValue;
          //   }
          //
          //   // left값에 적용
          //   gradx.gx(gradx.sliders[num][4]).css("left", gradx.sliders[num][2]);
          // }
          //
          // gradx.update_style_array();
          // // apply
          // gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)
        },
        //on load
        apply_default_styles: function(intialize) {

            this.update_style_array(intialize);
            var value = this.get_style_value();
            this.apply_style(this.panel, value);
            // 삭제된 indexList만들기
            set_delete_index_list();
        },
        //update the slider_values[] while dragging
        update_style_array: function(initialize) {

            // 최초로 sliders 설정시에는 sort를 진행하지 않음
            if (!initialize) {
              // index에 따라서 sort
              this.sliders.sort(function(prev, next) {return parseInt(prev[4].split('#gradx_slider_')[1]) - parseInt(next[4].split('#gradx_slider_')[1])});
            }

            gradx.slider_ids.sort();

            var sliders = this.sliders;

            this.sliders = [];

            var len = gradx.slider_ids.length,
                    i, offset, position, id, index, selectedSlider, value;

            for (i = 0; i < len; i++) {
                id = "#" + gradx.slider_ids[i];
                index = id.split('#gradx_slider_')[1];
                offset = parseInt(gradx.gx(id).css("left"));

                position = parseInt((offset / gradx.container_width) * 100);

                selectedSlider = sliders[i];
                value = selectedSlider ? undefined == selectedSlider.value ? selectedSlider[3] : selectedSlider.value : null;
                gradx.sliders.push([gradx.gx(id).css("background-color"), position, offset, value, id]);
            }

            this.sliders.sort(function(A, B) {
                if (A[1] > B[1])
                    return 1;
                else
                    return -1;
            });
        },
        //creates the complete css background value to later apply style
        get_style_value: function() {

            var len = gradx.slider_ids.length;

            if (len === 1) {
                //since only one slider , so simple background

                style_str = this.sliders[0][0];
            } else {
                var style_str = "", suffix = "";
                for (var i = 0; i < len; i++) {
                    if (this.sliders[i][1] == "") {
                        style_str += suffix + (this.sliders[i][0]);

                    } else {
                        if (this.sliders[i][1] > 100) {
                            this.sliders[i][1] = 100;
                        }
                        style_str += suffix + (this.sliders[i][0] + " " + this.sliders[i][1] + "%");

                    }
                    suffix = " , "; //add , from next iteration
                }

                if (this.type == 'linear') {
                    //direction, [color stoppers]
                    style_str = this.direction + " , " + style_str; //add direction for gradient
                } else {
                    //position, type size, [color stoppers]
                    style_str = this.direction + " , " + this.type + " " + this.shape + " , " + style_str;
                }
            }

            return style_str;
        },
        //@input rgb string rgb(<red>,<green>,<blue>)
        //@output rgb object of form { r: <red> , g: <green> , b : <blue>}
        get_rgb_obj: function(rgb) {

            //rgb(r,g,b)
            rgb = rgb.split("(");
            //r,g,b)
            rgb = rgb[1];
            //r g b)
            rgb = rgb.split(",");

            return {
                r: parseInt(rgb[0]),
                g: parseInt(rgb[1]),
                b: parseInt(rgb[2])
            };

        },
        load_info: function(ele) {

            var id = "#" + ele.id;
            this.current_slider_id = id;
            //check if current clicked element is an slider
            if (this.slider_ids.indexOf(ele.id) > -1) { //javascript does not has # in its id

                var color = gradx.gx(id).css("backgroundColor");
                //but what happens if @color is not in RGB ? :(
                var rgb = this.get_rgb_obj(color);

                var left = gradx.gx(id).css("left");
                if (parseInt(left) > 0 && parseInt(left) < 250) {
                    gradx.gx("#gradx_slider_info") //info element cached before
                            .css("left", left)
                            .show();

                }

                this.set_colorpicker(rgb);
            }

        },
        //add slider
        add_slider: function(sliders) {

            var id, id2, slider, k, position, value, delta;


            if (sliders.length === 0) {
                sliders = [//default sliders
                    {
                        color: gradx.get_random_rgb(),
                        position: gradx.get_random_position() //x percent of gradient panel(400px)
                    },
                    {
                        color: gradx.get_random_rgb(),
                        position: gradx.get_random_position()
                    }
                ];

            }

            var obj = sliders;

            for (k in obj) {

                if (typeof obj[k].position === "undefined")
                    break;

                //convert % to px based on containers width
                //   var delta = -2; //range: 26px tp 426px
                var delta = 0; //range: 26px tp 426px
                // position = parseInt((obj[k].position * this.container_width) / 100) + delta + "px";
                position = obj[k].position + delta + 'px';
                // deleteIndexList가 있는경우 첫번째값으로 index 설정
                var slider_index = "gradx_slider_" + this.slider_index;
                if (gradx.deleteIndexList && gradx.deleteIndexList.length > 0) slider_index = gradx.deleteIndexList.shift();

                id = slider_index; //create an id for this slider

                // 현재 slider id 설정
                gradx.current_slider_id = '#' + id;

                this.sliders.push(
                        [
                            obj[k].color,
                            null,
                            obj[k].position,
                            obj[k].value,
                            '#' + id
                        ]
                        );

                this.slider_ids.push(id); //for reference wrt to id

                slider = "<div class='wrap-grax-slider'><div class='gradx_slider' id='" + id + "'><div class='gradx_slider_in'></div></div></div>";
                gradx.gx("#gradx_start_sliders_" + this.id).append(slider);
                gradx.gx('#' + id).css("left", position).css("backgroundColor", obj[k].color);

                // 현재의 hover아이콘은 -으로 변경
                changeSliderIcon(obj[k].position);

                this.slider_index++;
            }

            for (var i = 0, len = this.slider_ids.length; i < len; i++) {

                gradx.gx('#' + this.slider_ids[i]).draggable({
                    containment: 'parent',
                    axis: 'x',
                    start: function() {
                        if (gradx.jQ_present)
                            gradx.current_slider_id = "#" + gradx.gx(this).attr("id"); //got full jQuery power here !

                      // input이 따라다니게 left설정
                      gradx.gx(gradx.current_slider_id).parent().find('.ddp-data-num').css('left', gradx.gx(gradx.current_slider_id).css("left"));
                    },
                    drag: function() {
                    },
                    stop: function(item) {

                      event.preventDefault();
                      // position을 separateValue로 나뉜 해당위치에 설정, value값을 구하기
                      var obj = get_position_value_byposition(item.target.offsetLeft + 1);

                      // validation
                      // 같은 position, value가 존재하는경우 return false
                      var result = duplicatePositionCheck(obj.position, obj.value);

                      // validation 통과하는경우에만 진행
                      if (result.isValid) {

                        // slider 리스트에도 재설정
                        var slider = gradx.get_current_slider(gradx.current_slider_id);

                        // 이전의 hover아이콘은 +으로 변경
                        changeSliderIcon(slider[2], true);

                        // 현재의 hover아이콘은 -으로 변경
                        changeSliderIcon(obj.position);

                        slider[3] = obj.value;
                        slider[2] = obj.position;

                        // 해당 position 위치로 설정
                        gradx.gx(gradx.current_slider_id).css('left', obj.position);

                        gradx.update_style_array();

                        // 추가된 slider의 앞에 추가할 수 있는 slider 개수설정, 0일때 더이상 추가불가
                        for (var num = 0; num < gradx.sliders.length; num++) {

                          // 같은 slider일때 해당 앞의 slider 개수 설정
                          if (gradx.current_slider_id == gradx.sliders[num][4]) {
                            gradx.sliders[num][6] = num;
                          }
                        }

                        gradx.add_select_class(gradx.current_slider_id);

                      // validation 통과가 안되는경우 기존값으로 설정
                      } else {

                        var currentSlider = gradx.get_current_slider(gradx.current_slider_id);
                        gradx.gx(gradx.current_slider_id).css('left', currentSlider[2]);
                      }
                    }

                }).click(function() {
                    // gradx.load_info(this);
                    // return false;
                });
            }


        },
        set_colorpicker: function(clr) {
            gradx.cp.spectrum({
                move: function(color) {
                    if (gradx.current_slider_id != false) {
                        var rgba = color.toRgbString();
                        gradx.gx(gradx.current_slider_id).css('background-color', rgba);
                        gradx.update_style_array();
                        gradx.apply_style(gradx.panel, gradx.get_style_value());
                    }
                },
                change: function() {
                    gradx.gx("#gradx_slider_info").hide();
                },
                flat: true,
                showAlpha: true,
                color: clr,
                clickoutFiresChange: true,
                showInput: true,
                showButtons: false

            });
        },
        generate_options: function(options) {

            var len = options.length,
                    name, state,
                    str = '';

            for (var i = 0; i < len; i++) {

                name = options[i].split(" ");

                name = name[0];

                if (i < 2) {
                    state = name[1];
                } else {
                    state = '';
                }

                name = name.replace("-", " ");

                str += '<option value=' + options[i] + ' ' + state + '>' + name + '</option>';

            }

            return str;
        },
        generate_radial_options: function() {

            var options;
            options = ["horizontal-center disabled", "center selected", "left", "right"];
            gradx.gx('#gradx_gradient_subtype').html(gradx.generate_options(options));

            options = ["vertical-center disabled", "center selected", "top", "bottom"];
            gradx.gx('#gradx_gradient_subtype2').html(gradx.generate_options(options)).show();

        },
        generate_linear_options: function() {

            var options;
            options = ["horizontal-center disabled", "left selected", "right", "top", "bottom"];
            gradx.gx('#gradx_gradient_subtype').html(gradx.generate_options(options));

            gradx.gx('#gradx_gradient_subtype2').hide();

        },
        destroy: function() {
            var options = {
                targets: [], //[element selector] -> array
                sliders: [],
                direction: 'left',
                //if linear left | top | right | bottom
                //if radial left | center | right , top | center | bottom
                type: 'linear', //linear | circle | ellipse
                code_shown: false, //false | true
                change: function(sliders, styles) {
                    //nothing to do here by default
                }
            };

            for (var k in options) {
                gradx[k] = options[k];
            }
        },
        load_gradx: function(id, sliders) {
            this.me = gradx.gx(id);
            this.id = id.replace("#", "");
            id = this.id;
            this.current_slider_id = false;
            var html = "<div class='gradx'>\n\
                        <div id='gradx_add_slider' class='gradx_add_slider gradx_btn'><i class='icon icon-add'></i>add</div>\n\
                        <div class='gradx_slectboxes'>\n\
                        <select id='gradx_gradient_type' class='gradx_gradient_type'>\n\
                            <option value='linear'>Linear</option>\n\
                            <option value='circle'>Radial - Circle</option>\n\
                            <option value='ellipse'>Radial - Ellipse</option>\n\
                        </select>\n\
                        <select id='gradx_gradient_subtype' class='gradx_gradient_type'>\n\
                            <option id='gradx_gradient_subtype_desc' value='gradient-direction' disabled>gradient direction</option>\n\
                            <option value='left' selected>Left</option>\n\
                            <option value='right'>Right</option>\n\
                            <option value='top'>Top</option>\n\
                            <option value='bottom'>Bottom</option>\n\
                        </select>\n\
                        <select id='gradx_gradient_subtype2' class='gradx_gradient_type gradx_hide'>\n\
                        </select>\n\
                        <select id='gradx_radial_gradient_size' class='gradx_gradient_type gradx_hide'>\n\
                        </select>\n\
                        </div>\n\
                        <div class='gradx_container' id='gradx_" + id + "'>\n\
                            <div id='gradx_stop_sliders_" + id + "'></div>\n\
                            <div class='gradx_panel' id='gradx_panel_" + id + "'></div>\n\
                            <div class='gradx_start_sliders' id='gradx_start_sliders_" + id + "'>\n\
                                <div class='cp-default' id='gradx_slider_info'>\n\
                                    <div id='gradx_slider_controls'>\n\
                                        <div id='gradx_delete_slider' class='gradx_btn'><i class='icon icon-remove'></i>delete</div>\n\
                                    </div>\n\
                                    <div id='gradx_slider_content'></div>\n\
                                </div> \n\
                            </div>\n\
                        </div>\n\
                        <div id='gradx_show_code' class='gradx_show_code gradx_btn'><i class='icon icon-file-css'></i><span>show the code</span></div>\n\
                        <div id='gradx_show_presets' style='display:none' class='gradx_show_presets gradx_btn'><i class='icon icon-preset'></i><span>show presets</span></div>\n\
                        <textarea class='gradx_code' id='gradx_code'></textarea>\n\
                    </div>";

            this.me.html(html);

            // gradx_panel에 separateValue개수만큼 div ddp-hover를 생성 (호버시 아이콘 표시)
            var num = 0;
            // var ddpHover = "<div class='ddp-hover'><em></em></div>";
            var hoverList = "";
            while (num < (gradx.separateValue)) {

              hoverList += "<div class='ddp-hover' id='ddp-hover-" + num + "'><em></em></div>";

              num++;
            }

            gradx.gx('.gradx_panel').append(hoverList);

            //generates html to select the different gradient sizes
            // *only available for radial gradients
            var gradient_size_val = ["gradient-size disabled", "closest-side selected", "closest-corner", "farthest-side", "farthest-corner", "contain", "cover"],
                    option_str = '';


            option_str = gradx.generate_options(gradient_size_val);

            gradx.gx('#gradx_radial_gradient_size').html(option_str);

            //cache divs for fast reference

            this.container = gradx.gx("#gradx_" + id);
            this.panel = gradx.gx("#gradx_panel_" + id);
            //.hide();
            //this.info.hide();
            this.container_width = gradx.positionMax;

            // 개당 slider값
            gradx.diffValue = (gradx.max - gradx.min) / (gradx.separateValue - 1);
            gradx.diffpositionValue = (gradx.positionMax + Math.abs(gradx.positionMin)) / (gradx.separateValue - 1);

            this.sliders = [];
            this.add_slider(sliders);

            $(document).click(function() {

//            if(!gradx.jQ_present){
              if (!gradx.slider_hovered[id]) {
                gradx.gx("#gradx_slider_info").hide();
                // return false;
              }
            });

            gradx.gx('#gradx_add_slider').click(function() {
                gradx.add_slider([
                    {
                        color: gradx.get_random_rgb(),
                        position: gradx.get_random_position() //no % symbol
                    }
                ]);
                gradx.update_style_array();
                gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)

            });

            // 추가 / 삭제버튼 클릭시
            gradx.gx('.gradx_panel').on('click', '.ddp-hover', function(item) {

              // 삭제버튼 클릭시
              if (-1 !== item.currentTarget.className.indexOf('delete')) {

                // 슬라이더가 2개이하인경우 삭제불가
                if (gradx.sliders.length <= 2) return;

                var id = $(item.currentTarget).attr('id').replace('ddp-hover-', '');

                var position = (parseInt(id) * gradx.diffpositionValue) + gradx.positionMin;

                // position을 separateValue로 나뉜 해당위치에 설정, value값을 구하기
                var obj = get_position_value_byposition(position);

                // validation
                // 같은 position, value가 존재하는경우 return false
                var result = duplicatePositionCheck(obj.position, obj.value);

                // 현재 선택된 슬라이더설정
                gradx.current_slider_id = result.dupliateSlider[4];

                // 해당 슬라이더 삭제
                delete_slider();
              // 추가버튼 클릭시
              } else {
                var id = $(item.currentTarget).attr('id').replace('ddp-hover-', '');

                var position = (parseInt(id) * gradx.diffpositionValue) + gradx.positionMin;

                // 새로운 슬라이더를 만들고 설정값 변경
                gradx.add_new_range(position);
              }
            });

            // 슬라이더를 선택시
            gradx.gx('.gradx_start_sliders').on('click', '.gradx_slider', function(item) {

              // 선택된 슬라이더 아이디 설정
              gradx.current_slider_id = '#' + item.currentTarget.id;

              // 슬라이더 값설정
              gradx.add_select_class(gradx.current_slider_id);
            });

            //cache the element
            gradx.cp = gradx.gx('#gradx_slider_content');

            gradx.gx('#gradx_delete_slider').click(function() {

              event.stopPropagation();

                gradx.gx(gradx.current_slider_id).remove();
                gradx.gx("#gradx_slider_info").hide();
                var id = gradx.current_slider_id.replace("#", "");

                //remove all references from array for current deleted slider

                for (var i = 0; i < gradx.slider_ids.length; i++) {
                    if (gradx.slider_ids[i] == id) {
                        gradx.slider_ids.splice(i, 1);
                    }
                }

                //apply modified style after removing the slider
                gradx.update_style_array();
                gradx.apply_style(gradx.panel, gradx.get_style_value());

                gradx.current_slider_id = false; //no slider is selected

            });

            gradx.gx('#gradx_code').focus(function() {
                var $this = gradx.gx(this);
                $this.select();

                // Work around Chrome's little problem
                $this.mouseup(function() {
                    // Prevent further mouseup intervention
                    $this.unbind("mouseup");
                    return false;
                });
            });

            gradx.gx('#gradx_gradient_type').change(function() {

                var type = gradx.gx(this).val(), options, option_str = '';

                if (type !== "linear") {
                    //gradx.gx('#gradx_radial_gradient_size').show();

                    gradx.generate_radial_options();
                } else {

                    gradx.generate_linear_options();
                    gradx.gx('#gradx_gradient_subtype').val("left");
                }

                gradx.type = type;
                gradx.direction = gradx.gx('#gradx_gradient_subtype').val();
                gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)
            });

            //change type onload userdefined
            if (this.type !== "linear") {
                gradx.gx('#gradx_gradient_type').val(this.type);
                gradx.generate_radial_options();

                var h, v;

                if (this.direction !== 'left') {
                    //user has passed his own direction
                    var center;
                    if (this.direction.indexOf(",") > -1) {
                        center = this.direction.split(",");
                    } else {
                        //tolerate user mistakes
                        center = this.direction.split(" ");
                    }

                    h = center[0];
                    v = center[1];

                    //update the center points in the corr. select boxes
                    gradx.gx('#gradx_gradient_subtype').val(h);
                    gradx.gx('#gradx_gradient_subtype2').val(v);
                } else {
                    var h = gradx.gx('#gradx_gradient_subtype').val();
                    var v = gradx.gx('#gradx_gradient_subtype2').val();
                }

                gradx.direction = h + " " + v;
                gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)
            } else {

                //change direction if not left
                if (this.direction !== 'left') {
                    gradx.gx('#gradx_gradient_subtype').val(this.direction);
                }
            }

            gradx.gx('#gradx_gradient_subtype').change(function() {

                if (gradx.type === 'linear') {
                    gradx.direction = gradx.gx(this).val();
                } else {
                    var h = gradx.gx(this).val();
                    var v = gradx.gx('#gradx_gradient_subtype2').val();
                    gradx.direction = h + " " + v;
                }
                gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)

            });

            gradx.gx('#gradx_gradient_subtype2').change(function() {

                var h = gradx.gx('#gradx_gradient_subtype').val();
                var v = gradx.gx(this).val();
                gradx.direction = h + " " + v;
                gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)

            });

            //not visible
            gradx.gx('#gradx_radial_gradient_size').change(function() {
                gradx.shape = gradx.gx(this).val();
                gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)

            });

            gradx.gx('#gradx_show_code').click(function() {

                if (gradx.code_shown) {
                    //hide it

                    gradx.code_shown = false;
                    gradx.gx('#gradx_show_code span').text("show the code");
                    gradx.gx("#gradx_code").hide();
                }
                else {
                    //show it

                    gradx.gx('#gradx_show_code span').text("hide the code");
                    gradx.gx("#gradx_code").show();
                    gradx.code_shown = true;
                }
            });

            //show or hide onload
            if (gradx.code_shown) {
                //show it

                gradx.gx('#gradx_show_code span').text("hide the code");
                gradx.gx("#gradx_code").show();

            }

            gradx.add_event(document.getElementById('gradx_slider_info'), 'mouseout', function() {
                gradx.slider_hovered[id] = false;
            });
            gradx.add_event(document.getElementById('gradx_slider_info'), 'mouseover', function() {
                gradx.slider_hovered[id] = true;

            });

        },
        // rgb에서 hex값으로 변경
        rgbToHex: function(color) {
          var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);

          var red = parseInt(digits[2]);
          var green = parseInt(digits[3]);
          var blue = parseInt(digits[4]);

          var rgb = blue | (green << 8) | (red << 16);

          var hex = rgb.toString(16);

          // 한자리 숫자의 16진수 코드의경우 0을 붙여준다
          if ((hex.length % 2) > 0) hex = '0' + hex;

          return digits[1] + '#' + hex;
        }
    };

    function  add_event(element, event, event_function)
    {
        if (element.attachEvent) //Internet Explorer
            element.attachEvent("on" + event, function() {
                event_function.call(element);
            });
        else if (element.addEventListener) //Firefox & company
            element.addEventListener(event, event_function, false); //don't need the 'call' trick because in FF everything already works in the right way
    };

    /**
     * 선택클래스 제거
     * @param sliderId
     */
    function delete_select_class() {

      gradx.gx('.gradx_start_sliders').removeClass('ddp-selected');
      gradx.gx('.wrap-grax-slider').removeClass('ddp-selected');
    }

    /**
     * 가까운 위치의 색상값을 리턴
     */
    function get_close_color(position) {

      var compareSliderPosition = parseInt((position/gradx.container_width) * 100);

      var compareValue;

      // slider에서 가까운 slider의 색상으로 설정
      for (var index = 0; index < gradx.sliders.length; index++) {

        var slider = gradx.sliders[index];

        if (compareValue) {

          var compare = Math.abs(compareSliderPosition - Math.abs(slider[1]));

          if (compareValue.value > compare) compareValue = {value : compare, index: index};

        } else {
          compareValue = {value : Math.abs(compareSliderPosition - Math.abs(slider[1])), index: index};
        }
      }

      var color = gradx.sliders[compareValue.index][0];

      return color;
    }

    /**
     * position을 separateValue로 나뉜 해당위치에 설정, position값으로 value값을 구하기
     */
    function get_position_value_byposition(position) {

      var value;

      // min값 설정
      if (position < (parseInt(gradx.diffpositionValue) + gradx.positionMin)) {

        position = gradx.positionMin;
        value = gradx.min;

      } else {

        var pos = (gradx.diffpositionValue * Math.round(position / gradx.diffpositionValue)) + gradx.positionMin;

        // max 값 설정
        if (gradx.positionMax - pos < gradx.diffpositionValue) {
          position = gradx.positionMax;
          value = gradx.max;

        // 위치값을 separateValue값으로 나눈 값에 해당한 값으로 설정
        } else {
          position = pos;
          // position값을 이용하여 value값 설정
          value = ((Math.round(position / gradx.diffpositionValue) * gradx.diffValue) + gradx.min);
        }
      }

      return {position: position, value: value};
    }

    /**
     * value를 separateValue로 나뉜 해당위치에 설정, value값으로 position값을 구하기
     * @param value
     * @returns {{position: position, value: *}}
     */
    function get_value_position_byvalue(value) {

      if (0 !== value % gradx.diffValue) {

        value = value - (value % gradx.diffValue);
      }

      var position = ((value / gradx.diffValue) * gradx.diffpositionValue) + gradx.positionMin;

      return {position: position, value: value};
    }

    /**
     * sliders 배열값에서 object값으로 변경하여 리턴
     * @param sliderList
     */
    function changeSliderTypeList(sliderList) {

      var returnList = [];

      for (var num = 0; num < sliderList.length; num++) {

        var item = sliderList[num];

        returnList.push({color : gradx.rgbToHex(item[0]), position: item[2], value: item[3], index: item[4]});
      }

      return returnList;
    }

    /**
     * 해당 위치에 slider가 있는지 체크
     * @param slider
     */
    function duplicatePositionCheck(position, value) {

      var isValid = true;
      var duplicateSlider;

      for (var num = 0; num < gradx.sliders.length; num++) {

        var item = gradx.sliders[num];

        if ( (undefined !== position && item[2] == position) || (undefined !== value && item[3] == value) ) {

          return {isValid : false, dupliateSlider: item};
        }
      }

      return {isValid : isValid, dupliateSlider: duplicateSlider};
    }

    /**
     * 해당 슬라이더 제거
     */
    function delete_slider() {

      event.stopPropagation();

      if (!gradx.current_slider_id) return;

      var currentSlider = gradx.get_current_slider(gradx.current_slider_id);

      gradx.gx(gradx.current_slider_id).remove();
      gradx.gx("#gradx_slider_info").hide();
      var id = gradx.current_slider_id.replace("#", "");

      //remove all references from array for current deleted slider

      for (var i = 0; i < gradx.slider_ids.length; i++) {
        if (gradx.slider_ids[i] == id) {
          gradx.slider_ids.splice(i, 1);
          gradx.slider_index--;
          gradx.deleteIndexList.push(id);
        }
      }

      gradx.deleteIndexList.sort();

      // 리스트에서 제거
      for (var i = 0; i < gradx.sliders.length; i++) {
        if (gradx.sliders[i][4] == gradx.current_slider_id) {
          gradx.sliders.splice(i, 1);
        }
      }

      //apply modified style after removing the slider
      gradx.update_style_array();
      gradx.apply_style(gradx.panel, gradx.get_style_value());

      // selected 클래스 제거
      delete_select_class();

      // hover아이콘은 +으로 변경
      changeSliderIcon(currentSlider[2], true);

      gradx.current_slider_id = false; //no slider is selected

      // sliders가 설정된 개수보다 많은경우 +버튼 display none 설정
      if (gradx.sliders.length < gradx.separateValue) {
        $('.gradx_panel').find('.ddp-hover').css('display', 'block');
      }
    }

    /**
     * separateValue값보다 리스트값이 작은경우 separateValue개수만큼 리스트 채우기
     */
    function fill_empty_list() {

      // deep copy
      var sliderList = JSON.parse(JSON.stringify(gradx.sliders));
      var returnSliderList = JSON.parse(JSON.stringify(gradx.sliders));

      // separateValue보다 리스트값이 작은경우
      if (returnSliderList.length < gradx.separateValue) {

        for (var num = 0; num < sliderList.length; num++) {

          var currentItem = sliderList[num];
          var nextItem = sliderList[num + 1];

          if (currentItem && nextItem) {
            var totalPercent = 0;
            var count = (parseInt((nextItem[3] - currentItem[3]) / gradx.diffValue) - 1);
            var colorPercent = 1 / count;

            var prevColorList = currentItem[0].replace('rgb(', '').replace(')', '').split(',');
            var nextColorList = nextItem[0].replace('rgb(', '').replace(')', '').split(',');

            var prevIndex = sliderList.indexOf(currentItem) + (returnSliderList.length - sliderList.length);

            var totalCount = 0;
            while (totalCount < count) {

              var red = parseInt(parseInt(prevColorList[0]) + totalPercent * (parseInt(nextColorList[0]) - parseInt(prevColorList[0])));
              var green = parseInt(parseInt(prevColorList[1]) + totalPercent * (parseInt(nextColorList[1]) - parseInt(prevColorList[1])));
              var blue = parseInt(parseInt(prevColorList[2]) + totalPercent * (parseInt(nextColorList[2]) - parseInt(prevColorList[2])));
              totalPercent += colorPercent;

              var rgbCode = 'rgb(' + red + ', ' + green + ', ' + blue + ')';

              returnSliderList.splice(prevIndex + 1 + totalCount, 0, [rgbCode]);

              totalCount++;
            }
          }
        }
      }

      return returnSliderList;
    }

    /**
     * 없는 indexList 만들기
     */
    function set_delete_index_list() {

      // deep copy후 index에 따라서 sort
      var sliders = JSON.parse(JSON.stringify(gradx.sliders)).sort(function(prev, next) {return parseInt(prev[4].split('#gradx_slider_')[1]) - parseInt(next[4].split('#gradx_slider_')[1])});

      var index;
      gradx.deleteIndexList = [];

      for (var num = 0; num < sliders.length; num++) {

        index = sliders[num][4].split('#gradx_slider_')[1];

        if (num != index) {
          gradx.deleteIndexList.push('#gradx_slider_' + index);
        }
      }
    }

    /**
     * 세자리마다 콤마 붙이기
     */
    function addComma(value) {
      var splitValue = value.toString().split(".");
      splitValue[0] = splitValue[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return splitValue.join(".");
    }

    /**
     * 해당 value의 콤마 제거
     * @param value
     */
    function removeComma(value) {
      return parseFloat(value.replace(/,/g, ''));
    }

    /**
     * position에 위치하는 + hover icon을 - hover icon으로 변경
     * @param position 위치값
     * @param addClassFl +버튼으로 설정여부
     */
    function changeSliderIcon(position, addClassFl) {

      // 현재 hover는 -버튼으로 변경
      var currentId = Math.round(Math.abs(position / gradx.diffpositionValue));

      // +버튼으로 설정시
      if (addClassFl) {
        $('#ddp-hover-' + currentId).removeClass('delete') // 클래스 제거
      // x버튼으로 설정시
      } else {
        $('#ddp-hover-' + currentId).addClass('delete') // 클래스 설정
      }
    }

    //load jQuery library into gradx.gx
    gradx.load_jQ();


    /* merge _options into options */
    gradx.gx.extend(options, _options);

    //apply options to gradx object

    for (var k in options) {

        //load the options into gradx object
        gradx[k] = options[k];

    }

    gradx.load_gradx(id, gradx.sliders);
    gradx.apply_default_styles(true);

    return gradx;
};
