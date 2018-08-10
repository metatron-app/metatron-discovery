/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.workbook.configurations.analysis;

import java.io.Serializable;
import java.util.List;

/**
 * Trend Analysis Spec.
 *
 * @author Kyungtaak Noh
 * @since 1.1
 */
public class TrendAnalysis implements Analysis {

  /**
   * use global setting, if true
   */
  boolean useGlobal;

  /**
   * setting for individual trends series
   */
  List<TrendBySeries> series;

  public TrendAnalysis() {
  }

  public TrendAnalysis(List<TrendBySeries> series) {
    this.series = series;
  }

  public Boolean getUseGlobal() {
    return useGlobal;
  }

  public void setUseGlobal(Boolean useGlobal) {
    this.useGlobal = useGlobal;
  }

  public List<TrendBySeries> getSeries() {
    return series;
  }

  public void setSeries(List<TrendBySeries> series) {
    this.series = series;
  }

  @Override
  public String toString() {
    return "TrendAnalysis{" +
        "series=" + series +
        '}';
  }

  @Override
  public String getVersionKey() {
    return null;
  }

  public static class TrendBySeries implements Serializable {

    /**
     * show trend line, if true.
     */
    boolean show;

    /**
     * Series name
     */
    String name;

    /**
     * Formula for trend analysis
     */
    Formula formula;

    /**
     * Style of trend line
     */
    Style style;

    public TrendBySeries() {
    }

    public TrendBySeries(boolean show, String name, Formula formula, Style style) {
      this.show = show;
      this.name = name;
      this.formula = formula;
      this.style = style;
    }

    public boolean isShow() {
      return show;
    }

    public void setShow(boolean show) {
      this.show = show;
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public Formula getFormula() {
      return formula;
    }

    public void setFormula(Formula formula) {
      this.formula = formula;
    }

    public Style getStyle() {
      return style;
    }

    public void setStyle(Style style) {
      this.style = style;
    }

    @Override
    public String toString() {
      return "TrendBySeries{" +
          "name='" + name + '\'' +
          ", formula=" + formula +
          ", style=" + style +
          '}';
    }
  }

  public enum Formula {
    LINEAR, LOGARITHMIC, EXPONENTIAL, QUADRATIC, CUBIC
  }
}
