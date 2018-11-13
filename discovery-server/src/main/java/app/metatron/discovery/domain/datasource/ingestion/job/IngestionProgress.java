package app.metatron.discovery.domain.datasource.ingestion.job;

public enum IngestionProgress {
  START_INGESTION_JOB,              // Start Ingestion
  PREPARATION_HANDLE_LOCAL_FILE,    // Handling local file. (Case of JDBC, processing sql)
  PREPARATION_LOAD_FILE_TO_ENGINE,  // Load file to engine
  ENGINE_INIT_TASK,                 // Building ingestion specification
  ENGINE_RUNNING_TASK,              // Do Ingestion!
  ENGINE_REGISTER_DATASOURCE,       // Registering DataSource
  FAIL_INGESTION_JOB,               // Ingestion Fail
  END_INGESTION_JOB,                // Successfully end ingestion
}
