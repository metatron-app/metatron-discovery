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
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformService;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.apache.http.HttpStatus;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.PersistentEntityResource;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RequestMapping(value = "/preparationdatasets")
@RepositoryRestController
public class PrepDatasetController {

    private static Logger LOGGER = LoggerFactory.getLogger(PrepDatasetController.class);

    @Autowired
    ProjectionFactory projectionFactory;

    @Autowired
    PrepPreviewLineService previewLineService;

    @Autowired(required = false)
    private PrepDatasetFileService datasetFileService;

    @Autowired(required = false)
    private PrepDatasetJdbcService datasetJdbcService;

    @Autowired(required = false)
    private PrepDatasetSparkHiveService datasetSparkHiveService;

    @Autowired(required = false)
    private PrepHdfsService hdfsService;

    @Autowired(required = false)
    private PrepDatasetService datasetService;

    @Autowired
    private PrepDatasetRepository datasetRepository;

    @Autowired
    private PrepSnapshotRepository snapshotRepository;

    @Autowired(required = false)
    PrepTransformService transformService;

    @Autowired(required = false)
    PrepProperties prepProperties;

    @Value("${spring.http.multipart.max-file-size}")
    String maxFileSize;

    Long limitSize;
    public Long getLimitSize() {
        if(null==limitSize) {
            limitSize = 0L;
            if (null != maxFileSize) {
                maxFileSize = maxFileSize.toUpperCase();
                if (true == maxFileSize.endsWith("KB")) {
                    limitSize = Long.parseLong(maxFileSize.replace("KB", "").trim()) * 1024;
                } else if (true == maxFileSize.endsWith("MB")) {
                    limitSize = Long.parseLong(maxFileSize.replace("MB", "").trim()) * 1024 * 1024;
                } else if (true == maxFileSize.endsWith("GB")) {
                    limitSize = Long.parseLong(maxFileSize.replace("GB", "").trim()) * 1024 * 1024 * 1024;
                } else if (true == maxFileSize.endsWith("TB")) {
                    limitSize = Long.parseLong(maxFileSize.replace("TB", "").trim()) * 1024 * 1024 * 1024 * 1024;
                }
            }
        }
        return limitSize;
    }

