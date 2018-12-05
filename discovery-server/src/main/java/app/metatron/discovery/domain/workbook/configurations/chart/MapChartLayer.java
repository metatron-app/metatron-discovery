/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.workbook.configurations.chart;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import app.metatron.discovery.domain.workbook.configurations.chart.properties.LineStyle;
import app.metatron.discovery.domain.workbook.configurations.chart.properties.LineThickness;
import app.metatron.discovery.util.EnumUtils;

/**
 *
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = MapChartLayer.SymbolLayer.class, name = "symbol"),
    @JsonSubTypes.Type(value = MapChartLayer.LineLayer.class, name = "line"),
    @JsonSubTypes.Type(value = MapChartLayer.PolygonLayer.class, name = "polygon"),
    @JsonSubTypes.Type(value = MapChartLayer.HeatMapLayer.class, name = "heatmap"),
    @JsonSubTypes.Type(value = MapChartLayer.TileLayer.class, name = "tile")
})
public abstract class MapChartLayer {

  /**
   * Name of layer
   */
  String name;

  /**
   * Color of layer
   */
  Color color;


  public MapChartLayer() {
    // Empty Constructor
  }

  public MapChartLayer(String name, Color color) {
    this.name = name;
    this.color = color;
  }

  public String getName() {
    return name;
  }

  public Color getColor() {
    return color;
  }

  @Override
  public String toString() {
    return "MapChartLayer{" +
        "name='" + name + '\'' +
        ", color=" + color +
        '}';
  }

  public enum SymbolType {
    CIRCLE, SQUARE, TRIANGLE, PIN, PLAIN, USER
  }

  public enum LinePathType {
    STRAIGHT, ARCH
  }

  public enum TileShape {
    HEXAGON, SQUARE
  }

  public enum By {
    NONE, MEASURE, DIMENSION
  }

  public static class Color {
    /**
     * Color specification criteria
     */
    By by;

    /**
     * Column Name
     */
    String column;

    /**
     * Color code or schema code
     */
    String schema;

    /**
     * Source color, if line layer case
     */
    String source;

    /**
     * Target color, if line layer case
     */
    String target;

    /**
     * Transparency (0~100)
     */
    Integer transparency;

    public Color() {
    }

    @JsonCreator
    public Color(@JsonProperty("by") String by,
                 @JsonProperty("column") String column,
                 @JsonProperty("schema") String schema,
                 @JsonProperty("source") String source,
                 @JsonProperty("target") String target,
                 @JsonProperty("transparency") Integer transparency) {
      this.by = EnumUtils.getUpperCaseEnum(By.class, by, By.NONE);
      this.column = column;
      this.schema = schema;
      this.source = source;
      this.target = target;
      this.transparency = transparency;
    }

    public By getBy() {
      return by;
    }

    public String getColumn() {
      return column;
    }

    public String getSchema() {
      return schema;
    }

    public String getSource() {
      return source;
    }

    public String getTarget() {
      return target;
    }

    public Integer getTransparency() {
      return transparency;
    }
  }

  public static class Size {
    /**
     * Size specification criteria
     */
    By by;

    /**
     * Column Name
     */
    String column;

    public Size() {
    }

    @JsonCreator
    public Size(@JsonProperty("by") String by,
                @JsonProperty("column") String column) {
      this.by = EnumUtils.getUpperCaseEnum(By.class, by, By.NONE);
      this.column = column;
    }

    public By getBy() {
      return by;
    }

    public String getColumn() {
      return column;
    }
  }

  public static class Thickness {
    /**
     * Thickness specification criteria
     */
    By by;

    /**
     * Column Name
     */
    String column;

    /**
     * Max value of thickness
     */
    Integer maxValue;

    public Thickness() {
    }

    @JsonCreator
    public Thickness(@JsonProperty("by") String by,
                     @JsonProperty("column") String column,
                     @JsonProperty("maxValue") Integer maxValue) {
      this.by = EnumUtils.getUpperCaseEnum(By.class, by, By.NONE);
      this.column = column;
      this.maxValue = maxValue;
    }

    public By getBy() {
      return by;
    }

    public String getColumn() {
      return column;
    }

    public Integer getMaxValue() {
      return maxValue;
    }
  }

  /**
   * Outline
   */
  public static class Outline {
    /**
     * Color code of outline
     */
    String color;

    /**
     * Thickness outline
     */
    LineThickness thickness;

    public Outline() {
    }

    @JsonCreator
    public Outline(@JsonProperty("color") String color,
                   @JsonProperty("thickness") String thickness) {
      this.color = color;
      this.thickness = EnumUtils.getUpperCaseEnum(LineThickness.class, thickness, LineThickness.NORMAL);
    }

    public String getColor() {
      return color;
    }

    public LineThickness getThickness() {
      return thickness;
    }
  }

  public static class SymbolLayer extends MapChartLayer {

    /**
     * Type of symbol
     */
    SymbolType symbol;

    /**
     * Size of layer
     */
    Size size;

    /**
     * Outline of layer, outline 속성이 null 이거나 없는 경우 off 처리
     */
    Outline outline;

    /**
     * enable clustering, if true. (default false or null)
     */
    Boolean clustering;

    /**
     * Coverage of clustering
     */
    Integer coverage;

    @JsonCreator
    public SymbolLayer(@JsonProperty("name") String name,
                       @JsonProperty("symbol") String symbol,
                       @JsonProperty("color") Color color,
                       @JsonProperty("size") Size size,
                       @JsonProperty("outline") Outline outline,
                       @JsonProperty("clustering") Boolean clustering,
                       @JsonProperty("coverage") Integer coverage) {
      super(name, color);
      this.symbol = EnumUtils.getUpperCaseEnum(SymbolType.class, symbol, SymbolType.CIRCLE);
      this.size = size;
      this.outline = outline;
      this.clustering = clustering;
      this.coverage = coverage;
    }

    public SymbolType getSymbol() {
      return symbol;
    }

    public Size getSize() {
      return size;
    }

    public Outline getOutline() {
      return outline;
    }

    public Boolean getClustering() {
      return clustering;
    }

    public Integer getCoverage() {
      return coverage;
    }

    @Override
    public String toString() {
      return "SymbolLayer{" +
          "symbol=" + symbol +
          ", size=" + size +
          ", outline=" + outline +
          ", clustering=" + clustering +
          "} " + super.toString();
    }
  }

  public static class LineLayer extends MapChartLayer {

    /**
     * Type of Line
     */
    LinePathType pathType;

    /**
     * Source column Name
     */
    String source;

    /**
     * Target column Name
     */
    String target;

    /**
     * Thickness of line
     */
    Thickness thickness;

    /**
     * Style of line
     */
    LineStyle lineStyle;

    @JsonCreator
    public LineLayer(@JsonProperty("name") String name,
                     @JsonProperty("pathType") String pathType,
                     @JsonProperty("color") Color color,
                     @JsonProperty("source") String source,
                     @JsonProperty("target") String target,
                     @JsonProperty("thickness") Thickness thickness,
                     @JsonProperty("lineStyle") String lineStyle) {
      super(name, color);
      this.pathType = EnumUtils.getUpperCaseEnum(LinePathType.class, pathType, LinePathType.STRAIGHT);
      this.source = source;
      this.target = target;
      this.thickness = thickness;
      this.lineStyle = EnumUtils.getUpperCaseEnum(LineStyle.class, lineStyle, LineStyle.SOLID);
    }

    public LinePathType getPathType() {
      return pathType;
    }

    public String getSource() {
      return source;
    }

    public String getTarget() {
      return target;
    }

    public Thickness getThickness() {
      return thickness;
    }

    public LineStyle getLineStyle() {
      return lineStyle;
    }

    @Override
    public String toString() {
      return "LineLayer{" +
          "pathType=" + pathType +
          ", source='" + source + '\'' +
          ", target='" + target + '\'' +
          ", thickness=" + thickness +
          "} " + super.toString();
    }
  }

  public static class PolygonLayer extends MapChartLayer {

    Outline outline;

    @JsonCreator
    public PolygonLayer(@JsonProperty("name") String name,
                        @JsonProperty("color") Color color,
                        @JsonProperty("outline") Outline outline) {
      super(name, color);
      this.outline = outline;
    }

    public Outline getOutline() {
      return outline;
    }

    @Override
    public String toString() {
      return "PolygonLayer{" +
          "outline=" + outline +
          "} " + super.toString();
    }
  }

  public static class HeatMapLayer extends MapChartLayer {

    /**
     * Blur value (0~100), default 20
     */
    Integer blur;

    /**
     * Radius value (0~100), default 20
     */
    Integer radius;

    @JsonCreator
    public HeatMapLayer(@JsonProperty("name") String name,
                        @JsonProperty("color") Color color,
                        @JsonProperty("blur") Integer blur,
                        @JsonProperty("radius") Integer radius) {
      super(name, color);
      this.blur = blur;
      this.radius = radius;
    }

    public Integer getBlur() {
      return blur;
    }

    public Integer getRadius() {
      return radius;
    }

    @Override
    public String toString() {
      return "HeatMapLayer{" +
          "blur=" + blur +
          ", radius=" + radius +
          "} " + super.toString();
    }
  }

  public static class TileLayer extends MapChartLayer {

    /**
     * Shape of tile
     */
    TileShape shape;

    /**
     * Coverage of tile(0~100), default 80
     */
    Integer coverage;

    /**
     * Radius of tile(0~100), default 80
     */
    Integer radius;

    @JsonCreator
    public TileLayer(@JsonProperty("name") String name,
                     @JsonProperty("color") Color color,
                     @JsonProperty("shape") String shape,
                     @JsonProperty("coverage") Integer coverage,
                     @JsonProperty("radius") Integer radius) {
      super(name, color);
      this.shape = EnumUtils.getUpperCaseEnum(TileShape.class, shape, TileShape.HEXAGON);
      this.coverage = coverage;
      this.radius = radius;
    }

    public TileShape getShape() {
      return shape;
    }

    public Integer getCoverage() {
      return coverage;
    }

    public Integer getRadius() {
      return radius;
    }

    @Override
    public String toString() {
      return "TileLayer{" +
          "shape=" + shape +
          ", coverage=" + coverage +
          "} " + super.toString();
    }
  }
}
