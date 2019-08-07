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
  public LineageEdge createEdge(String upstreamMetaId, String downstreamMetaId, String description)
      throws Exception {
    LOGGER.trace("createEdge(): start");

    LineageEdge lineageEdge = new LineageEdge(upstreamMetaId, downstreamMetaId, description);
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

  private void addMapNodeRecursive(LineageMapNode node, boolean upward,
      List<String> visitedMetaIds) {
    String metaId = node.getMetaId();
    List<LineageEdge> edges;
    LineageMapNode newNode;

    // Edges that have A as downstream are upstream edges of A, vice versa.
    if (upward) {
      edges = edgeRepository.findByDownstreamMetaId(metaId);
    } else {
      edges = edgeRepository.findByUpstreamMetaId(metaId);
    }

    // Once started upward, we only find upstreams, and upstreams of upstreams, and so on.
    // We are not interested the downstreams of any upstreams. Vice versa.
    for (LineageEdge edge : edges) {
      if (upward) {
        String upstreamMetaName = getMetaName(edge.getUpstreamMetaId());
        newNode = new LineageMapNode(edge.getUpstreamMetaId(), edge.getDescription(), upstreamMetaName);
        node.getUpstreamMapNodes().add(newNode);
      } else {
        String downstreamMetaName = getMetaName(edge.getDownstreamMetaId());
        newNode = new LineageMapNode(edge.getDownstreamMetaId(), edge.getDescription(), downstreamMetaName);
        node.getDownstreamMapNodes().add(newNode);
      }

      if (visitedMetaIds.contains(newNode.getMetaId())) {
        newNode.setCircuit(true);
        continue;
      } else {
        visitedMetaIds.add(newNode.getMetaId());
      }

      addMapNodeRecursive(newNode, upward, visitedMetaIds);
    }
  }

  private String getMetaName(String metaId) {
    List<Metadata> metadatas = metadataRepository.findById(metaId);
    return metadatas.get(0).getName();
  }

  public LineageMapNode getLineageMap(String metaId) {
    LOGGER.trace("getLineageMap(): start");

    List<String> visitedMetaIds = new ArrayList();
    visitedMetaIds.add(metaId);

    String metaName = getMetaName(metaId);
    LineageMapNode topNode = new LineageMapNode(metaId, null, metaName);

    addMapNodeRecursive(topNode, true, visitedMetaIds);
    addMapNodeRecursive(topNode, false, visitedMetaIds);

    LOGGER.trace("getLineageMap(): end");
    return topNode;
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

  private LineageEdge findOrNew(String upstreamMetaId, String downstreamMetaId, String description) {
    List<LineageEdge> edges = edgeRepository.findAll();
    LineageEdge newEdge = new LineageEdge(upstreamMetaId, downstreamMetaId, description);

    for (LineageEdge edge : edges) {
      if (isSame(edge.getUpstreamMetaId(), upstreamMetaId) &&
          isSame(edge.getDownstreamMetaId(), downstreamMetaId) &&
          isSame(edge.getDescription(), description)) {
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
   * - upstream_meta_name, downstream_meta_name - upstream_col_name, downstream_col_name - description - (upstream_id, downstream_id)
   *
   * If upstream_col_name exists, then it's dependency between columns. If not, it's between metadata.
   * When find by name: - if cannot find any, then throw an exception. - if multiple metadata found,
   * use the ids. That means if there is an id, then we don't find by name. - if ids are not
   * provided, throw an exception.
   *
   * NOTE: IT'S RARE THAT A NON-TEST SYSTEM HAS METADATA WITH THE SAME NAMES.
   *
   * Belows are examples. (Each ids are omitted.)
   *
   * +---------------------+-------------------+---------------+-------------+--------------------+
   * | upstream_meta_name      | upstream_col_name     | downstream_meta_name  | downstream_col_name | description        |
   * +---------------------+-------------------+---------------+-------------+--------------------+
   * | Imported dataset #1 |                   | Hive table #1 |             | Cleansing #1       |
   * | Hive table #2       |                   | Hive table #1 |             | UPDATE SQL #1      |
   * | Hive table #1       |                   | Datasource #1 |             | Batch ingestion #1 |
   * +---------------------+-------------------+---------------+-------------+--------------------+
   *
   * (Imported dataset #1) ---(Cleansing #1)------> Hive table #1 ---(Batch ingestion #1)--->
   * (Datasource #1) / (Hive table #2) ---(UPDATE SQL #1)------/
   *
   * +---------------------+-------------------+---------------+-------------+--------------------+
   * | upstream_meta_name      | upstream_col_name     | downstream_meta_name  | downstream_col_name | description        |
   * +---------------------+-------------------+---------------+-------------+--------------------+
   * | Imported dataset #1 | col_1             | Hive table #1 | col_1       | Cleansing #1       |
   * | Imported dataset #1 | col_2             | Hive table #1 | col_2       | Cleansing #1       |
   * | Hive table #2       | rebate            | Hive table #1 | col_2       | UPDATE SQL #1      |
   * | Hive table #1       | col_1             | Datasource #1 | region_name | Batch ingestion #1 |
   * | Hive table #1       | col_2             | Datasource #1 | region_sum  | Batch ingestion #1 |
   * +---------------------+-------------------+---------------+-------------+--------------------+
   *
   * (col_1) ----------------> (col_1) --------------> region_name
   *
   * (col_2) ----------------> (col_2) --------------> region_sum / (rebate) ---------/
   */
  public List<LineageEdge> loadLineageMapDs(String wrangledDsId, String wrangledDsName) {
    DataFrame df = null;

    try {
      df = prepTransformService.loadWrangledDataset(wrangledDsId);
    } catch (IOException e) {
      LOGGER.error("loadLineageMapDs(): IOException occurred: dsName=" + wrangledDsName);
      e.printStackTrace();
    } catch (CannotSerializeIntoJsonException e) {
      LOGGER.error("loadLineageMapDs(): CannotSerializeIntoJsonException occurred: dsName="
          + wrangledDsName);
      e.printStackTrace();
    }

    List<LineageEdge> newEdges = new ArrayList();

    for (Row row : df.rows) {
      String upstreamMetaId = getMetaIdByRow(row, true);
      String downstreamMetaId = getMetaIdByRow(row, false);
      String description = (String) row.get("description");

      // Over write if exists. (UPSERT)
      LineageEdge edge = findOrNew(upstreamMetaId, downstreamMetaId, description);

      edgeRepository.save(edge);
      newEdges.add(edge);
    }

    return newEdges;
  }

  // Null if the key is contained, or value is an empty string.
  private String getValue(Row row, String colName) {
    if (!row.nameIdxs.containsKey(colName)) {
      LOGGER.error("Cannot find column from lineage map file: " + colName);
      return null;
    }

    String col = (String) row.get(colName);
    if (col.length() == 0) {
      LOGGER.error("Column from lineage map file is empty: " + colName);
      return null;
    }

    return col;
  }

  private String getMetaIdByRow(Row row, boolean upstream) {
    String metaId;
    String metaName;
    String metaColName;

    if (upstream) {
      metaId = getValue(row, "upstream_meta_id");
      metaName = getValue(row, "upstream_meta_name");
      metaColName = getValue(row, "upstream_meta_col_name");
    } else {
      metaId = getValue(row, "downstream_meta_id");
      metaName = getValue(row, "downstream_meta_name");
      metaColName = getValue(row, "downstream_meta_col_name");
    }

    // When ID is known
    if (metaId != null) {
      return metaId;
    }

    // When metaColName exists, the target is a metadata column.
    if (metaColName != null) {
      metaName = metaColName;
    }

    List<Metadata> metadatas = metadataRepository.findByName(metaName);

    if (metadatas.size() == 0) {
      LOGGER.error(String.format("loadLineageMapDs(): Metadata %s not found: ignored", metaName));
      return null;
    }

    // Return the first one. If duplicated, ignore the rest.
    return metadatas.get(0).getId();
  }

}
