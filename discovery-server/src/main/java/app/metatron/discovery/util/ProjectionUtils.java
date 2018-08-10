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

package app.metatron.discovery.util;

import com.google.common.collect.Lists;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.projection.ProjectionFactory;

import java.util.List;

import static java.util.stream.Collectors.toList;

public class ProjectionUtils {

  public static <T> List<T> toListResource(ProjectionFactory factory,
                                     Class<T> projectionClass,
                                     List<Object> resources) {
    if(CollectionUtils.isEmpty(resources)) {
      return Lists.newArrayList();
    }

    return resources.stream()
             .map(resource -> factory.createProjection(projectionClass, resource))
             .collect(toList());
  }

  public static <T, E> Page<T> toPageResource(ProjectionFactory factory,
                                           Class<T> projectionClass,
                                           Page<E> resources) {

    return resources.map(resource -> factory.createProjection(projectionClass, resource));
  }

  public static <T> T toResource(ProjectionFactory factory,
                                    Class<T> projectionClass,
                                    Object resource) {
    if(resource == null) {
      return null;
    }

    return factory.createProjection(projectionClass, resource);
  }
}
