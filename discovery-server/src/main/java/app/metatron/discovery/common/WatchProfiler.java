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

import org.springframework.util.StopWatch;

/**
 * Created by kyungtaak on 2016. 10. 4..
 */
public class WatchProfiler {

  private static final ThreadLocal<StopWatch> watchThreadLocal =
          new ThreadLocal<StopWatch>() {
            protected StopWatch initialValue() {
              return new StopWatch();
            }
          };

  public static void start(String phase) {
    if(!watchThreadLocal.get().isRunning()) {
      watchThreadLocal.get().start(phase);
    }
  }

  public static void stop() {
    if(watchThreadLocal.get().isRunning()) {
      watchThreadLocal.get().stop();
    }
  }

  public static long totalElapsed() {
    return watchThreadLocal.get().getTotalTimeMillis();
  }

  public static long lastElapsed() {
    return watchThreadLocal.get().getLastTaskTimeMillis();
  }

  public static String report() {
    return watchThreadLocal.get().toString();
  }
}
