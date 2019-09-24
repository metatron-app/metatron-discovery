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

import static app.metatron.discovery.domain.dataprep.PrepUtil.dataflowError;

import app.metatron.discovery.domain.dataprep.PrepParamDatasetIdList;
import app.metatron.discovery.domain.dataprep.PrepSwapRequest;
import app.metatron.discovery.domain.dataprep.PrepUpstream;
import app.metatron.discovery.domain.dataprep.entity.PrDataflow;
import app.metatron.discovery.domain.dataprep.entity.PrDataflowProjections;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.entity.PrDataset.DS_TYPE;
import app.metatron.discovery.domain.dataprep.entity.PrTransformRule;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.repository.PrDataflowRepository;
import app.metatron.discovery.domain.dataprep.repository.PrDatasetRepository;
import app.metatron.discovery.domain.dataprep.repository.PrTransformRuleRepository;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformResponse;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformService;
import com.google.common.collect.Lists;
import java.util.ArrayList;
import java.util.List;
import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.bind.annotation.ResponseBody;

@RequestMapping(value = "/preparationdataflows")
@RepositoryRestController
public class PrDataflowController {

  private static Logger LOGGER = LoggerFactory.getLogger(PrDataflowController.class);

  @Autowired
  ProjectionFactory projectionFactory;

  @Autowired
  private PrDataflowRepository dataflowRepository;

  @Autowired
  private PrDatasetRepository datasetRepository;

  @Autowired
  private PrTransformRuleRepository transformRuleRepository;

  @Autowired
  private PrDataflowService dataflowService;

  @Autowired
  private PrepTransformService transformService;

  @RequestMapping(value = "/{dfId}", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getDataflow(
          @PathVariable("dfId") String dfId,
          PersistentEntityResourceAssembler persistentEntityResourceAssembler
  ) {
    PrDataflow dataflow = null;
    Resource<PrDataflowProjections.DefaultProjection> projectedDataflow = null;
    try {
      dataflow = this.dataflowRepository.findOne(dfId);
      if (dataflow != null) {
      } else {
        throw PrepException
                .create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, dfId);
      }

      PrDataflowProjections.DefaultProjection projection = projectionFactory
              .createProjection(PrDataflowProjections.DefaultProjection.class, dataflow);
      projectedDataflow = new Resource<>(projection);
    } catch (Exception e) {
      LOGGER.error("getDataflow(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
    }

    return ResponseEntity.status(HttpStatus.SC_OK).body(projectedDataflow);
  }

  @RequestMapping(value = "", method = RequestMethod.POST)
  public
  @ResponseBody
  PersistentEntityResource postDataflow(
          @RequestBody Resource<PrDataflow> dataflowResource,
          PersistentEntityResourceAssembler resourceAssembler
  ) {
    PrDataflow dataflow;
    PrDataflow savedDataflow;

    try {
      dataflow = dataflowResource.getContent();
      savedDataflow = dataflowRepository.save(dataflow);
      LOGGER.debug(savedDataflow.toString());

      this.dataflowService.afterCreate(savedDataflow);

      this.dataflowRepository.flush();
    } catch (Exception e) {
      LOGGER.error("postDataflow(): caught an exception: ", e);
      throw PrepException
              .create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, e.getMessage());
    }

    return resourceAssembler.toResource(savedDataflow);
  }

