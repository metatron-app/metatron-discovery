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

package app.metatron.discovery.domain.datalineage;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.joda.time.DateTime;

import java.util.List;

public class DataLineageLink {

  private List<DataLineageLinkedEdge> edges;

  private List<DataLineageLinkedEntity> entities;

  @JsonIgnore
  private List<DataLineageLinkedTable> tables;

  @JsonIgnore
  private List<DataLineageLinkedQuery> queries;

  private Direction direction;

  private DateTime from;

  private DateTime to;

  public enum Direction{
    BACKWARD, FORWARD, BOTH
  }

  public List<DataLineageLinkedEdge> getEdges() {
    return edges;
  }

  public void setEdges(List<DataLineageLinkedEdge> edges) {
    this.edges = edges;
  }

  public Direction getDirection() {
    return direction;
  }

  public void setDirection(Direction direction) {
    this.direction = direction;
  }

  public List<DataLineageLinkedEntity> getEntities() {
    return entities;
  }

  public void setEntities(List<DataLineageLinkedEntity> entities) {
    this.entities = entities;
  }

  public DateTime getFrom() {
    return from;
  }

  public void setFrom(DateTime from) {
    this.from = from;
  }

  public DateTime getTo() {
    return to;
  }

  public void setTo(DateTime to) {
    this.to = to;
  }

  public List<DataLineageLinkedTable> getTables() {
    return tables;
  }

  public void setTables(List<DataLineageLinkedTable> tables) {
    this.tables = tables;
  }

  public List<DataLineageLinkedQuery> getQueries() {
    return queries;
  }

  public void setQueries(List<DataLineageLinkedQuery> queries) {
    this.queries = queries;
  }
}
