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

import com.google.common.collect.Lists;

import java.util.Arrays;
import java.util.List;

import javax.validation.constraints.NotNull;

/**
 * Created by kyungtaak on 2016. 6. 17..
 */
public class SpatialDimension {

  @NotNull
  String dimName;

  List<String> dims;

  public SpatialDimension(String dimName) {
    this.dimName = dimName;
  }

  public SpatialDimension(String dimName, String... dims) {
    this.dimName = dimName;
    if (dims != null || dims.length > 0) {
      this.dims = Lists.newArrayList(Arrays.asList(dims));
    }
  }

  public String getDimName() {
    return dimName;
  }

  public void setDimName(String dimName) {
    this.dimName = dimName;
  }

  public List<String> getDims() {
    return dims;
  }

  public void setDims(List<String> dims) {
    this.dims = dims;
  }
}
