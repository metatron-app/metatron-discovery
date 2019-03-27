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

package app.metatron.discovery.domain.datasource.ingestion.jdbc;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.file.FileFormat;

/**
 * Created by kyungtaak on 2017. 4. 30..
 */
public abstract class JdbcIngestionInfo implements IngestionInfo {

  /**
   * 내부에서 관리되고 있지 않은 JDBC 연결일 경우 적재 정보내 명시하여 관리
   */
  DataConnection connection;

  /**
   * JBDC 데이터베이스(스키마) 정보
   */
  String database;

  /**
   * 질의한 데이터 형태, 쿼리문 또는 테이블
   */
  DataType dataType;

  /**
   * DataType 에 따라 쿼리문 또는 테이블 명
   */
  String query;

  /**
   * 질의 결과를 담는 파일 포맷 정의
   */
  FileFormat format;

  /**
   * Roll-up
   */
  Boolean rollup;

  /**
   * Intervals
   */
  List<String> intervals;

  /**
   * Specify Tuning Configuration, override default Value
   */
  Map<String, Object> tuningOptions;

  /**
   * Fetch Size
   */
  Integer fetchSize = 200;

  /**
   * Max Limit
   */
  Integer maxLimit = 10000000;

  /**
   * JDBC Connection username
   */
  String connectionUsername;

  /**
   * JDBC Connection password
   */
  String connectionPassword;


  public JdbcIngestionInfo() {
  }

  public DataConnection getConnection() {
    return connection;
  }

  public void setConnection(DataConnection connection) {
    this.connection = connection;
  }

  public String getDatabase() {
    return database;
  }

  public void setDatabase(String database) {
    this.database = database;
  }

  public DataType getDataType() {
    return dataType;
  }

  public void setDataType(DataType dataType) {
    this.dataType = dataType;
  }

  public String getQuery() {
    return query;
  }

  public void setQuery(String query) {
    this.query = query;
  }

  @Override
  public FileFormat getFormat() {
    return format;
  }

  public void setFormat(FileFormat format) {
    this.format = format;
  }

  @Override
  public Boolean getRollup() {
    return rollup;
  }

  public void setRollup(Boolean rollup) {
    this.rollup = rollup;
  }

  @Override
  public List<String> getIntervals() {
    return intervals;
  }

  public void setIntervals(List<String> intervals) {
    this.intervals = intervals;
  }

  @Override
  public Map<String, Object> getTuningOptions() {
    return tuningOptions;
  }

  public void setTuningOptions(Map<String, Object> tuningOptions) {
    this.tuningOptions = tuningOptions;
  }

  public Integer getFetchSize() {
    return fetchSize;
  }

  public void setFetchSize(Integer fetchSize) {
    this.fetchSize = fetchSize;
  }

  public Integer getMaxLimit() {
    return maxLimit;
  }

  public void setMaxLimit(Integer maxLimit) {
    this.maxLimit = maxLimit;
  }

  public String getConnectionUsername() {
    return connectionUsername;
  }

  public void setConnectionUsername(String connectionUsername) {
    this.connectionUsername = connectionUsername;
  }

  public String getConnectionPassword() {
    return connectionPassword;
  }

  public void setConnectionPassword(String connectionPassword) {
    this.connectionPassword = connectionPassword;
  }

  public enum DataType {
    TABLE, QUERY
  }
}
