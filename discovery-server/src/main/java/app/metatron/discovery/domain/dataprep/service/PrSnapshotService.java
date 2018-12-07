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

package app.metatron.discovery.domain.dataprep.service;

import app.metatron.discovery.domain.dataprep.PrepDatasetSparkHiveService;
import app.metatron.discovery.domain.dataprep.PrepHdfsService;
import app.metatron.discovery.domain.dataprep.PrepProperties;
import app.metatron.discovery.domain.dataprep.repository.PrDataflowRepository;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.repository.PrSnapshotRepository;
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
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@Service
public class PrSnapshotService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrSnapshotService.class);

    @Autowired
    private PrSnapshotRepository snapshotRepository;

    @Autowired
    PrDataflowRepository dataflowRepository;

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

    public String escapeUri(String strUri) {
        String[] splited = strUri.split("/");
        if(0<splited.length) {
            splited[splited.length - 1] = splited[splited.length - 1].replaceAll("[\\\\/:*?\"<>|\\s]", "_");
        }

        return String.join("/",splited);
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
        PrSnapshot snapshot = this.snapshotRepository.findOne(ssId);
        if(snapshot!=null) {
            try {
                PrSnapshot.SS_TYPE ss_type = snapshot.getSsType();
                if( PrSnapshot.SS_TYPE.URI==ss_type ) {
                      // uri -> directory, storedUri -> single file
                    //                        String dirPath = snapshot.getHiveExtDir();
                    //                        File dirSnapshot = new File(dirPath);
                    //                        for (File fileSnap : dirSnapshot.listFiles()) {
                    //                            FileInputStream fis = null;
                    //                            try {
                    //                                fis = new FileInputStream(fileSnap);
                    //                                byte[] outputByte = new byte[8192];
                    //                                int len = 0;
                    //                                while ((len = fis.read(outputByte)) != -1) {
                    //                                    response.getOutputStream().write(outputByte, 0, len);
                    //                                }
                    //                                fis.close();
                    //                            } catch (IOException e) {
                    //                            } finally {
                    //                                if (fis != null) {
                    //                                    fis.close();
                    //                                    fis = null;
                    //                                }
                    //                            }
                    //                        }

                    String storedUri = snapshot.getStoredUri();
                    URI uri = new URI(storedUri);

                    switch (uri.getScheme()) {
                        case "file":
                            FileInputStream fis;
                            try {
                                fis = new FileInputStream(new File(new URI(storedUri)));
                            } catch (FileNotFoundException e) {
                                e.printStackTrace();
                                throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_NOT_FOUND, storedUri);
                            } catch (URISyntaxException e) {
                                e.printStackTrace();
                                throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_MALFORMED_URI_SYNTAX, storedUri);
                            }
                            int len;
                            byte[] buf = new byte[8192];
                            while ((len = fis.read(buf)) != -1) {
                                response.getOutputStream().write(buf, 0, len);
                            }
                            fis.close();
                            break;
                        case "hdfs":
                            Configuration conf = this.hdfsService.getConf();
                            FileSystem fs = FileSystem.get(conf);
                            Path path = new Path(new URI(storedUri));

                            if( false==fs.exists(path) ) {
                                throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_NOT_FOUND, storedUri);
                            }

                            FSDataInputStream inputStream = fs.open(path);
                            byte[] outputByte = new byte[8192];
                            while ((len = inputStream.read(outputByte)) != -1) {
                                response.getOutputStream().write(outputByte, 0, len);
                            }
                            inputStream.close();
                            fs.close();
                            break;
                        default:
                            assert false : uri.getScheme();
                      }

//                } else if( PrSnapshot.SS_TYPE.JDBC==ss_type ) {
//                    LOGGER.error("downloadSnapshotFile(): not supported: JDBC");
//                    throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_PREP_FILE_TYPE_NOT_SUPPORTED);
                } else if( PrSnapshot.SS_TYPE.STAGING_DB==ss_type ) {
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

    private void deleteFile(File deleteFolder) {
        if(deleteFolder.exists()){
            File[] deleteFolderList = deleteFolder.listFiles();

            for(File file : deleteFolderList) {
                if(file.isFile()) {
                    file.delete();
                }else {
                    deleteFile(file);
                }
            }

            deleteFolder.delete();
        }
    }

    public void deleteSnapshot(String ssId) throws PrepException {
        PrSnapshot snapshot = this.snapshotRepository.findOne(ssId);
        if(snapshot!=null) {
            try {
                PrSnapshot.SS_TYPE ss_type = snapshot.getSsType();
                if( PrSnapshot.SS_TYPE.URI==ss_type ) {
//                    PrSnapshot.URI_FILE_FORMAT uriFileFormat = snapshot.getUriFileFormat();
//                    if (PrSnapshot.URI_FILE_FORMAT.CSV == uriFileFormat) {

//                        String dirPath = snapshot.getHiveExtDir();
//                        if(dirPath!=null) {
//                            File dirSnapshot = new File(dirPath);
//                            if (dirSnapshot.exists()) {
//                                deleteFile(dirSnapshot);
//                            } else {
//                                LOGGER.info("deleteSnapshot(): the file does not exists");
//                            }
//                        } else {
//                            LOGGER.info("deleteSnapshot(): the file does not exists");
//                        }

                      String storedUri = snapshot.getStoredUri();
                      URI uri = new URI(storedUri);

                      switch (uri.getScheme()) {
                          case "file":
                              File file = null;
                              try {
                                  file = new File(new URI(storedUri));
                              } catch (URISyntaxException e) {
                                  e.printStackTrace();
                              }
                              file.delete();
                              break;
                          case "hdfs":
                              Configuration conf = this.hdfsService.getConf();
                              if (storedUri == null) {
                                  LOGGER.info("deleteSnapshot(): the file does not exists");
                                  break;
                              }

                              try {
                                  FileSystem fs = FileSystem.get(conf);
                                  Path path = new Path(new URI(storedUri));

                                  if (!fs.exists(path)) {
                                      LOGGER.info("deleteSnapshot(): the file does not exists");
                                      break;
                                  }

                                  fs.delete(path, true);
                                  fs.close();
                              } catch (IOException e) {
                                  e.printStackTrace();
                                  throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_DELETE_SNAPSHOT, storedUri);
                              } catch (URISyntaxException e) {
                                  e.printStackTrace();
                                  throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_MALFORMED_URI_SYNTAX, storedUri);
                              }

                              break;
                          default:
                              assert false : uri.getScheme();
                      }
//                    } else if (PrSnapshot.URI_FILE_FORMAT.JSON == uriFileFormat) {
//                        LOGGER.error("deleteSnapshot(): file not supported: JSON");
//                        throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_PREP_FILE_TYPE_NOT_SUPPORTED);
//                    }
//                } else if( PrSnapshot.SS_TYPE.HDFS==ss_type ) {
//                    Configuration conf = this.hdfsService.getConf();
//                    FileSystem fs = FileSystem.get(conf);
//                    String dirPath = snapshot.getHiveExtDir();
//                    if(dirPath!=null) {
//                        dirPath = dirPath.substring(0, dirPath.lastIndexOf("/"));
//                        Path thePath = new Path(dirPath);
//
//                        if (!fs.exists(thePath)) {
//                            LOGGER.info("deleteSnapshot(): the file does not exists");
//                        }
//
//                        fs.delete(thePath, true);
//                        fs.close();
//                    } else {
//                        fs.close();
//                        LOGGER.info("deleteSnapshot(): the file does not exists");
//                    }
//                } else if( PrSnapshot.SS_TYPE.JDBC==ss_type ) {
//                    LOGGER.error("deleteSnapshot(): file not supported: JDBC");
//                    throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_PREP_FILE_TYPE_NOT_SUPPORTED);
                } else if( PrSnapshot.SS_TYPE.STAGING_DB==ss_type ) {
                    String dbName = snapshot.getDbName();
                    String tblName = snapshot.getTblName();
                    String sql = "DROP TABLE IF EXISTS "+dbName+"."+tblName;
                    this.datasetSparkHiveService.dropHiveSnapshotTable(sql);
                }
            } catch (Exception e) {
                throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
            }
        } else {
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_SNAPSHOT, "snapshot["+ssId+"] does not exist");
        }
    }

    public List<PrSnapshot> getWorkList(String dsId, String option) {
        List<PrSnapshot> snapshots = Lists.newArrayList();

        try {
            Sort sort = new Sort(Sort.Direction.DESC, "launchTime");
            List<PrSnapshot> listAll = this.snapshotRepository.findAll(sort);
            for(PrSnapshot ss : listAll) {
                //if(true==dsId.equals(ss.getLineageInfoValue("dsId"))) {
                if(true==dsId.equals(ss.getDsId())) {
                    if(option.toUpperCase().equals("ALL")){
                        snapshots.add(ss);
                    } else if(ss.getStatus() != PrSnapshot.STATUS.CANCELING && ss.getStatus() != PrSnapshot.STATUS.CANCELED){
                        snapshots.add(ss);
                    }
                }
            }
        } catch (Exception e) {
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

        return snapshots;
    }

    public PrSnapshot.STATUS getSnapshotStatus(String ssId) {
        try {
            Sort sort = new Sort(Sort.Direction.DESC, "launchTime");
            List<PrSnapshot> listAll = this.snapshotRepository.findAll(sort);
            for(PrSnapshot ss : listAll) {
                if(ssId.equals(ss.getSsId())) {
                   return ss.getStatus();
                }
            }
        } catch (Exception e) {
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }

        return null;
    }

    public void updateSnapshotStatus(String ssId, PrSnapshot.STATUS status) {
        try {
            Sort sort = new Sort(Sort.Direction.DESC, "launchTime");
            List<PrSnapshot> listAll = this.snapshotRepository.findAll(sort);
            for(PrSnapshot ss : listAll) {
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
            List<PrSnapshot> listAll = this.snapshotRepository.findAll(sort);
            for(PrSnapshot ss : listAll) {
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
