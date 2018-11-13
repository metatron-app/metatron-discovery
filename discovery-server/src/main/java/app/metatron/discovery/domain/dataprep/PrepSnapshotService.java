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

package app.metatron.discovery.domain.dataprep;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import com.google.common.collect.Lists;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@Service
public class PrepSnapshotService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepSnapshotService.class);

    @Autowired
    private PrepSnapshotRepository snapshotRepository;

    @Autowired
    PrepDataflowRepository dataflowRepository;

    @Autowired
    private PrepDatasetSparkHiveService datasetSparkHiveService;

    @Autowired
    PrepHdfsService hdfsService;

    public String makeSnapshotName(String dsName, DateTime launchTime) {
        String ssName;

        if(null==launchTime) {
            launchTime = DateTime.now(DateTimeZone.UTC);
        }
        DateTimeFormatter dtf = DateTimeFormat.forPattern("yyyyMMdd_HHmmss");
        ssName = dsName+"_"+dtf.print(launchTime);

        return ssName;
    }

    public String escapeSsNameOfUri(String ssName) {
        String[] splited = ssName.split("/");
        if(0<splited.length) {
            splited[splited.length - 1] = splited[splited.length - 1].replaceAll("[\\\\/:*?\"<>|\\s]", "_");
        }

        return String.join("/",splited);
    }

    public String unescapeSsNameOfUri(String ssName) {
        return ssName;
    }

    public String getSnapshotDir(String baseDir, String ssName) {
        String ssDir = Paths.get(PrepProperties.dirSnapshot, ssName).toString();
        if(baseDir.endsWith(File.separator)) {
            ssDir = baseDir + ssDir;
        } else {
            ssDir = baseDir + File.separator + ssDir;
        }
        return ssDir;
    }

    public void downloadSnapshotFile( String ssId, HttpServletResponse response ) throws PrepException {
        PrepSnapshot snapshot = this.snapshotRepository.findOne(ssId);
        if(snapshot!=null) {
            try {
                PrepSnapshot.SS_TYPE ss_type = snapshot.getSsTypeEnum();
                if( PrepSnapshot.SS_TYPE.FILE==ss_type ) {
                    PrepSnapshot.FORMAT format = snapshot.getFormatEnum();
                    if (PrepSnapshot.FORMAT.CSV == format) {
                        String dirPath = snapshot.getUri();
                        File dirSnapshot = new File(dirPath);
                        for (File fileSnap : dirSnapshot.listFiles()) {
                            FileInputStream fis = null;
                            try {
                                fis = new FileInputStream(fileSnap);
                                byte[] outputByte = new byte[8192];
                                int len = 0;
                                while ((len = fis.read(outputByte)) != -1) {
                                    response.getOutputStream().write(outputByte, 0, len);
                                }
                                fis.close();
                            } catch (IOException e) {
                            } finally {
                                if (fis != null) {
                                    fis.close();
                                    fis = null;
                                }
                            }
                        }
                    } else if (PrepSnapshot.FORMAT.JSON == format) {
                        LOGGER.error("downloadSnapshotFile(): file not supported: JSON");
                        throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_PREP_FILE_TYPE_NOT_SUPPORTED);
                    }
                } else if( PrepSnapshot.SS_TYPE.HDFS==ss_type ) {
                    Configuration conf = this.hdfsService.getConf();
                    FileSystem fs = FileSystem.get(conf);
                    String dirPath = snapshot.getUri();
                    Path thePath = new Path(dirPath);

                    if( false==fs.exists(thePath) ) {
                        throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_NOT_FOUND, dirPath);
                    }

                    FSDataInputStream inputStream = fs.open(thePath);
                    byte[] outputByte = new byte[8192];
                    int len = 0;
                    while ((len = inputStream.read(outputByte)) != -1) {
                        response.getOutputStream().write(outputByte, 0, len);
                    }
                    inputStream.close();
                    fs.close();
                } else if( PrepSnapshot.SS_TYPE.JDBC==ss_type ) {
                    LOGGER.error("downloadSnapshotFile(): not supported: JDBC");
                    throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_PREP_FILE_TYPE_NOT_SUPPORTED);
                } else if( PrepSnapshot.SS_TYPE.HIVE==ss_type ) {
                    String dbName = snapshot.getDbName();
                    String tblName = snapshot.getTblName();
                    String sql = "SELECT * FROM "+dbName+"."+tblName;
                    this.datasetSparkHiveService.writeSnapshot(response.getOutputStream(), dbName, sql);
                }
            } catch (Exception e) {
                throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
            }
        } else {
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_SNAPSHOT, "snapshot["+ssId+"] does not exist");
        }
    }

    public List<PrepSnapshot> getWorkList(String dsId, String option) {
        List<PrepSnapshot> snapshots = Lists.newArrayList();

        try {
            Sort sort = new Sort(Sort.Direction.DESC, "launchTime");
            List<PrepSnapshot> listAll = this.snapshotRepository.findAll(sort);
            for(PrepSnapshot ss : listAll) {
                if(true==dsId.equals(ss.getLineageInfoValue("dsId"))) {
                    if(option.toUpperCase().equals("ALL")){
                        snapshots.add(ss);
                    } else if(ss.getStatusEnum() != PrepSnapshot.STATUS.CANCELING && ss.getStatusEnum() != PrepSnapshot.STATUS.CANCELED){
                        snapshots.add(ss);
                    }
                }
            }
        } catch (Exception e) {
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

        return snapshots;
    }

    public PrepSnapshot.STATUS getSnapshotStatus(String ssId) {
        try {
            Sort sort = new Sort(Sort.Direction.DESC, "launchTime");
            List<PrepSnapshot> listAll = this.snapshotRepository.findAll(sort);
            for(PrepSnapshot ss : listAll) {
                if(ssId.equals(ss.getSsId())) {
                   return ss.getStatusEnum();
                }
            }
        } catch (Exception e) {
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

        return null;
    }

    public void updateSnapshotStatus(String ssId, PrepSnapshot.STATUS status) {
        try {
            Sort sort = new Sort(Sort.Direction.DESC, "launchTime");
            List<PrepSnapshot> listAll = this.snapshotRepository.findAll(sort);
            for(PrepSnapshot ss : listAll) {
                if(ssId.equals(ss.getSsId())) {
                    ss.setStatus(status);
                    this.snapshotRepository.saveAndFlush(ss);
                    break;
                }
            }
        } catch (Exception e) {
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }
    }

    public Map<String,Object> getSnapshotLineageInfo(String ssId) {
        try {
            Sort sort = new Sort(Sort.Direction.DESC, "launchTime");
            List<PrepSnapshot> listAll = this.snapshotRepository.findAll(sort);
            for(PrepSnapshot ss : listAll) {
                if(ssId.equals(ss.getSsId())) {
                    return ss.getJsonLineageInfo();
                }
            }
        } catch (Exception e) {
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

        return null;
    }
}
