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

package app.metatron.discovery.domain.workbench;


import com.fasterxml.jackson.annotation.JsonBackReference;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.util.TimeUtils;

@Entity
@Table(name="queryhistory")
public class QueryHistory extends AbstractHistoryEntity implements MetatronDomain<Long> {

	// TODO: "id" 로 네이밍 변경 부탁드립니다
	@Id
	@GeneratedValue(strategy= GenerationType.AUTO, generator="native")
	@GenericGenerator(name = "native", strategy = "native")
	@Column(name = "id")
	Long id;
	
	@Lob
	@Column(name="query")
	String query;

	@Column(name="query_start_time")
	@Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
	DateTime queryStartTime;

	@Column(name="query_finish_time")
	@Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
	DateTime queryFinishTime;

	@Column(name="query_time_taken")
	Long queryTimeTaken;

	@Column(name="query_status")
	@Enumerated(EnumType.STRING)
	QueryResult.QueryResultStatus queryResultStatus;

	@Lob
	@Column(name="query_log")
	String queryLog;

	@Column(name="database_name")
	String databaseName;

	@Column(name="delete_flag")
	@Type(type="yes_no")
	@NotNull
	Boolean deleted = false;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "qe_id", referencedColumnName = "id")
	@JsonBackReference
	QueryEditor queryEditor;

	@Column(name="dc_id")
	String dataConnectionId;

	@Column(name="num_rows")
	Long numRows;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getQuery() {
		return query;
	}

	public void setQuery(String query) {
		this.query = query;
	}

	public DateTime getQueryStartTime() {
		return queryStartTime;
	}

	public void setQueryStartTime(DateTime queryStartTime) {
		this.queryStartTime = queryStartTime;
	}

	public DateTime getQueryFinishTime() {
		return queryFinishTime;
	}

	public void setQueryFinishTime(DateTime queryFinishTime) {
		this.queryFinishTime = queryFinishTime;
	}

	public QueryResult.QueryResultStatus getQueryResultStatus() {
		return queryResultStatus;
	}

	public void setQueryResultStatus(QueryResult.QueryResultStatus queryResultStatus) {
		this.queryResultStatus = queryResultStatus;
	}

	public String getQueryLog() {
		return queryLog;
	}

	public void setQueryLog(String queryLog) {
		this.queryLog = queryLog;
	}

	public Long getQueryTimeTaken() {
		return queryTimeTaken;
	}

	public String getQueryTimeTakenFormatted(){
		return TimeUtils.millisecondToString(this.queryTimeTaken, null);
	}

	public void setQueryTimeTaken(Long queryTimeTaken) {
		this.queryTimeTaken = queryTimeTaken;
	}

	public String getDatabaseName() {
		return databaseName;
	}

	public void setDatabaseName(String databaseName) {
		this.databaseName = databaseName;
	}

	public QueryEditor getQueryEditor() {
		return queryEditor;
	}

	public void setQueryEditor(QueryEditor queryEditor) {
		this.queryEditor = queryEditor;
	}

	public boolean getDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	public String getDataConnectionId() {
		return dataConnectionId;
	}

	public void setDataConnectionId(String dataConnectionId) {
		this.dataConnectionId = dataConnectionId;
	}

  public void setDeleted(Boolean deleted) {
    this.deleted = deleted;
  }

	public Long getNumRows() {
		return numRows;
	}

	public void setNumRows(Long numRows) {
		this.numRows = numRows;
	}

	@Override
	public String toString() {
		return "QueryHistory{" +
						"id=" + id +
						", query='" + query + '\'' +
						", queryStartTime=" + queryStartTime +
						", queryFinishTime=" + queryFinishTime +
						", queryTimeTaken=" + queryTimeTaken +
						", queryResultStatus=" + queryResultStatus +
						", queryLog='" + queryLog + '\'' +
						", databaseName='" + databaseName + '\'' +
						", deleted=" + deleted +
						", queryEditor=" + queryEditor +
						", dataConnectionId='" + dataConnectionId + '\'' +
						", numRows=" + numRows +
						'}';
	}
}
