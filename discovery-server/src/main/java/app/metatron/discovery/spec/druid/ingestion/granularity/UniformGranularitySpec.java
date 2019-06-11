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

package app.metatron.discovery.spec.druid.ingestion.granularity;


import com.google.common.collect.Lists;

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.filter.TimeFilter;

/**
 *
 */
public class UniformGranularitySpec implements GranularitySpec {

  String segmentGranularity;

  String queryGranularity;

  List<String> intervals;

  Boolean rollup;

  Boolean append = true;

  public UniformGranularitySpec() {
  }

  public UniformGranularitySpec(String queryGranularity, String segmentGranularity, String... intervals) {
    this.segmentGranularity = segmentGranularity;
    this.queryGranularity = queryGranularity;

    if (intervals == null || intervals.length == 0) {
      this.intervals = TimeFilter.DEFAULT_INTERVAL;
    } else {
      this.intervals = Lists.newArrayList(intervals);
    }
  }

  public void addInterval(String interval) {
    if (intervals == null) {
      intervals = Lists.newArrayList();
    }

    intervals.add(interval);
  }

  public String getSegmentGranularity() {
    return segmentGranularity;
  }

  public void setSegmentGranularity(String segmentGranularity) {
    this.segmentGranularity = segmentGranularity;
  }

  public String getQueryGranularity() {
    return queryGranularity;
  }

  public void setQueryGranularity(String queryGranularity) {
    this.queryGranularity = queryGranularity;
  }

  public List<String> getIntervals() {
    return intervals;
  }

  public void setIntervals(List<String> intervals) {
    this.intervals = intervals;
  }

  public Boolean getRollup() {
    return rollup;
  }

  public void setRollup(Boolean rollup) {
    this.rollup = rollup;
  }

  public Boolean getAppend() { return append; }

  public void setAppend(Boolean append) { this.append = append; }

}
