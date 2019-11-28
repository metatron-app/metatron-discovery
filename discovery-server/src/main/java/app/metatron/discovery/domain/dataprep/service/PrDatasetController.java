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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.io.FilenameUtils;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.domain.dataprep.PrepDatasetFileService;
import app.metatron.discovery.domain.dataprep.PrepPreviewLineService;
import app.metatron.discovery.domain.dataprep.PrepProperties;
import app.metatron.discovery.domain.dataprep.entity.PrDataflow;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.entity.PrDataset.DS_TYPE;
import app.metatron.discovery.domain.dataprep.entity.PrDatasetProjections;
import app.metatron.discovery.domain.dataprep.entity.PrUploadFile;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.repository.PrDatasetRepository;
import app.metatron.discovery.domain.dataprep.repository.PrUploadFileRepository;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformService;
import app.metatron.discovery.domain.storage.StorageProperties;

import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FILE_KEY_MISSING;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_NOT_IMPORTED_DATASET;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_NO_DATASET;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_URI_SCHEME;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.datasetError;

@RequestMapping(value = "/preparationdatasets")
@RepositoryRestController
public class PrDatasetController {

  private static Logger LOGGER = LoggerFactory.getLogger(PrDatasetController.class);

  @Autowired
  ProjectionFactory projectionFactory;

  @Autowired
  PrepPreviewLineService previewLineService;

  @Autowired
  private PrepDatasetFileService datasetFileService;

  @Autowired
  private PrDatasetService datasetService;

  @Autowired
  private PrDatasetRepository datasetRepository;

  @Autowired
  private PrUploadFileRepository uploadFileRepository;

  @Autowired
  PrepTransformService transformService;

  @Autowired
  PrepProperties prepProperties;

  @Autowired(required = false)
  StorageProperties storageProperties;

  @Value("${spring.http.multipart.max-file-size}")
  String maxFileSize;

  Long limitSize;

  public Long getLimitSize() {
    long unit = 1000; // for safe, long unit = 1024;
    if (null == limitSize) {
      limitSize = 0L;
      if (null != maxFileSize) {
        maxFileSize = maxFileSize.toUpperCase();
        if (true == maxFileSize.endsWith("KB")) {
          limitSize = Long.parseLong(maxFileSize.replace("KB", "").trim()) * unit;
        } else if (true == maxFileSize.endsWith("MB")) {
          limitSize = Long.parseLong(maxFileSize.replace("MB", "").trim()) * unit * unit;
        } else if (true == maxFileSize.endsWith("GB")) {
          limitSize = Long.parseLong(maxFileSize.replace("GB", "").trim()) * unit * unit * unit;
        } else if (true == maxFileSize.endsWith("TB")) {
          limitSize = Long.parseLong(maxFileSize.replace("TB", "").trim()) * unit * unit * unit * unit;
        }
      }
    }
    return limitSize;
  }

  @RequestMapping(value = "", method = RequestMethod.POST)
  public
  @ResponseBody
  PersistentEntityResource postDataset(
          @RequestParam(value = "storageType", required = false, defaultValue = "") String storageType,
          @RequestBody Resource<PrDataset> datasetResource,
          PersistentEntityResourceAssembler resourceAssembler
  ) {
    PrDataset dataset;
    PrDataset savedDataset;

    try {
      dataset = datasetResource.getContent();
      datasetService.setConnectionInfo(dataset);
      savedDataset = datasetRepository.save(dataset);
      LOGGER.debug(savedDataset.toString());

      if (dataset.getImportType() == PrDataset.IMPORT_TYPE.UPLOAD
              || dataset.getImportType() == PrDataset.IMPORT_TYPE.URI) {
        datasetService.changeFileFormatToCsv(dataset);
      }

      datasetService.savePreview(savedDataset);

      datasetRepository.flush();
    } catch (Exception e) {
      LOGGER.error("postDataset(): caught an exception: ", e);
      throw datasetError(PrepMessageKey.MSG_DP_ALERT_DATASET_FAIL_TO_CREATE, e.getMessage());
    }

    return resourceAssembler.toResource(savedDataset);
  }

