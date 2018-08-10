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

package app.metatron.discovery.domain.workbook;

import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonTypeName;

import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.persistence.CascadeType;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
import javax.persistence.Table;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.workspace.Book;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.util.PolarisUtils;


/**
 * WorkBook은 Workspace 내 존재, 다수의 Page 를 가질수 있으며</br>
 * Page를 구성하는데 필요한 데이터소스 지정 가능
 */
@Entity
@Table(name = "book_workbook")
@JsonTypeName("workbook")
@DiscriminatorValue("workbook")
public class WorkBook extends Book {

  /**
   * WorkBook 내 포함되어 있는 Page 정보
   */
  @OneToMany(mappedBy = "workBook", cascade = CascadeType.ALL)
  @OrderBy("seq ASC")
  @RestResource(path = "dashboards")
  List<DashBoard> dashBoards;

  public WorkBook() {
    // Empty Constructor
  }

  /**
   * Workspace MemberId 를 key 로 Map 객체 전달
   *
   * @return WorkBook 요약 정보
   */
  @JsonIgnore
  public Map<String, DashBoard> getDashBoardIdMap() {
    return this.dashBoards.stream()
                       .collect(Collectors.toMap(DashBoard::getId, dashBoard -> dashBoard));
  }

  @Override
  public Book copyOf(Workspace parent, boolean addPrefix) {
    WorkBook copiedBook = new WorkBook();
    copiedBook.setName(addPrefix ? PolarisUtils.COPY_OF_PREFIX + name : name);
    copiedBook.setDescription(description);
    copiedBook.setTag(tag);
    copiedBook.setFolderId(folderId);
    copiedBook.setWorkspace(parent == null ? workspace : parent);

    return copiedBook;
  }

  @Override
  public Map<String, Object> listViewProjection() {
    Map<String, Object> projection = super.listViewProjection();
    projection.put("type", "workbook");

    Map<String, Object> contents = Maps.newLinkedHashMap();
    contents.put("dashboard", dashBoards.size());

    // TODO: 기획쪽과 논의해볼 필요가 있음.
    final Map<String, DataSource> dataSourceMap = Maps.newHashMap();
    for (DashBoard dashBoard : dashBoards) {
      if(dashBoard.getDataSources() == null) {
        continue;
      }
      dashBoard.getDataSources().forEach(dataSource -> {
        if(!dataSourceMap.containsKey(dataSource.getId())) {
          dataSourceMap.put(dataSource.getId(), dataSource);
        }
      });
    }
    contents.put("dataSource", dataSourceMap.values().size());

    projection.put("contents", contents);

    return projection;
  }

  @Override
  public Map<String, Object> treeViewProjection() {
    Map<String, Object> projection = super.treeViewProjection();
    projection.put("type", "workbook");

    return projection;
  }

  public List<DashBoard> getDashBoards() {
    return dashBoards;
  }

  public void setDashBoards(List<DashBoard> dashBoards) {
    this.dashBoards = dashBoards;
  }
}
