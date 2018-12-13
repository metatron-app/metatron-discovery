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

package app.metatron.discovery.domain.scheduling.common;

import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.domain.workbench.WorkbenchProperties;
import org.joda.time.DateTime;
import org.joda.time.Duration;
import org.joda.time.Period;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.nio.file.attribute.FileTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Transactional(readOnly = true, isolation = Isolation.READ_UNCOMMITTED)
public class TemporaryCSVFileCleanJob extends QuartzJobBean {

  private static final Logger LOGGER = LoggerFactory.getLogger(TemporaryCSVFileCleanJob.class);

  @Autowired
  WorkbenchProperties workbenchProperties;

  @Autowired
  EngineProperties engineProperties;

  public TemporaryCSVFileCleanJob() {
  }

  @Override
  public void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {

    LOGGER.info("## Start batch job for checking expired temporary csv file.");

    //expire duration
    Duration expireDuration = Period.parse(String.format("P%sD", workbenchProperties.getTempCSVExpireDuration())).toStandardDuration();
    Long currentDateTime = DateTime.now().getMillis();

    List<Path> deleteTargetPathList = new ArrayList<>();

    //check for workbench
    List<Path> expiredFilePathList;

    expiredFilePathList = getExpiredPathList(workbenchProperties.getTempCSVPath(),
            new String[]{ WorkbenchProperties.TEMP_CSV_PREFIX },
            expireDuration, currentDateTime);
    if(expiredFilePathList != null)
      deleteTargetPathList.addAll(expiredFilePathList);

    //check for datasource
    expiredFilePathList
            = getExpiredPathList(engineProperties.getQuery().getLocalBaseDir(),
            new String[]{ EngineProperties.TEMP_CSV_PREFIX },
            expireDuration, currentDateTime);
    if(expiredFilePathList != null)
      deleteTargetPathList.addAll(expiredFilePathList);

    if(deleteTargetPathList != null && deleteTargetPathList.size() > 0){
      LOGGER.info("expired temporary csv file : {}", deleteTargetPathList.size());

      //delete file
      deleteTargetPathList.stream().forEach(path -> {
        try {
          Files.deleteIfExists(path);
          LOGGER.info("expired temporary csv file deleted : {}", path.toString());
        } catch (IOException e) {
          // File permission problems are caught here.
          LOGGER.error("## Error deleting expired file.", e);
        }
      });
    } else {
      LOGGER.info("expired temporary csv file not exist");
    }

    LOGGER.info("## End batch job for checking expired temporary csv file.");
  }

  public List<Path> getExpiredPathList(String csvBaseDir, String[] prefixes, Duration expireDuration, Long targetDateTime){
    List<Path> expiredFilePathInDir = null;
    try{
      LOGGER.debug("check CSV file dir : {}", csvBaseDir);
      expiredFilePathInDir = Files.list(Paths.get(csvBaseDir))
              //regular file filter
              .filter(Files::isRegularFile)

              //filename filter
              .filter(filePath -> {
                String fileName = filePath.getFileName().toString();

                //csv file filter
                if(!fileName.endsWith(".csv")){
                  return false;
                }

                //prefix filter
                if(prefixes != null && prefixes.length > 0){
                  boolean prefixMatched = false;
                  for(String prefix : prefixes){
                    if(fileName.startsWith(prefix)){
                      prefixMatched = true;
                      break;
                    }
                  }
                  if(!prefixMatched){
                    return false;
                  }
                }

                return true;
              })

              //expire time filter
              .filter(filePath -> {
                boolean expired = false;
                try{
                  BasicFileAttributes attributes = Files.readAttributes(filePath, BasicFileAttributes.class);
                  FileTime fileTime = attributes.creationTime();
                  LOGGER.debug("fileTime : {}", fileTime.toString());
                  Duration duration = new Duration(fileTime.toMillis(), targetDateTime);
                  LOGGER.debug("expireDuration : {}", expireDuration);
                  LOGGER.debug("duration : {}", duration);
                  expired = duration.isLongerThan(expireDuration);
                } catch (IOException e){
                  LOGGER.error("## Error getting attributes expired file.", e);
                }

                return expired;
              })
              .collect(Collectors.toList());
    } catch (IOException e){
      LOGGER.error("## Error expired file filtering.", e);
    }

    return expiredFilePathInDir;
  }

}
