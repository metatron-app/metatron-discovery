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

package app.metatron.discovery.domain.mdm.lineage;

import static app.metatron.discovery.domain.mdm.MetadataErrorCodes.LINEAGE_COLUMN_MISSING;
import static app.metatron.discovery.domain.mdm.MetadataErrorCodes.LINEAGE_DATASET_ERROR;

import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.entity.PrDataset.DS_TYPE;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.repository.PrDatasetRepository;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.Row;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.CannotSerializeIntoJsonException;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformService;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataRepository;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LineageEdgeService {

  private static Logger LOGGER = LoggerFactory.getLogger(LineageEdgeService.class);

  @Autowired
  LineageEdgeRepository edgeRepository;

  @Autowired
  MetadataRepository metadataRepository;

  @Autowired
  PrDatasetRepository datasetRepository;

  @Autowired
  PrepTransformService prepTransformService;

  public LineageEdgeService() {
  }

  @Transactional(rollbackFor = Exception.class)
  public LineageEdge createEdge(String frMetaId, String toMetaId, Long tier, String desc)
      throws Exception {
    LOGGER.trace("createEdge(): start");

    LineageEdge lineageEdge = new LineageEdge(frMetaId, toMetaId, tier, desc);
    edgeRepository.saveAndFlush(lineageEdge);

    LOGGER.trace("createEdge(): end");
    return lineageEdge;
  }

  public List<LineageEdge> listEdge() {
    LOGGER.trace("listEdge(): start");

    List<LineageEdge> edges = edgeRepository.findAll();

    LOGGER.trace("listEdge(): end");
    return edges;
  }

  public LineageEdge getEdge(String edgeId) {
    LOGGER.trace("getEdge(): start");

    LineageEdge lineageEdge = edgeRepository.findOne(edgeId);

    LOGGER.trace("getEdge(): end");
    return lineageEdge;
  }

  public List<LineageEdge> loadLineageMapDsByDsName(String wrangledDsName) {
    if (wrangledDsName == null) {
      wrangledDsName = "DEFAULT_LINEAGE_MAP";
    }

    List<PrDataset> datasets = datasetRepository.findByDsName(wrangledDsName);
    if (datasets.size() == 0) {
      LOGGER.error("loadLineageMapDsByDsName(): Cannot find W.DS by name: " + wrangledDsName);
      throw PrepException
          .create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATASET);
    }

    // Use the 1st one if many.
    for (PrDataset dataset : datasets) {
      if (dataset.getDsType() == DS_TYPE.WRANGLED) {
        return loadLineageMapDs(dataset.getDsId(), dataset.getDsName());
      }
    }

    assert false;
    return new ArrayList();
  }

  private boolean isSame(String a, String b) {
    return a == null ? false : a.equals(b);
  }

  private LineageEdge findOrNew(String frMetaId, String toMetaId, Long tier, String desc) {
    List<LineageEdge> edges = edgeRepository.findAll();
    LineageEdge newEdge = new LineageEdge(frMetaId, toMetaId, tier, desc);

    for (LineageEdge edge : edges) {
      if (isSame(edge.getFrMetaId(), frMetaId) &&
          isSame(edge.getToMetaId(), toMetaId) &&
          isSame(edge.getDesc(), desc)) {
        return edge;
      }
    }

    return newEdge;
  }

  /**
   * Read a dependency dataset. (feat. Dataprep)
   *
   * For metadata dependency we use 7 Columns below:
   *
   * - fr_meta_name, to_meta_name
   * - fr_col_name, to_col_name
   * - desc
   * - (fr_meta_id, to_meta_id)
   *
   * If fr_col_name and to_col_name are not nulls, then it's the dependency between columns.
   * If they're nulls, then it's between metadata.
   * We find the metadata by meta names:
   * - If cannot find any, then throw an exception.
   * - If found many, use one of them. Rule is not set. So in this case, you should provide meta_id.
   *
   * Belows are examples. (meta_ids are optional and out of consideration here)
   *
   * +---------------------+-------------------+---------------+-------------+--------------------+
   * | fr_meta_name        | fr_col_name       | to_meta_name  | to_col_name | desc               |
   * +---------------------+-------------------+---------------+-------------+--------------------+
   * | Imported dataset #1 |                   | Hive table #1 |             | Cleansing #1       |
   * | Hive table #2       |                   | Hive table #1 |             | UPDATE SQL #1      |
   * | Hive table #1       |                   | Datasource #1 |             | Batch ingestion #1 |
   * +---------------------+-------------------+---------------+-------------+--------------------+
   *
   * +---------------------+-------------------+---------------+-------------+--------------------+
   * | fr_meta_name        | fr_col_name       | to_meta_name  | to_col_name | desc               |
   * +---------------------+-------------------+---------------+-------------+--------------------+
   * | Imported dataset #1 | col_1             | Hive table #1 | col_1       | Cleansing #1       |
   * | Imported dataset #1 | col_2             | Hive table #1 | col_2       | Cleansing #1       |
   * | Hive table #2       | rebate            | Hive table #1 | col_2       | UPDATE SQL #1      |
   * | Hive table #1       | col_1             | Datasource #1 | region_name | Batch ingestion #1 |
   * | Hive table #1       | col_2             | Datasource #1 | region_sum  | Batch ingestion #1 |
   * +---------------------+-------------------+---------------+-------------+--------------------+
   */
  public List<LineageEdge> loadLineageMapDs(String wrangledDsId, String wrangledDsName) {
    DataFrame df = null;

    try {
      df = prepTransformService.loadWrangledDataset(wrangledDsId);
    } catch (IOException e) {
      String msg = "IOException occurred: dsName=" + wrangledDsName;
      LOGGER.error(msg);
      throw new LineageException(LINEAGE_DATASET_ERROR, msg);
    } catch (CannotSerializeIntoJsonException e) {
      String msg = "CannotSerializeIntoJsonException occurred: dsName=" + wrangledDsName;
      LOGGER.error(msg);
      throw new LineageException(LINEAGE_DATASET_ERROR, msg);
    }

    List<LineageEdge> newEdges = new ArrayList();

    // NOTE:
    // BATCH UPLOADING WILL DELETE ALL EXISTING EDGES.
    // The first reason is that currently, we don't have any way to delete a wrong edge. (UI)
    // The second reason is that I guess users might use this feature to reset all dependencies.
    edgeRepository.deleteAll();

    for (Row row : df.rows) {
      if (getValue(row, "fr_col_name", false) != null) {
        // TODO: Column dependency rows are ignored for now.
        continue;
      }

      String frMetaId = getMetaIdByRow(row, true);
      String toMetaId = getMetaIdByRow(row, false);

      Long tier = null;
      if (df.colNames.contains("tier")) {
        tier = (Long) row.get("tier");
      }
      String desc = (String) row.get("desc");

      // Over write if exists. (UPSERT)
      LineageEdge edge = findOrNew(frMetaId, toMetaId, tier, desc);

      edgeRepository.save(edge);
      newEdges.add(edge);
    }

    return newEdges;
  }

  // Null if the key is contained, or value is an empty string.
  private String getValue(Row row, String colName, boolean mandatory) {
    if (!row.nameIdxs.containsKey(colName)) {
      if (mandatory) {
        String msg = "Cannot find column from lineage map file: " + colName;
        LOGGER.error(msg);
        throw new LineageException(LINEAGE_COLUMN_MISSING, msg);
      }
      return null;
    }

    String col = (String) row.get(colName);
    if (col == null || col.length() == 0) {
      return null;
    }

    return col;
  }

  private String getMetaIdByRow(Row row, boolean upstream) {
    String metaId;
    String metaName;

    if (upstream) {
      metaId = getValue(row, "fr_meta_id", false);
      metaName = getValue(row, "fr_meta_name", true);
    } else {
      metaId = getValue(row, "to_meta_id", false);
      metaName = getValue(row, "to_meta_name", true);
    }

    // When ID is known
    if (metaId != null) {
      return metaId;
    }

    List<Metadata> metadatas = metadataRepository.findByName(metaName);

    if (metadatas.size() == 0) {
      LOGGER.error(String.format("loadLineageMapDs(): Metadata %s not found: ignored", metaName));
      // TODO: Create an empty metadata (place-holder)
      return null;
    }

    // Return the first one. If duplicated, ignore the rest.
    return metadatas.get(0).getId();
  }

}
