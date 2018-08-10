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

package app.metatron.discovery.domain.datasource.data.forward;

import com.fasterxml.jackson.annotation.JsonTypeName;

/**
 * Created by kyungtaak on 2016. 8. 24..
 */
@JsonTypeName("json")
public class JsonResultForward extends ResultForward {

  boolean wrapAsList = true;

  public JsonResultForward() {
  }

  public JsonResultForward(boolean wrapAsList) {
    this.wrapAsList = wrapAsList;
  }

  @Override
  public ForwardType getForwardType() {
    return ForwardType.JSON;
  }

  public boolean isWrapAsList() {
    return wrapAsList;
  }

  public void setWrapAsList(boolean wrapAsList) {
    this.wrapAsList = wrapAsList;
  }

  public JsonResultForward(String forwardUrl) {
    super(forwardUrl);
  }
}
