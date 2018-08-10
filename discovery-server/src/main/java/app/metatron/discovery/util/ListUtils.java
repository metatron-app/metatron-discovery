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

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * List 관련 Utility Class
 *
 */
public class ListUtils {

  public static <T> List<T> distinctList(List<T> list, Function<? super T, ?>... keyExtractors) {
    return list.stream()
            .filter(distinctByKeys(keyExtractors))
            .collect(Collectors.toList());
  }

  private static <T> Predicate<T> distinctByKeys(Function<? super T, ?>... keyExtractors) {
    final Map<List<?>, Boolean> seen = new ConcurrentHashMap<>();
    return t -> {
      final List<?> keys = Arrays.stream(keyExtractors)
              .map(ke -> ke.apply(t))
              .collect(Collectors.toList());
      return seen.putIfAbsent(keys, Boolean.TRUE) == null;
    };
  }
}
