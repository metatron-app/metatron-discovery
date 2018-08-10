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

package app.metatron.discovery.spec.druid.ingestion.parser;

public class TimeAndDimsParseSpec implements ParseSpec {

  protected DimensionsSpec dimensionsSpec;

  protected TimestampSpec timestampSpec;

  public TimeAndDimsParseSpec() {
  }

  public TimeAndDimsParseSpec(DimensionsSpec dimensionsSpec, TimestampSpec timestampSpec) {
    this.dimensionsSpec = dimensionsSpec;
    this.timestampSpec = timestampSpec;
  }

  public DimensionsSpec getDimensionsSpec() {
    return dimensionsSpec;
  }

  public void setDimensionsSpec(DimensionsSpec dimensionsSpec) {
    this.dimensionsSpec = dimensionsSpec;
  }

  public TimestampSpec getTimestampSpec() {
    return timestampSpec;
  }

  public void setTimestampSpec(TimestampSpec timestampSpec) {
    this.timestampSpec = timestampSpec;
  }
}
