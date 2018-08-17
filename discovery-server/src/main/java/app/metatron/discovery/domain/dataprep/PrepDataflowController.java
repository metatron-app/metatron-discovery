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
import app.metatron.discovery.domain.dataprep.transform.PrepTransformResponse;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformService;
import com.google.common.collect.Lists;
import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RequestMapping(value = "/preparationdataflows")
@RepositoryRestController
public class PrepDataflowController {

    private static Logger LOGGER = LoggerFactory.getLogger(PrepDataflowController.class);

    @Autowired
    private PrepDataflowRepository dataflowRepository;

    @Autowired
    private PrepDatasetRepository datasetRepository;

    @Autowired(required = false)
    private PrepTransformService transformService;

    @RequestMapping(value = "/{dfId}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteDataflow(
            @PathVariable("dfId") String dfId
    ) {
        try {
            PrepDataflow dataflow = this.dataflowRepository.findOne(dfId);
            if (null != dataflow) {
                ArrayList<PrepDataset> datasets = Lists.newArrayList();
                datasets.addAll(dataflow.getDatasets());
                for(PrepDataset ds : datasets) {
                    ds.deleteDataflow(dataflow);
                    dataflow.deleteDataset(ds);
                    if( ds.getDsTypeForEnum()== PrepDataset.DS_TYPE.WRANGLED ) {
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
            List<String> upstreamDsIds = Lists.newArrayList();
            List<PrepUpstream> upstreams = Lists.newArrayList();
            upstreamDsIds.add(dsId);

            PrepDataflow dataflow = this.dataflowRepository.findOne(dfId);
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
                    if(null!=dataflow) {
                        dataflow.deleteDataset(delDs);
                    }
                    if(delDs.getDsTypeForEnum() != PrepDataset.DS_TYPE.IMPORTED) {
                        this.datasetRepository.delete(delDs);
                    } else {
                        delDs.deleteDataflow(dataflow);
                        this.datasetRepository.flush();
                        this.dataflowRepository.flush();
                    }
                }
            }
        } catch (Exception e) {
            LOGGER.error("deleteChain(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(deleteDsIds);
    }

    @RequestMapping(value = "/{dfId}/upstreammap", method = RequestMethod.GET, produces = "application/json")
    public @ResponseBody ResponseEntity<?> getStreams (
            @PathVariable("dfId") String dfId,
            @RequestParam(value = "forUpdate", required = false, defaultValue = "false") String forUpdate
    ) {
        List<PrepUpstream> upstreams = Lists.newArrayList();
        try {
            PrepDataflow dataflow = dataflowRepository.findOne(dfId);
            if (null != dataflow) {
                List<PrepDataset> datasets = dataflow.getDatasets();
                if (null != datasets) {
                    for (PrepDataset dataset : datasets) {
                        String dsId = dataset.getDsId();

                        if(dataset.getDsTypeForEnum()==PrepDataset.DS_TYPE.WRANGLED) {
                            boolean forUpdateBoolean = forUpdate.equalsIgnoreCase("true") ? true : false;
                            List<String> upstreamDsIds = this.transformService.getUpstreamDsIds(dataset.getDsId(), forUpdateBoolean);
                            if(null!=upstreamDsIds) {
                                for(String upstreamDsId : upstreamDsIds) {
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
                String errorMsg = "No dataflow ["+dfId+"]";
                throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, errorMsg);
            }
        } catch (Exception e) {
            LOGGER.error("getStreams(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_CREATED).body(upstreams);
    }

    @RequestMapping(value = "/{dfId}/add/{dsId}", method = RequestMethod.POST, produces = "application/json")
    public @ResponseBody ResponseEntity<?> addDataset (
            @PathVariable("dfId") String dfId,
            @PathVariable("dsId") String dsId
    ) {
        PrepDataflow dataflow = dataflowRepository.findOne(dfId);
        try {
            if( dataflow!=null ) {
                PrepDataset dataset = datasetRepository.findOne(dsId);
                if( dataset!=null ) {
                    dataflow.addDataset(dataset);
                    dataset.addDataflow(dataflow);
                    dataflowRepository.saveAndFlush(dataflow);
                } else {
                    String errorMsg = new String("dataset[" + dsId + "] was not found");
                    throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATASET, errorMsg);
                }
            } else {
                String errorMsg = new String("dataflow[" + dfId + "] was not found");
                throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, errorMsg);
            }
        }
        catch (Exception e) {
            LOGGER.error("addDataset(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(dataflow);
    }

    @RequestMapping(value = "/{dfId}/update_datasets", method = RequestMethod.PUT, produces = "application/json")
    public @ResponseBody ResponseEntity<?> updateDatasets (
            @PathVariable("dfId") String dfId,
            @RequestBody PrepParamDatasetIdList dsIds
    ) {
        PrepDataflow dataflow = dataflowRepository.findOne(dfId);
        try {
            if( dataflow!=null ) {
                if(dsIds!=null) {
                    List<PrepDataset> removeList = new ArrayList<PrepDataset>();
                    List<PrepDataset> datasets = dataflow.getDatasets();
                    List<String> oldIds = Lists.newArrayList();
                    List<String> newIds = Lists.newArrayList();
                    if(datasets!=null) {
                        for (PrepDataset dataset : datasets) {
                            oldIds.add(dataset.getDsId());
                            if ( false == dsIds.getDsIds().contains(dataset.getDsId()) ) {
                                removeList.add(dataset);
                            }
                        }
                        for(PrepDataset removeDataset : removeList) {
                            dataflow.deleteDataset(removeDataset);
                            removeDataset.deleteDataflow(dataflow);
                        }
                    }
                    for (String dsId : dsIds.getDsIds() ) {
                        PrepDataset dataset = datasetRepository.findOne(dsId);
                        if( dataset!=null ) {
                            if( PrepDataset.DS_TYPE.IMPORTED==dataset.getDsTypeForEnum() && false==oldIds.contains(dsId) ) {
                                newIds.add(dsId);
                            }
                            dataflow.addDataset(dataset);
                            dataset.addDataflow(dataflow);
                        }
                    }
                    dataflowRepository.saveAndFlush(dataflow);

                    for(String newId : newIds) {
                        PrepTransformResponse response = this.transformService.create(newId, dataflow.getDfId());
                    }
                }
            } else {
                String errorMsg = new String("dataflow[" + dfId + "] was not found");
                throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, errorMsg);
            }
        }
        catch (Exception e) {
            LOGGER.error("addDataset(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(dataflow);
    }

    @RequestMapping(value = "/{dfId}/add_datasets", method = RequestMethod.POST, produces = "application/json")
    public @ResponseBody ResponseEntity<?> addDatasets (
            @PathVariable("dfId") String dfId,
            @RequestBody PrepParamDatasetIdList dsIds
    ) {
        PrepDataflow dataflow = dataflowRepository.findOne(dfId);
        try {
            if( dataflow!=null ) {
                if(dsIds!=null) {
                    for (String dsId : dsIds.getDsIds() ) {
                        PrepDataset dataset = datasetRepository.findOne(dsId);
                        if( dataset!=null ) {
                            dataflow.addDataset(dataset);
                            dataset.addDataflow(dataflow);
                        }
                    }
                    dataflowRepository.saveAndFlush(dataflow);
                }
            } else {
                String errorMsg = new String("dataflow[" + dfId + "] was not found");
                throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, errorMsg);
            }
        }
        catch (Exception e) {
            LOGGER.error("addDataset(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(dataflow);
    }

    @RequestMapping(value = "/{dfId}/remove/{dsId}", method = RequestMethod.DELETE, produces = "application/json")
    public @ResponseBody ResponseEntity<?> removeDataset (
            @PathVariable("dfId") String dfId,
            @PathVariable("dsId") String dsId
    ) {
        PrepDataflow dataflow = dataflowRepository.findOne(dfId);
        try {
            if( dataflow!=null ) {
                PrepDataset dataset = datasetRepository.findOne(dsId);
                if( dataset!=null ) {
                    dataflow.deleteDataset(dataset);
                    dataset.deleteDataflow(dataflow);
                    dataflowRepository.saveAndFlush(dataflow);
                } else {
                    String errorMsg = new String("dataset[" + dsId + "] was not found");
                    throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATASET, errorMsg);
                }
            } else {
                String errorMsg = new String("dataflow[" + dfId + "] was not found");
                throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW, errorMsg);
            }
        }
        catch (Exception e) {
            LOGGER.error("removeDataset(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(dataflow);
    }

    @RequestMapping(value = "/{dfId}/remove_datasets", method = RequestMethod.DELETE, produces = "application/json")
    public @ResponseBody ResponseEntity<?> removeDatasets (
            @PathVariable("dfId") String dfId,
            @RequestBody PrepParamDatasetIdList dsIds
    ) {
        PrepDataflow dataflow = dataflowRepository.findOne(dfId);
        try {
            if( dataflow!=null ) {
                List<PrepDataset> removeList = new ArrayList<PrepDataset>();
                List<PrepDataset> datasets = dataflow.getDatasets();
                if(datasets!=null) {
                    for (PrepDataset dataset : datasets) {
                        if ( true == dsIds.getDsIds().contains(dataset.getDsId()) ) {
                            removeList.add(dataset);
                        }
                    }
                    for(PrepDataset removeDataset : removeList) {
                        dataflow.deleteDataset(removeDataset);
                        removeDataset.deleteDataflow(dataflow);
                    }
                    dataflowRepository.saveAndFlush(dataflow);
                }
            } else {
                String errorMsg = new String("dataflow[" + dfId + "] was not found");
                throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATAFLOW);
            }
        }
        catch (Exception e) {
            LOGGER.error("removeDatasets(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATAFLOW_ERROR_CODE, e);
        }

        return ResponseEntity.status(HttpStatus.SC_OK).body(dataflow);
    }
}
