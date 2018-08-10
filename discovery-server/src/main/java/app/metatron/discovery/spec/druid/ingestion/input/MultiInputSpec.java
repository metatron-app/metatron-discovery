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

package app.metatron.discovery.spec.druid.ingestion.input;

import com.google.common.collect.Lists;

import java.util.List;

import javax.validation.constraints.NotNull;

/**
 * Created by kyungtaak on 2016. 6. 18..
 */
public class MultiInputSpec implements InputSpec {

  @NotNull
  List<InputSpec> children;

  public MultiInputSpec() {
  }

  public MultiInputSpec(InputSpec... children) {
    this.children = Lists.newArrayList(children);
  }

  public MultiInputSpec(List<InputSpec> children) {
    this.children = children;
  }

  public List<InputSpec> getChildren() {
    return children;
  }

  public void setChildren(List<InputSpec> children) {
    this.children = children;
  }
}