  @RequestMapping(value = "/{dsId}", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getDataset(
          @PathVariable("dsId") String dsId,
          @RequestParam(value = "preview", required = false, defaultValue = "false") Boolean preview,
          PersistentEntityResourceAssembler persistentEntityResourceAssembler
  ) {
    PrDataset dataset = null;
    Resource<PrDatasetProjections.DefaultProjection> projectedDataset;
    try {
      dataset = getDatasetEntity(dsId);
      if (true == preview) {
        DataFrame dataFrame = previewLineService.getPreviewLines(dsId);
        dataset.setGridResponse(dataFrame);
      }

      PrDatasetProjections.DefaultProjection projection = projectionFactory
              .createProjection(PrDatasetProjections.DefaultProjection.class, dataset);
      projectedDataset = new Resource<>(projection);
    } catch (Exception e) {
      LOGGER.error("getDataset(): caught an exception: ", e);
      throw datasetError(e);
    }

    return ResponseEntity.status(HttpStatus.SC_OK).body(projectedDataset);
  }

  @RequestMapping(value = "/{dsId}", method = RequestMethod.PATCH)
  @ResponseBody
  public ResponseEntity<?> patchDataset(
          @PathVariable("dsId") String dsId,
          @RequestBody Resource<PrDataset> datasetResource,
          PersistentEntityResourceAssembler persistentEntityResourceAssembler
  ) {

    PrDataset dataset;
    PrDataset patchDataset;
    PrDataset savedDataset;
    Resource<PrDatasetProjections.DefaultProjection> projectedDataset;

    try {
      dataset = datasetRepository.findOne(dsId);
      patchDataset = datasetResource.getContent();

      datasetService.patchAllowedOnly(dataset, patchDataset);

      savedDataset = datasetRepository.save(dataset);
      LOGGER.debug(savedDataset.toString());

      datasetRepository.flush();
    } catch (Exception e) {
      LOGGER.error("postDataset(): caught an exception: ", e);
      throw datasetError(e);
    }

    PrDatasetProjections.DefaultProjection projection = projectionFactory
            .createProjection(PrDatasetProjections.DefaultProjection.class, savedDataset);
    projectedDataset = new Resource<>(projection);
    return ResponseEntity.status(HttpStatus.SC_OK).body(projectedDataset);
  }

  @RequestMapping(value = "/{dsId}", method = RequestMethod.DELETE)
  @ResponseBody
  public ResponseEntity<?> deleteDataset(
          @PathVariable("dsId") String dsId
  ) {
    try {
      PrDataset dataset = getDatasetEntity(dsId);
      List<PrDataflow> dataflows = dataset.getDataflows();
      if (dataflows != null && 1 < dataflows.size()) {
        String errorMsg = "dataset[" + dsId + "] has one more dataflows. it can't be deleted";
        throw datasetError(PrepMessageKey.MSG_DP_ALERT_USING_OTHER_DATAFLOW, errorMsg);
      } else {
        for (PrDataflow dataflow : dataflows) {
          dataflow.deleteDataset(dataset);
          break;
        }
        datasetRepository.delete(dataset);
        datasetRepository.flush();
      }
    } catch (Exception e) {
      LOGGER.error("deleteDataset(): caught an exception: ", e);
      throw datasetError(e);
    }

    return ResponseEntity.status(HttpStatus.SC_OK).body(dsId);
  }

  private List<PrDataflow> getDataflowsNonNull(PrDataset dataset) {
    List<PrDataflow> dataflows = dataset.getDataflows();
    if (dataflows == null) {
      return new ArrayList();
    }
    return dataflows;
  }

  private List<PrDataset> getDatasetsNonNull(PrDataflow dataflow) {
    List<PrDataset> datasets = dataflow.getDatasets();
    if (datasets == null) {
      return new ArrayList();
    }
    return datasets;
  }

  @RequestMapping(value = "/delete_chain/{dsId}", method = RequestMethod.DELETE)
  @ResponseBody
  public ResponseEntity<?> deleteChain(
          @PathVariable("dsId") String dsId
  ) {

    List<String> deleteDsIds = Lists.newArrayList();

    try {
      transformService.addDownstreamDsId(deleteDsIds, dsId, true);

      for (String deleteDsId : deleteDsIds) {
        PrDataset dataset = datasetRepository.findOne(deleteDsId);
        if (dataset != null) {
          List<PrDataflow> dataflows = dataset.getDataflows();
          if (dataflows != null) {
            for (PrDataflow dataflow : dataflows) {
              dataflow.deleteDataset(dataset);
            }
          }
          datasetRepository.delete(dataset);
        }
      }
    } catch (Exception e) {
      LOGGER.error("deleteChain(): caught an exception: ", e);
      throw datasetError(e);
    }

    return ResponseEntity.status(HttpStatus.SC_OK).body(deleteDsIds);
  }

  @RequestMapping(value = "/file_grid", method = RequestMethod.GET)
  public
  @ResponseBody
  ResponseEntity<?> fileGrid(
          @RequestParam(value = "storedUri", required = false) String storedUri,
          @RequestParam(value = "resultSize", required = false, defaultValue = "50") Integer size,
          @RequestParam(value = "delimiterRow", required = false, defaultValue = "\n") String delimiterRow,
          @RequestParam(value = "delimiterCol", required = false, defaultValue = ",") String delimiterCol,
          @RequestParam(value = "quoteChar", required = false, defaultValue = "") String quoteChar,
          @RequestParam(value = "manualColumnCount", required = false) Integer manualColumnCount,
          @RequestParam(value = "autoTyping", required = false, defaultValue = "true") String autoTyping) {
    Map<String, Object> response;
    try {
      datasetFileService.checkStoredUri(storedUri);
      response = datasetFileService
              .makeFileGrid(storedUri, size, delimiterCol, quoteChar, manualColumnCount, Boolean.parseBoolean(autoTyping));
    } catch (Exception e) {
      LOGGER.error("fileGrid(): caught an exception: ", e);
      throw datasetError(e);
    }
    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/file_upload", method = RequestMethod.GET, produces = "application/json")
  public
  @ResponseBody
  ResponseEntity<?> file_upload() {
    Map<String, Object> response = null;
    try {
      response = Maps.newHashMap();

      PrUploadFile uploadFile = new PrUploadFile();
      uploadFile = uploadFileRepository.save(uploadFile);

      String upload_id = uploadFile.getUploadId();
      response.put("upload_id", upload_id);

      DateTime now = uploadFile.getCreatedTime();
      response.put("timestamp", now.getMillis());

      response.put("limit_size", getLimitSize());

      List<PrDataset.STORAGE_TYPE> storageTypes = Lists.newArrayList();
      if (prepProperties.getLocalBaseDir() != null) {
        storageTypes.add(PrDataset.STORAGE_TYPE.LOCAL);
      }
      if (storageProperties != null && prepProperties.getStagingBaseDir() != null
              && storageProperties.getStagedb() != null) {
        storageTypes.add(PrDataset.STORAGE_TYPE.HDFS);
      }
      if (storageProperties != null && storageProperties.getS3() != null) {
        storageTypes.add(PrDataset.STORAGE_TYPE.S3);
      }
      response.put("storage_types", storageTypes);
    } catch (Exception e) {
      LOGGER.error("file_upload GET(): caught an exception: ", e);
      throw datasetError(e);
    }
    return ResponseEntity.status(HttpStatus.SC_CREATED).body(response);
  }

  @RequestMapping(value = "/file_upload", method = RequestMethod.POST, produces = "application/json")
  public
  @ResponseBody
  ResponseEntity<?> file_upload(
          @RequestParam(value = "name") String name,
          @RequestParam(value = "chunk") String chunk,
          @RequestParam(value = "chunks") String chunks,
          @RequestParam(value = "upload_id", required = false, defaultValue = "") String upload_id,
          @RequestParam(value = "storage_type") String storage_type,
          @RequestParam(value = "chunk_size") String chunk_size,
          @RequestParam(value = "total_size") String total_size,
          @RequestPart("file") MultipartFile file) {
    Map<String, Object> response;
    try {
      String uploadId = upload_id;
      PrUploadFile uploadFile = uploadFileRepository.findOne(upload_id);
      if (uploadFile == null) {
        throw datasetError(MSG_DP_ALERT_FILE_KEY_MISSING, uploadId + " is not a valid file key");
      }

      if (uploadFile.getOriginalFilename() == null) {
        String originalFilename = name;
        uploadFile.setOriginalFilename(originalFilename);
      }
      if (uploadFile.getStorageType() == null) {
        PrUploadFile.STORAGE_TYPE storageType = PrUploadFile.STORAGE_TYPE.valueOf(storage_type);
        uploadFile.setStorageType(storageType);
      }
      if (uploadFile.getFileSize() == null) {
        Long totalSize = Long.valueOf(total_size);
        uploadFile.setFileSize(totalSize);
      }
      if (uploadFile.getRestChunk() == null) {
        Integer chunkTotal = Integer.valueOf(chunks);
        uploadFile.setRestChunk(chunkTotal);
      }

      Integer chunkIdx = Integer.valueOf(chunk);
      Long chunkSize = Long.valueOf(chunk_size);

      String storedUri = datasetFileService.getStoredUri(uploadFile);
      uploadFile.setFileUri(storedUri);
      String localUri = datasetFileService.getPathLocalBase(uploadFile.getFilename());
      uploadFile.setLocalUri(localUri);

      response = datasetFileService.uploadFileChunk(uploadFile, chunkIdx, chunkSize, file);

      uploadFileRepository.saveAndFlush(uploadFile);

      if (uploadFile.getRestChunk() == 0) {
        if (uploadFile.getStorageType() == PrUploadFile.STORAGE_TYPE.LOCAL) {
          // just ok.
        } else if (uploadFile.getStorageType() == PrUploadFile.STORAGE_TYPE.HDFS) {
          datasetFileService.copyLocalToStaging(uploadFile);
        } else if (uploadFile.getStorageType() == PrUploadFile.STORAGE_TYPE.S3) {
          // not implemented yet
        } else {
          throw datasetError(MSG_DP_ALERT_UNSUPPORTED_URI_SCHEME, uploadFile.getStorageType() + " is not supported");
        }
      }
    } catch (Exception e) {
      LOGGER.error("file_upload POST(): caught an exception: ", e);
      throw datasetError(e);
    }

    return ResponseEntity.status(HttpStatus.SC_CREATED).body(response);
  }

  @RequestMapping(value = "/{dsId}/download", method = RequestMethod.GET)
  public
  @ResponseBody
  ResponseEntity<?> getDownload(
          HttpServletRequest request,
          HttpServletResponse response,
          @PathVariable("dsId") String dsId,
          @RequestParam(value = "fileType", required = false, defaultValue = "0") String fileType
  ) {
    PrDataset dataset;
    try {
      dataset = getImportedDatasetEntity(dsId);
      String storedUri = dataset.getStoredUri();
      String downloadFileName = FilenameUtils.getName(storedUri);
      InputStream is = datasetFileService.getStream(storedUri);

      int len;
      byte[] buf = new byte[8192];
      while ((len = is.read(buf)) != -1) {
        response.getOutputStream().write(buf, 0, len);
      }
      is.close();

      response.setHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", downloadFileName));
    } catch (Exception e) {
      LOGGER.error("getDownload(): caught an exception: ", e);
      throw datasetError(e);
    }

    return null;
  }

  private PrDataset getDatasetEntity(String dsId) {
    PrDataset dataset = datasetRepository.findOne(dsId);
    if (dataset == null) {
      throw datasetError(MSG_DP_ALERT_NO_DATASET, dsId);
    }
    return dataset;
  }

  private PrDataset getImportedDatasetEntity(String dsId) {
    PrDataset dataset = getDatasetEntity(dsId);
    if (dataset.getDsType() != DS_TYPE.IMPORTED) {
      throw datasetError(MSG_DP_ALERT_NOT_IMPORTED_DATASET, dsId);
    }
    return dataset;
  }
}
