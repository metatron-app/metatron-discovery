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

package app.metatron.discovery.common;

import com.google.common.collect.Maps;

import org.springframework.data.rest.core.config.Projection;

import java.util.Map;

import app.metatron.discovery.common.exception.BadRequestException;

/**
 * Created by kyungtaak on 2017. 7. 16..
 */
public class BaseProjections {

  private final Map<String, Class> projectionsMap = Maps.newHashMap();

  public BaseProjections() {
  }

  private void setProjectionsMap() {
    Class[] types = this.getClass().getDeclaredClasses();
    for (Class pClass : types) {
      Projection projection = (Projection) pClass.getAnnotation(Projection.class);
      if(projection == null) {
        continue;
      }
      projectionsMap.put(projection.name(), pClass);
    }
  }

  public Class getProjectionByName(String name) {
    if(projectionsMap.isEmpty()) {
      setProjectionsMap();
    }

    if(!projectionsMap.containsKey(name)) {
      throw new BadRequestException("Invalid projection name. choose one of " + projectionsMap.keySet());
    }

    return projectionsMap.get(name);
  }
}
