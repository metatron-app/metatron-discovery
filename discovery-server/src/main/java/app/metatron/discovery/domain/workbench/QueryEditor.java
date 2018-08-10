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
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.Set;

import javax.persistence.*;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;


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

	@ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
	@JoinColumn(name = "book_id", referencedColumnName = "id")
	@JsonBackReference
	Workbench workbench;
	
	@OneToMany(mappedBy = "queryEditor", cascade = CascadeType.ALL)
	@OrderBy("modifiedTime DESC")
	@RestResource(path = "queryhistories")
	Set<QueryHistory> queryHistories;

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

	@Override
	public String toString() {
		return "QueryEditor [id=" + id
				+ ", name=" + name
				+ ", order=" + order
				+ ", query=" + query
				+ "]";
	}
}