    @RequestMapping(value="", method = RequestMethod.POST)
    public @ResponseBody
    PersistentEntityResource postDataset(
            @RequestBody Resource<PrepDataset> datasetResource,
            PersistentEntityResourceAssembler resourceAssembler
    ) {
        PrepDataset dataset = null;
        PrepDataset savedDataset = null;

        try {
            dataset = datasetResource.getContent();
            savedDataset = datasetRepository.save(dataset);
            LOGGER.debug(savedDataset.toString());

            this.datasetService.afterCreate(savedDataset);

            this.datasetRepository.flush();
        } catch (Exception e) {
            LOGGER.error("postDataset(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_DATASET_FAIL_TO_SAVE, e.getMessage());
        }

        return resourceAssembler.toResource(savedDataset);
    }

    @RequestMapping(value = "/{dsId}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getDataset(
            @PathVariable("dsId") String dsId,
            @RequestParam(value="projection", required=false, defaultValue="default") String projection,
            PersistentEntityResourceAssembler persistentEntityResourceAssembler
    ) {
        PrepDataset dataset = null;
        try {
            dataset = this.datasetRepository.findOne(dsId);
            if(dataset!=null) {
                if(true == projection.equalsIgnoreCase("detail")) {
                    DataFrame dataFrame = this.previewLineService.getPreviewLines(dsId);
                    dataset.setGridResponse(dataFrame);
                }

                Map<String,Object> connectionInfo = this.datasetService.getConnectionInfo(dataset.getDcId());
                dataset.setConnectionInfo(connectionInfo);

            } else {
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATASET, dsId);
            }
        } catch (Exception e) {
            LOGGER.error("getDataset(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(persistentEntityResourceAssembler.toFullResource(dataset));
    }

    @RequestMapping(value = "/{dsId}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteDataset(
            @PathVariable("dsId") String dsId
    ) {
        try {
            PrepDataset dataset =  this.datasetRepository.findOne(dsId);
            if(dataset!=null) {
                List<PrepDataflow> dataflows = dataset.getDataflows();
                if (dataflows!=null && 1<dataflows.size()) {
                    String errorMsg = "dataset[" + dsId + "] has one more dataflows. it can't be deleted";
                    throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_USING_OTHER_DATAFLOW, errorMsg);
                } else {
                    for (PrepDataflow dataflow : dataflows) {
                        dataflow.deleteDataset(dataset);
                        break;
                    }
                    this.datasetRepository.delete(dataset);
                    this.datasetRepository.flush();
                }
            } else {
                String errorMsg = "dataset["+dsId+"] is not exist";
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATASET, errorMsg);
            }
        } catch (Exception e) {
            LOGGER.error("deleteDataset(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(dsId);
    }

    @RequestMapping(value = "/delete_chain/{dsId}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteChain(
            @PathVariable("dsId") String dsId
    ) {

        List<String> deleteDsIds = Lists.newArrayList();
        try {
            List<String> upstreamDsIds = Lists.newArrayList();
            List<PrepUpstream> upstreams = Lists.newArrayList();
            PrepDataset dataset =  this.datasetRepository.findOne(dsId);
            if(dataset==null) {
                String errorMsg = "dsId["+dsId+"] is not exist";
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATASET, errorMsg);
            } else {
                upstreamDsIds.add(dsId);
                List<PrepDataflow> dataflows = dataset.getDataflows();
                if(dataflows!=null) {
                    for(PrepDataflow dataflow: dataflows) {
                        if (null != dataflow) {
                            List<PrepDataset> datasets = dataflow.getDatasets();
                            if (null != datasets) {
                                for (PrepDataset ds : datasets) {
                                    String dId = ds.getDsId();
                                    List<String> uIds = this.transformService.getUpstreamDsIds(ds.getDsId(), false);
                                    for(String uDsId : uIds) {
                                        PrepUpstream upstream = new PrepUpstream();
                                        upstream.setDfId(dataflow.getDfId());
                                        upstream.setDsId(dId);
                                        upstream.setUpstreamDsId(uDsId);
                                        upstreams.add(upstream);
                                    }
                                }
                            }
                        }
                    }
                }
                while(0<upstreamDsIds.size()) {
                    List<String> downDsIds = Lists.newArrayList();
                    for(PrepUpstream upstream : upstreams) {
                        String uDsId = upstream.getUpstreamDsId();
                        if(true==upstreamDsIds.contains(uDsId)) {
                            downDsIds.add( upstream.getDsId() );
                        }
                    }
                    for(String uDsId : upstreamDsIds) {
                        if(false==deleteDsIds.contains(uDsId)) {
                            deleteDsIds.add(uDsId);
                        }
                    }
                    upstreamDsIds.clear();
                    upstreamDsIds.addAll(downDsIds);
                }

                for(String deleteDsId : deleteDsIds) {
                    PrepDataset delDs = this.datasetRepository.findOne(deleteDsId);
                    if(delDs!=null) {
                        List<PrepDataflow> dfs = delDs.getDataflows();
                        if(null!=dfs) {
                            for(PrepDataflow df : dfs) {
                                df.deleteDataset(delDs);
                            }
                        }
                        this.datasetRepository.delete(delDs);
                    }
                }
            }
        } catch (Exception e) {
            LOGGER.error("deleteChain(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(deleteDsIds);
    }

    @RequestMapping(value = "/delete_datasets", method = RequestMethod.PUT)
    @ResponseBody
    public ResponseEntity<?> deleteDatasets(
            @RequestBody List<String> dsIds
    ) {
        List<String> deletedDsIds = Lists.newArrayList();
        try {
            List<PrepDataset> datasets = Lists.newArrayList();
            for(String dsId: dsIds) {
                PrepDataset dataset = this.datasetRepository.findOne(dsId);
                if(dataset!=null) {
                    List<PrepDataflow> dataflows = dataset.getDataflows();
                    if (dataflows != null && 1 < dataflows.size()) {
                        continue;
                    } else {
                        for (PrepDataflow dataflow : dataflows) {
                            dataflow.deleteDataset(dataset);
                            break;
                        }
                        this.datasetRepository.delete(dataset);
                        this.datasetRepository.flush();
                        deletedDsIds.add(dataset.getDsId());
                    }
                }
            }
        } catch (Exception e) {
            LOGGER.error("deleteDatasets(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(deletedDsIds);
    }

    @RequestMapping(value = "/getStagingConnection", method = RequestMethod.GET)
    public @ResponseBody ResponseEntity<?> getStagingConnection() {
        Map<String, Object> response = Maps.newHashMap();
        try {
            response.put("implementor","HIVE");
            response.put("hostname", prepProperties.getHiveHostname(true));
            response.put("port",     String.valueOf(prepProperties.getHivePort(true)));
            response.put("username", prepProperties.getHiveUsername(true));
            response.put("password", prepProperties.getHivePassword(true));
            response.put("url",      prepProperties.getHiveCustomUrl(true));
        } catch (PrepException pe) {
            LOGGER.error("getStaingConnection(): caught an preparation exception: ", pe);
            throw pe;
        } catch (Exception e) {
            LOGGER.error("getStaingConnection(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/jdbc", method = RequestMethod.GET)
    public @ResponseBody ResponseEntity<?> previewJdbc(
            @RequestParam(value = "sql", required = false, defaultValue = "") String sql,
            @RequestParam(value = "dcid", required = false, defaultValue = "") String dcid,
            @RequestParam(value = "dbname", required = false, defaultValue = "") String dbname,
            @RequestParam(value = "tblname", required = false, defaultValue = "") String tblname,
            @RequestParam(value = "size", required = false, defaultValue = "50") String size ) {
        Map<String, Object> response = null;
        try {
            response = this.datasetJdbcService.getPreviewJdbc(dcid, sql,dbname,tblname,size);
        } catch (Exception e) {
            LOGGER.error("previewJdbc(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/staging", method = RequestMethod.GET)
    public @ResponseBody ResponseEntity<?> previewStaging(
            @RequestParam(value = "sql", required = false, defaultValue = "") String sql,
            @RequestParam(value = "dbname", required = false, defaultValue = "") String dbname,
            @RequestParam(value = "tblname", required = false, defaultValue = "") String tblname,
            @RequestParam(value = "size", required = false, defaultValue = "50") String size ) {
        Map<String, Object> response = null;
        try {
            response = this.datasetSparkHiveService.getPreviewStagedb(sql,dbname,tblname,size);
        } catch (Exception e) {
            LOGGER.error("previewStaging(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/query/schemas", method = RequestMethod.POST)
    public @ResponseBody ResponseEntity<?> querySchemas(
            @RequestBody PrepQueryRequest queryRequest ) {

        List<String> response;

        try {
            response = this.datasetSparkHiveService.getQuerySchemas(queryRequest);
        } catch (Exception e) {
            LOGGER.error("querySchemas(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/query/tables", method = RequestMethod.POST)
    public @ResponseBody ResponseEntity<?> queryTables(
            @RequestBody PrepQueryRequest queryRequest ) {

        List<String> response = null;

        try {
            response = this.datasetSparkHiveService.getQueryTables(queryRequest);
        } catch (Exception e) {
            LOGGER.error("queryTables(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/reload_preview/{dsId}", method = RequestMethod.GET)
    public @ResponseBody ResponseEntity<?> previewFileCheckSheet(@PathVariable(value = "dsId") String dsId,
            @RequestParam(value = "sheetindex", required = false, defaultValue = "0") String sheetindex,
            @RequestParam(value = "resultSize", required = false, defaultValue = "2000") String size ) {
        Map<String, Object> response = null;
        /*
        try {
            PrepDataset dataset = this.datasetRepository.findOne(dsId);
            if(null==dataset) {
                LOGGER.error("previewFileCheckSheet(): no dataset : "+ dsId);
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATASET);
            }
            if(dataset.getDsTypeForEnum() != PrepDataset.DS_TYPE.IMPORTED) {
                LOGGER.error("previewFileCheckSheet(): not imported type : "+ dsId);
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NOT_IMPORTED_DATASET);
            }
            if(dataset.getImportTypeEnum()==PrepDataset.IMPORT_TYPE.FILE) {
                String filekey = dataset.getFilekey();
                if (null != filekey) {
                    DataFrame dataFrame = this.datasetFileService.getPreviewLinesFromFileForDataFrame(dataset, filekey, sheetindex, size);
                    if (null != dataFrame) {
                        int previewSize = this.previewLineService.putPreviewLines(dsId, dataFrame);
                        response = Maps.newHashMap();
                        response.put("gridResponse", dataFrame);
                    }
                }
            } else if(dataset.getImportTypeEnum()==PrepDataset.IMPORT_TYPE.HIVE) {
                DataFrame dataFrame = this.datasetSparkHiveService.getPreviewLinesFromStagedbForDataFrame(dataset,size);
                if (null != dataFrame) {
                    int previewSize = this.previewLineService.putPreviewLines(dsId, dataFrame);
                    response = Maps.newHashMap();
                    response.put("gridResponse", dataFrame);
                }
            } else if(dataset.getImportTypeEnum()==PrepDataset.IMPORT_TYPE.DB) {
                DataFrame dataFrame = this.datasetJdbcService.getPreviewLinesFromJdbcForDataFrame(dataset,size);
                if (null != dataFrame) {
                    int previewSize = this.previewLineService.putPreviewLines(dsId, dataFrame);
                    response = Maps.newHashMap();
                    response.put("gridResponse", dataFrame);
                }
            }
        } catch (Exception e) {
            LOGGER.error("previewFileCheckSheet(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,e);
        }
        */
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/file/{fileKey:.+}", method = RequestMethod.GET)
    public @ResponseBody ResponseEntity<?> fileCheckSheet(@PathVariable(value = "fileKey") String fileKey,
                                                          @RequestParam(value = "sheetname", required = false) String sheetname,
                                                          @RequestParam(value = "sheetindex", required = false, defaultValue = "0") String sheetindex,
                                                          @RequestParam(value = "resultSize", required = false, defaultValue = "250") String size,
                                                          @RequestParam(value = "delimiterRow", required = false, defaultValue = "\n") String delimiterRow,
                                                          @RequestParam(value = "delimiterCol", required = false, defaultValue = ",") String delimiterCol,
                                                          @RequestParam(value = "hasFields", required = false, defaultValue = "N") String hasFieldsFlag) {
        Map<String, Object> response = null;
        try {
            response = this.datasetFileService.fileCheckSheet3( fileKey, size, delimiterRow, delimiterCol );
        } catch (Exception e) {
            LOGGER.error("fileCheckSheet(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,e);
        }
        return ResponseEntity.ok(response);
    }

    /*
    @RequestMapping(value = "/upload", method = RequestMethod.POST, produces = "application/json")
    public @ResponseBody ResponseEntity<?> uploadExcelfile(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = null;
        try {
          response = this.datasetFileService.uploadFile2(file);
        } catch (Exception e) {
            LOGGER.error("uploadExcelfile(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,e);
        }
        return ResponseEntity.status(HttpStatus.SC_CREATED).body(response);
    }
    */

    @RequestMapping(value = "/upload_async", method = RequestMethod.POST, produces = "application/json")
    public @ResponseBody ResponseEntity<?> upload_async(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = null;
        try {
            response = this.datasetFileService.uploadFile(file);
        } catch (Exception e) {
            LOGGER.error("upload_async(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,e);
        }
        return ResponseEntity.status(HttpStatus.SC_CREATED).body(response);
    }

    @RequestMapping(value = "/upload_async_poll", method = RequestMethod.POST, produces = "application/json")
    public @ResponseBody ResponseEntity<?> upload_async_poll(@RequestBody String fileKey) {
        Map<String, Object> response = null;
        try {
            response = this.datasetFileService.pollUploadFile(fileKey);
        } catch (Exception e) {
            LOGGER.error("upload_async_poll(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,e);
        }
        return ResponseEntity.status(HttpStatus.SC_CREATED).body(response);
    }

    @RequestMapping(value = "/check_hdfs", method = RequestMethod.GET, produces = "application/json")
    public @ResponseBody ResponseEntity<?> checkHdfs() {
        Map<String, Object> response = new HashMap();
        try {
            if (prepProperties.isHDFSConfigured()) {
                response.put("stagingBaseDir", prepProperties.getStagingBaseDir(true));
            }
        } catch (Exception e) {
            LOGGER.error("uploadExcelfile(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,e);
        }
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/file_upload", method = RequestMethod.GET, produces = "application/json")
    public @ResponseBody ResponseEntity<?> file_upload() {
        Map<String, Object> response = null;
        try {
            response = Maps.newHashMap();

            String fileKey = UUID.randomUUID().toString();
            response.put("file_key", fileKey);

            DateTime now = DateTime.now();
            response.put("timestamp", now.getMillis());

            response.put("limit_size", getLimitSize());

            List<String> uploadLocations = Lists.newArrayList();
            uploadLocations.add("LOCAL");
            uploadLocations.add("HDFS");
            uploadLocations.add("S3");
            response.put("upload_location", uploadLocations);
        } catch (Exception e) {
            LOGGER.error("upload_async_poll(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,e);
        }
        return ResponseEntity.status(HttpStatus.SC_CREATED).body(response);
    }

    @RequestMapping(value = "/file_upload", method = RequestMethod.POST, produces = "application/json")
    public @ResponseBody ResponseEntity<?> file_upload(
            /*
            @RequestBody String fileKey,
            @RequestBody String uploadLocation,
            @RequestBody Integer chunkIndex,
            @RequestBody Integer totalChunk,
            */
            @RequestPart("resumableChunkNumber") Integer resumableChunkNumber,
            @RequestPart("resumableChunkSize") Integer resumableChunkSize,
            @RequestPart("resumableCurrentChunkSize") Integer resumableCurrentChunkSize,
            @RequestPart("resumableTotalSize") Integer resumableTotalSize,
            @RequestPart("resumableType") String resumableType,
            @RequestPart("resumableIdentifier") String resumableIdentifier,
            @RequestPart("resumableFilename") String resumableFilename,
            @RequestPart("resumableRelativePath") String resumableRelativePath,
            @RequestPart("resumableTotalChunks") Integer resumableTotalChunks,
            @RequestPart("file") MultipartFile file
    ) {
        Map<String, Object> response = null;
        String resumableResult = "partly_done";
        try {
            response = Maps.newHashMap();

            response.put("status","success");

            if(resumableChunkNumber==resumableTotalChunks) {
                resumableResult = "done";
            }
        } catch (Exception e) {
            LOGGER.error("upload_async(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,e);
        }
        return ResponseEntity.status(HttpStatus.SC_CREATED).body(resumableResult);
    }

    @RequestMapping(value = "/ready_to_preview/{dsId}", method = RequestMethod.GET, produces = "application/json")
    public @ResponseBody ResponseEntity<?> ready_to_preview(
            @PathVariable("dsId") String dsId
    ) {
        Map<String, Object> response = null;
        try {
            response = this.previewLineService.ready_to_preview(dsId);
        } catch (Exception e) {
            LOGGER.error("ready_to_preview(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,e);
        }
        return ResponseEntity.status(HttpStatus.SC_OK).body(response);
    }
}
