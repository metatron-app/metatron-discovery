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

package app.metatron.discovery.domain.notebook;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import app.metatron.discovery.domain.MetatronDomain;

/**
 * Created by james on 2017. 9. 21..
 */
@Entity
@Table(name = "notebook_api")
public class NotebookAPI implements MetatronDomain<String> {

    @Id
    @Column(name = "api_id")
    String id;

    @Column(name = "api_name")
    String name;

    @Column(name = "api_desc", length = 1000)
    String desc;

    @Column(name = "api_url")
    String url;

    @Column(name = "api_return_type")
    @Enumerated(EnumType.STRING)
    NotebookAPI.ReturnType returnType;

    @OneToOne(mappedBy = "notebookAPI")
    Notebook notebook;

    public NotebookAPI() {
    }

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

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public NotebookAPI.ReturnType getReturnType() {
        return returnType;
    }

    public void setReturnType(NotebookAPI.ReturnType returnType) {
        this.returnType = returnType;
    }

    public Notebook getNotebook() {
        return notebook;
    }

    public void setNotebook(Notebook notebook) {
        this.notebook = notebook;
    }

    public enum ReturnType {
        HTML, JSON, Void
    }
}
