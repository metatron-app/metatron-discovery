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


import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import com.fasterxml.jackson.annotation.JsonBackReference;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.core.annotation.RestResource;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;


@Entity
@Table(name="queryeditor")
public class QueryEditor extends AbstractHistoryEntity implements MetatronDomain<String>  {
	
	@Id
	@GeneratedValue(generator = "uuid")
	@GenericGenerator(name = "uuid", strategy = "uuid2")
	@Column(name = "id")
	String id;
	
	@Column(name="qe_name")
	@NotBlank
	String name;
	
	@Column(name="qe_order")
	int order;
	
	@Lob
	@Column(name="qe_query")
	String query;

	@Column(name="qe_index")
	Integer index;

	@ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
	@JoinColumn(name = "book_id", referencedColumnName = "id")
	@JsonBackReference
	Workbench workbench;
	
	@OneToMany(mappedBy = "queryEditor", cascade = CascadeType.ALL)
	@OrderBy("modifiedTime DESC")
	@RestResource(path = "queryhistories")
	Set<QueryHistory> queryHistories;

	@OneToMany(mappedBy = "queryEditor", orphanRemoval = true, cascade = CascadeType.ALL)
	@OrderBy("id ASC")
	List<QueryEditorResult> queryResults = new ArrayList<>();

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getOrder() {
		return order;
	}

	public void setOrder(int order) {
		this.order = order;
	}

	public String getQuery() {
		return query;
	}

	public void setQuery(String query) {
		this.query = query;
	}

	public Workbench getWorkbench() {
		return workbench;
	}

	public void setWorkbench(Workbench workbench) {
		this.workbench = workbench;
	}

	public Set<QueryHistory> getQueryHistories() {
		return queryHistories;
	}

	public void setQueryHistories(Set<QueryHistory> queryHistories) {
		this.queryHistories = queryHistories;
	}

  public Integer getIndex() {
    return index;
  }

  public void setIndex(Integer index) {
    this.index = index;
  }

	public void addQueryResult(QueryEditorResult queryEditorResult) {
		this.queryResults.add(queryEditorResult);

		if(queryEditorResult.getQueryEditor() != this) {
			queryEditorResult.setQueryEditor(this);
		}
	}

	public List<QueryEditorResult> getQueryResults() {
		return queryResults;
	}

	public void clearQueryResults() {
		this.queryResults.clear();
	}

	@Override
	public String toString() {
		return "QueryEditor{" +
						"id='" + id + '\'' +
						", name='" + name + '\'' +
						", order=" + order +
						", query='" + query + '\'' +
						", index=" + index +
						'}';
	}

	@PrePersist
	public void prePersist(){
		super.prePersist();

		Set<QueryEditor> queryEditorList = this.getWorkbench().getQueryEditors();
		int maxIndex = queryEditorList.size();
		for(QueryEditor queryEditor : queryEditorList){
		  if(queryEditor.getIndex() != null){
        maxIndex = Math.max(queryEditor.getIndex(), maxIndex);
      }
		}

    this.setIndex(maxIndex + 1);
	}
}
