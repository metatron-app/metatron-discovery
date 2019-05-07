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

package app.metatron.discovery.domain.datasource;

import app.metatron.discovery.common.exception.ErrorCodes;

public enum DataSourceErrorCodes implements ErrorCodes {

  QUERY_ERROR_CODE("DS0001"),
  INVALID_EXPR_CODE("DS0002"),
  CONFUSING_FIELD_CODE("DS0004"),
  VOLATILITY_NOT_FOUND_CODE("DS0005"),
  INVALID_TIMEFORMAT_CODE("DS0006"),
  NOT_SUPPORTED_TIMEFORMAT_CODE("DS0007"),
  INVALID_PARTITION_EXPRESSION("DS0008"),
  INGESTION_COMMON_ERROR("error.datasource.ingestion.common"),
  INGESTION_FILE_LOAD_ERROR("error.datasource.ingestion.file.load"), // Failed to load the file into the engine to load the data source. Please contact your system administrator.
  INGESTION_FILE_EXCEL_CONVERSION_ERROR("error.datasource.ingestion.file.excel.conversion"), // Failed to convert Excel file. Please check if the format is supported by metatron.
  INGESTION_JDBC_QUERY_EXECUTION_ERROR("error.datasource.ingestion.jdbc.query.execution"), // An error occurred while querying the data. Please check the query syntax or constraints in the DB Server.
  INGESTION_JDBC_FETCH_RESULT_ERROR("error.datasource.ingestion.jdbc.fetch.result"), // An error occurred in processing the result.
  INGESTION_JDBC_EMPTY_RESULT_ERROR("error.datasource.ingestion.jdbc.empty.result"), // Result is empty.
  INGESTION_JDBC_INCREMENTAL_TIME_ERROR("error.datasource.ingestion.jdbc.incremental.time"), // No time information to use for incremental ingestion job
  INGESTION_ENGINE_ACCESS_ERROR("error.datasource.ingestion.engine.access"), // Failed to access to the engine. Please contact your system administrator.
  INGESTION_ENGINE_TASK_CREATION_ERROR("error.datasource.ingestion.engine.creation.task"), // No ingestion task was created on the engine for an unknown reason.
  INGESTION_ENGINE_GET_TASK_LOG_ERROR("error.datasource.ingestion.engine.get.log"), // Task log on engine not Found.
  INGESTION_ENGINE_TASK_ERROR("error.datasource.ingestion.engine.run.task"), // An error occurred while loading the data source. Please check the engine log.
  INGESTION_ENGINE_REGISTRATION_ERROR("error.datasource.ingestion.engine.registration"); // An error occurred while registering the data source in the engine. Please contact your system administrator.;

  String errorCode;

  DataSourceErrorCodes(String errorCode) {
    this.errorCode = errorCode;
  }

  @Override
  public String getCode() {
    return errorCode;
  }
}
