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

package app.metatron.discovery.spec.druid.ingestion.index;

/**
 * Created by kyungtaak on 2017. 5. 2..
 */
public class IndexSpec {

  Bitmap bitmap;

  String dimensionCompression;

  String metricCompression;

  public IndexSpec() {
  }

  public IndexSpec(Bitmap bitmap) {
    this.bitmap = bitmap;
  }

  public Bitmap getBitmap() {
    return bitmap;
  }

  public void setBitmap(Bitmap bitmap) {
    this.bitmap = bitmap;
  }

  public String getDimensionCompression() {
    return dimensionCompression;
  }

  public void setDimensionCompression(String dimensionCompression) {
    this.dimensionCompression = dimensionCompression;
  }

  public String getMetricCompression() {
    return metricCompression;
  }

  public void setMetricCompression(String metricCompression) {
    this.metricCompression = metricCompression;
  }

  public static class Bitmap {

    String type;

    public Bitmap() {
    }

    public Bitmap(String type) {
      this.type = type;
    }

    public String getType() {
      return type;
    }

    public void setType(String type) {
      this.type = type;
    }
  }
}
