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

package app.metatron.discovery.query.druid.filters;

import com.google.common.base.Preconditions;

import app.metatron.discovery.domain.workbook.configurations.filter.SpatialBboxFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.SpatialPointFilter;
import app.metatron.discovery.query.druid.Filter;

public class LucenePointFilter implements Filter {

  String field;

  PointQueryType query;

  double[] latitudes;

  double[] longitudes;

  double radiusMeters;

  public LucenePointFilter() {
  }

  public LucenePointFilter(String field,
                           PointQueryType query,
                           double[] latitudes,
                           double[] longitudes,
                           double radiusMeters) {

    this.field = Preconditions.checkNotNull(field, "field can not be null");
    this.query = Preconditions.checkNotNull(query, "type can not be null");
    this.latitudes = latitudes;
    this.longitudes = longitudes;
    this.radiusMeters = query == PointQueryType.DISTANCE ? radiusMeters : 0;

    Preconditions.checkArgument(getLatitudes().length == getLongitudes().length, "invalid coordinates");
  }

  public LucenePointFilter(SpatialBboxFilter filter) {
    this.field = filter.getField() + ".coord";
    this.query = PointQueryType.BBOX;
    this.latitudes = filter.findLatitudes();
    this.longitudes = filter.findLongitudes();
    this.radiusMeters = 0.0f;
  }

  public LucenePointFilter(SpatialPointFilter filter, boolean isPoint) {
    this.field = filter.getField();
    if (isPoint) this.field += ".coord";

    this.query = PointQueryType.DISTANCE;
    this.latitudes = new double[]{filter.getLatitude().doubleValue()};
    this.longitudes = new double[]{filter.getLongitude().doubleValue()};
    this.radiusMeters = filter.getRadiusMeters();
  }

  public String getField() {
    return field;
  }

  public void setField(String field) {
    this.field = field;
  }

  public PointQueryType getQuery() {
    return query;
  }

  public double[] getLatitudes() {
    return latitudes;
  }

  public double[] getLongitudes() {
    return longitudes;
  }

  public double getRadiusMeters() {
    return radiusMeters;
  }

  public enum PointQueryType {
    DISTANCE, BBOX, POLYGON
  }
}
