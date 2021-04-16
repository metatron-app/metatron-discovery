package app.metatron.discovery.domain.datasource;

import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;

import java.util.List;

/**
 * Request for ingestion information
 *
 */
public class IngestionUpdateRequest {

  /**
   * Ingestion Information
   */
  IngestionInfo ingestionInfo;

  /**
   * Patch information for field update
   */
  List<CollectionPatch> patchFields;

  public IngestionUpdateRequest() {
  }

  public IngestionUpdateRequest(IngestionInfo ingestionInfo,
                                List<CollectionPatch> patchFields) {
    this.ingestionInfo = ingestionInfo;
    this.patchFields = patchFields;
  }

  public IngestionInfo getIngestionInfo() {
    return ingestionInfo;
  }

  public void setIngestionInfo(IngestionInfo ingestionInfo) {
    this.ingestionInfo = ingestionInfo;
  }

  public List<CollectionPatch> getPatchFields() {
    return patchFields;
  }

  public void setPatchFields(List<CollectionPatch> patchFields) {
    this.patchFields = patchFields;
  }
}