  @RequestMapping(value = "/{dfId}", method = RequestMethod.PATCH)
  @ResponseBody
  public ResponseEntity<?> patchDataflow(
          @PathVariable("dfId") String dfId,
          @RequestBody Resource<PrDataflow> dataflowResource,
          PersistentEntityResourceAssembler persistentEntityResourceAssembler
  ) {

    PrDataflow dataflow;
    PrDataflow patchDataflow;
    PrDataflow savedDataflow;
    Resource<PrDataflowProjections.DefaultProjection> projectedDataflow;

    try {
      dataflow = this.dataflowRepository.findOne(dfId);
      patchDataflow = dataflowResource.getContent();

      this.dataflowService.patchAllowedOnly(dataflow, patchDataflow);

      savedDataflow = dataflowRepository.save(dataflow);
      LOGGER.debug(savedDataflow.toString());

      this.dataflowRepository.flush();
    } catch (Exception e) {
      LOGGER.error("postDataflow(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
    }

    PrDataflowProjections.DefaultProjection projection = projectionFactory
            .createProjection(PrDataflowProjections.DefaultProjection.class, savedDataflow);
    projectedDataflow = new Resource<>(projection);
    return ResponseEntity.status(HttpStatus.SC_OK).body(projectedDataflow);
  }

  @RequestMapping(value = "/{dfId}", method = RequestMethod.DELETE)
  @ResponseBody
  public ResponseEntity<?> deleteDataflow(
          @PathVariable("dfId") String dfId
  ) {
    try {
      PrDataflow dataflow = this.dataflowRepository.findOne(dfId);
      if (null != dataflow) {
        ArrayList<PrDataset> datasets = Lists.newArrayList();
        datasets.addAll(dataflow.getDatasets());
        for (PrDataset ds : datasets) {
          ds.deleteDataflow(dataflow);
          dataflow.deleteDataset(ds);
          if (ds.getDsType() == PrDataset.DS_TYPE.WRANGLED) {
            List<PrTransformRule> transformRules = ds.getTransformRules();
            if (null != transformRules) {
              for (PrTransformRule transformRule : transformRules) {
                this.transformRuleRepository.delete(transformRule);
              }
            }
            this.datasetRepository.delete(ds.getDsId());
          }
        }
        this.datasetRepository.flush();

        this.dataflowRepository.delete(dataflow.getDfId());
        this.dataflowRepository.flush();
      }
    } catch (Exception e) {
      LOGGER.error("deleteDataflow(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
    }

    return ResponseEntity.status(HttpStatus.SC_OK).body(dfId);
  }

  @RequestMapping(value = "/delete_chain/{dfId}/{dsId}", method = RequestMethod.DELETE)
  @ResponseBody
  public ResponseEntity<?> deleteChain(
          @PathVariable("dfId") String dfId,
          @PathVariable("dsId") String dsId
  ) {

    List<String> deleteDsIds = Lists.newArrayList();

    try {
      // We need to delete every downstream no matter what the dataflow it's in.
      // The only difference from dataset's deleteChain() is that,
      // in this case, we just remove the relation between I.DS and dataflow. (cf. dataset's deletes the dataset entity)

      PrDataset targetDs = datasetRepository.findOne(dsId);
      if (targetDs.getDsType() == DS_TYPE.IMPORTED) {
        PrDataflow dataflow = dataflowRepository.findOne(dfId);
        dataflow.deleteDataset(targetDs);
        dataflowRepository.save(dataflow);
      }

      transformService.addDownstreamDsId(deleteDsIds, dsId, false);

      for (String deleteDsId : deleteDsIds) {
        PrDataset dataset = this.datasetRepository.findOne(deleteDsId);
        if (dataset != null) {
          List<PrDataflow> dataflows = dataset.getDataflows();
          if (dataflows != null) {
            for (PrDataflow dataflow : dataflows) {
              dataflow.deleteDataset(dataset);
            }
          }
          this.datasetRepository.delete(dataset);
        }
      }
    } catch (Exception e) {
      LOGGER.error("deleteChain(): caught an exception: ", e);
      throw dataflowError(e);
    }

    return ResponseEntity.status(HttpStatus.SC_OK).body(deleteDsIds);
  }

  @RequestMapping(value = "/{dfId}/upstreammap", method = RequestMethod.GET, produces = "application/json")
  public
  @ResponseBody
  ResponseEntity<?> getStreams(
          @PathVariable("dfId") String dfId,
          @RequestParam(value = "forUpdate", required = false, defaultValue = "false") String forUpdate
  ) {
    List<PrepUpstream> upstreams = Lists.newArrayList();
    try {
      PrDataflow dataflow = dataflowRepository.findOne(dfId);
      if (null != dataflow) {
        List<PrDataset> datasets = dataflow.getDatasets();
        if (null != datasets) {
          for (PrDataset dataset : datasets) {
            String dsId = dataset.getDsId();

            if (dataset.getDsType() == PrDataset.DS_TYPE.WRANGLED) {
              List<String> upstreamDsIds = this.transformService.getUpstreamDsIds(dataset.getDsId());
              if (null != upstreamDsIds) {
                for (String upstreamDsId : upstreamDsIds) {
                  PrepUpstream upstream = new PrepUpstream();
                  upstream.setDfId(dfId);
                  upstream.setDsId(dsId);
                  upstream.setUpstreamDsId(upstreamDsId);
                  upstreams.add(upstream);
                }
              }
            }
          }
        }
      } else {
        String errorMsg = "No dataflow [" + dfId + "]";
        throw PrepException
                .create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, errorMsg);
      }
    } catch (Exception e) {
      LOGGER.error("getStreams(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
    }

    return ResponseEntity.status(HttpStatus.SC_CREATED).body(upstreams);
  }

  @RequestMapping(value = "/{dfId}/update_datasets", method = RequestMethod.PUT, produces = "application/json")
  public
  @ResponseBody
  ResponseEntity<?> updateDatasets(
          @PathVariable("dfId") String dfId,
          @RequestBody PrepParamDatasetIdList dsIds
  ) {
    // If an I.DS is new to the dataflow, we create a corresponding W.DS, except the case of dataset swapping.
    boolean autoCreate = (dsIds.getForSwap() != null && dsIds.getForSwap() == true) ? false : true;

    PrDataflow dataflow = dataflowRepository.findOne(dfId);
    try {
      if (dataflow != null) {
        if (dsIds != null) {
          List<PrDataset> removeList = new ArrayList<PrDataset>();
          List<PrDataset> datasets = dataflow.getDatasets();
          List<String> oldIds = Lists.newArrayList();
          List<String> newIds = Lists.newArrayList();
          if (datasets != null) {
            for (PrDataset dataset : datasets) {
              oldIds.add(dataset.getDsId());
              if (false == dsIds.getDsIds().contains(dataset.getDsId())) {
                removeList.add(dataset);
              }
            }
            for (PrDataset removeDataset : removeList) {
              dataflow.deleteDataset(removeDataset);
              removeDataset.deleteDataflow(dataflow);
            }
          }
          for (String dsId : dsIds.getDsIds()) {
            PrDataset dataset = datasetRepository.findOne(dsId);
            if (dataset != null) {
              if (PrDataset.DS_TYPE.IMPORTED == dataset.getDsType() && false == oldIds.contains(dsId)) {
                newIds.add(dsId);
              }
              dataflow.addDataset(dataset);
              dataset.addDataflow(dataflow);
            }
          }
          dataflowRepository.saveAndFlush(dataflow);

          if (autoCreate) {
            for (String newId : newIds) {
              PrepTransformResponse response = this.transformService.create(newId, dataflow.getDfId(), null);
            }
          }
        }
      } else {
        String errorMsg = new String("dataflow[" + dfId + "] was not found");
        throw PrepException
                .create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, errorMsg);
      }
    } catch (Exception e) {
      LOGGER.error("addDataset(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
    }

    return ResponseEntity.status(HttpStatus.SC_OK).body(dataflow);
  }

  @RequestMapping(value = "/{dfId}/swap_upstream", method = RequestMethod.POST, produces = "application/json")
  public
  @ResponseBody
  ResponseEntity<?> swapUpstream(
          @PathVariable("dfId") String dfId,
          @RequestBody PrepSwapRequest swapRequest
  ) {
    PrDataflow dataflow = dataflowRepository.findOne(dfId);

    try {
      List<String> affectedDsIds = transformService.swap_upstream(dataflow, swapRequest);
      transformService.after_swap(affectedDsIds);
    } catch (Exception e) {
      LOGGER.error("swap_upstream(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
    }

    return ResponseEntity.status(HttpStatus.SC_OK).body(dataflow);
  }
}