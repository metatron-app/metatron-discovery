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

package app.metatron.discovery.query.druid.queries;

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.meta.AnalysisType;
import app.metatron.discovery.query.druid.meta.ToInclude;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;

@JsonTypeName("segmentMetadata")
public class SegmentMetaDataQuery extends Query {

  List<VirtualColumn> virtualColumns;

  List<String> intervals;

  ToInclude toInclude;

  boolean merge;

  List<AnalysisType> analysisTypes;

  public SegmentMetaDataQuery(){
  }

  public boolean isMerge() {
    return merge;
  }

  public void setMerge(boolean merge) {
    this.merge = merge;
  }

  public List<VirtualColumn> getVirtualColumns() {
    return virtualColumns;
  }

  public void setVirtualColumns(List<VirtualColumn> virtualColumns) {
    this.virtualColumns = virtualColumns;
  }

  public List<String> getIntervals() {
    return intervals;
  }

  public void setIntervals(List<String> intervals) {
    this.intervals = intervals;
  }

  public ToInclude getToInclude() {
    return toInclude;
  }

  public void setToInclude(ToInclude toInclude) {
    this.toInclude = toInclude;
  }

  public List<AnalysisType> getAnalysisTypes() {
    return analysisTypes;
  }

  public void setAnalysisTypes(List<AnalysisType> analysisTypes) {
    this.analysisTypes = analysisTypes;
  }

  public static SegmentMetaDataQueryBuilder builder(DataSource dataSource) {
    return new SegmentMetaDataQueryBuilder(dataSource);
  }

}
