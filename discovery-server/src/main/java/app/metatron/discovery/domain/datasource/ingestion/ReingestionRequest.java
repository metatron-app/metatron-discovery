package app.metatron.discovery.domain.datasource.ingestion;

import java.io.Serializable;
import java.util.List;

import app.metatron.discovery.domain.CollectionPatch;

public class ReingestionRequest implements Serializable {

  private static final long serialVersionUID = 1L;

  IngestionInfo ingestionInfo;
  List<CollectionPatch> patches;

  public IngestionInfo getIngestionInfo() { return ingestionInfo; }

  public void setIngestionInfo(IngestionInfo ingestionInfo) { this.ingestionInfo = ingestionInfo; }

  public List<CollectionPatch> getPatches() { return patches; }

  public void setPatches(List<CollectionPatch> patches) { this.patches = patches; }
}