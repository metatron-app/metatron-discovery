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

package app.metatron.discovery.domain.workbench;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 *
 */
public class VerticesProgress {
  private static Logger LOGGER = LoggerFactory.getLogger(VerticesProgress.class);

  public static final Pattern COMPLETE_RUNNING_FAIL_TOTAL_PATTERN = Pattern.compile("((?:Map|Reducer) \\d*): (\\d*)\\(\\+(\\d*),-(\\d*)\\)\\/(\\d*)");
  public static final Pattern COMPLETE_RUNNING_TOTAL_PATTERN = Pattern.compile("((?:Map|Reducer) \\d*): (\\d*)\\(\\+(\\d*)\\)\\/(\\d*)");
  public static final Pattern COMPLETE_FAILED_TOTAL_PATTERN = Pattern.compile("((?:Map|Reducer) \\d*): (\\d*)\\(-(\\d*)\\)\\/(\\d*)");
  public static final Pattern COMPLETE_TOTAL_PATTERN = Pattern.compile("((?:Map|Reducer) \\d*): (\\d*)\\/(\\d*)");

  private Integer complete = 0;
  private Integer running = 0;
  private Integer failed = 0;
  private Integer total = 0;

  private boolean isProgressIndicated = false;

  public VerticesProgress(String log){
    //Map 1: 1(+1,-1)/1 Pattern
    Matcher matcher = COMPLETE_RUNNING_FAIL_TOTAL_PATTERN.matcher(log);
    while(matcher.find()){
      LOGGER.debug("COMPLETE_RUNNING_FAIL_TOTAL_PATTERN : {}", matcher.group(0));
      complete = complete + Integer.parseInt(matcher.group(2));
      running = running + Integer.parseInt(matcher.group(3));
      failed = failed + Integer.parseInt(matcher.group(4));
      total = total + Integer.parseInt(matcher.group(5));
      isProgressIndicated = true;
    }

    //Reducer 2: 0(+1)/2 Pattern
    matcher = COMPLETE_RUNNING_TOTAL_PATTERN.matcher(log);
    while(matcher.find()){
      LOGGER.debug("COMPLETE_RUNNING_TOTAL_PATTERN : {}", matcher.group(0));
      complete = complete + Integer.parseInt(matcher.group(2));
      running = running + Integer.parseInt(matcher.group(3));
      total = total + Integer.parseInt(matcher.group(4));
      isProgressIndicated = true;
    }

    //Reducer 2: 0(-1)/2 Pattern
    matcher = COMPLETE_FAILED_TOTAL_PATTERN.matcher(log);
    while(matcher.find()){
      LOGGER.debug("COMPLETE_FAILED_TOTAL_PATTERN : {}", matcher.group(0));
      complete = complete + Integer.parseInt(matcher.group(2));
      failed = failed + Integer.parseInt(matcher.group(3));
      total = total + Integer.parseInt(matcher.group(4));
      isProgressIndicated = true;
    }

    //Reducer 2: 0/2 Pattern
    matcher = COMPLETE_TOTAL_PATTERN.matcher(log);
    while(matcher.find()){
      LOGGER.debug("COMPLETE_TOTAL_PATTERN : {}", matcher.group(0));
      complete = complete + Integer.parseInt(matcher.group(2));
      total = total + Integer.parseInt(matcher.group(3));
      isProgressIndicated = true;
    }
  }

  public Integer getComplete() {
    return complete;
  }

  public Integer getRunning() {
    return running;
  }

  public Integer getFailed() {
    return failed;
  }

  public Integer getTotal() {
    return total;
  }

  public boolean isProgressIndicated() {
    return isProgressIndicated;
  }

  public Integer getProgress(){
    if(!isProgressIndicated)
      return 0;

    return Math.round(this.complete.floatValue() / this.total.floatValue() * 100);
  }

  public static boolean isProgressIndicatedLog(String log){
    Matcher matcher = COMPLETE_RUNNING_FAIL_TOTAL_PATTERN.matcher(log);
    while(matcher.find()){
      LOGGER.debug("COMPLETE_RUNNING_FAIL_TOTAL_PATTERN : {}", matcher.group(0));
      return true;
    }

    //Reducer 2: 0(+1)/2 Pattern
    matcher = COMPLETE_RUNNING_TOTAL_PATTERN.matcher(log);
    while(matcher.find()){
      LOGGER.debug("COMPLETE_RUNNING_TOTAL_PATTERN : {}", matcher.group(0));
      return true;
    }

    //Reducer 2: 0(-1)/2 Pattern
    matcher = COMPLETE_FAILED_TOTAL_PATTERN.matcher(log);
    while(matcher.find()){
      LOGGER.debug("COMPLETE_FAILED_TOTAL_PATTERN : {}", matcher.group(0));
      return true;
    }

    //Reducer 2: 0/2 Pattern
    matcher = COMPLETE_TOTAL_PATTERN.matcher(log);
    while(matcher.find()){
      LOGGER.debug("COMPLETE_TOTAL_PATTERN : {}", matcher.group(0));
      return true;
    }
    return false;
  }

  @Override
  public String toString() {
    return "VerticesProgress{" +
            "complete=" + complete +
            ", running=" + running +
            ", failed=" + failed +
            ", total=" + total +
            ", progress=" + getProgress() +
            ", isProgressIndicated=" + isProgressIndicated() +
            '}';
  }
}
