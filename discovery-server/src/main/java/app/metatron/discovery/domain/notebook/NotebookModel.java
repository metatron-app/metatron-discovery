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

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;

import java.util.Collections;
import java.util.List;

import javax.persistence.*;
import javax.validation.constraints.Size;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;

/**
 * Created by james on 2017. 7. 12..
 */
@Entity
@Table(name = "notebook_model")
public class NotebookModel extends AbstractHistoryEntity implements MetatronDomain<String> {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "id")
    String id;

    @Column(name = "model_name", nullable = false)
    @NotBlank
    @Size(max = 150)
    String name;

    @Column(name = "model_desc", length = 1000)
    @Size(max = 900)
    String description;

    @Column(name = "status_type")
    @Enumerated(EnumType.STRING)
    StatusType statusType = StatusType.PENDING;

    @Column(name = "subscribe_type")
    @Enumerated(EnumType.STRING)
    SubscribeType subscribeType;

    @JsonIgnore
    @Column(name = "script")
    String script;

    @ManyToOne
    @JoinColumn(name = "nb_id")
    @JsonBackReference
    Notebook notebook;

//    @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
//    @JoinTable(name = "notebook_model_widget",
//            joinColumns = @JoinColumn(name = "nbm_id", referencedColumnName = "id"),
//            inverseJoinColumns = @JoinColumn(name = "wg_id", referencedColumnName = "id"))
//    Set<Widget> widgets;

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "notebookModel")
    List<NotebookModelHistory> histories;

    public NotebookModel() {
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public StatusType getStatusType() {
        return statusType;
    }

    public void setStatusType(StatusType statusType) {
        this.statusType = statusType;
    }

    public SubscribeType getSubscribeType() {
        return subscribeType;
    }

    public void setSubscribeType(SubscribeType subscribeType) {
        this.subscribeType = subscribeType;
    }

    public String getScript() {
        return script;
    }

    public void setScript(String script) {
        this.script = script;
    }

    public Notebook getNotebook() {
        return notebook;
    }

    public void setNotebook(Notebook notebook) {
        this.notebook = notebook;
    }

//    public Set<Widget> getWidgets() {
//        return widgets;
//    }
//
//    public void setWidgets(Set<Widget> widgets) {
//        this.widgets = widgets;
//    }

    public List<NotebookModelHistory> getHistories() {
        Collections.reverse(histories); // sort by recently
        return histories.subList(0,20);
    }

    public void setHistories(List<NotebookModelHistory> histories) {
        this.histories = histories;
    }

    public String getNotebookPath() {
        return this.getNotebook().getLink();
    }

    public enum StatusType {
        APPROVAL, REJECT, PENDING
    }

    public enum SubscribeType {
        HTML, JSON
    }
}
