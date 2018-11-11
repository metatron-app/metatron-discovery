package app.metatron.discovery.domain.datasource.ingestion.job;

public interface IngestionJob {

  void preparation();

  void loadToEngine();

  void buildSpec();

  String process();

}
