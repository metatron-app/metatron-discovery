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

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.validation.constraints.Size;

import app.metatron.discovery.domain.MetatronDomain;

@Entity
@Table(name="data_lineage_workflow")
public class DataLineageWorkFlow implements MetatronDomain<Long> {

  @Id
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Column(name = "id")
  Long id;

  @Column(name = "workflow_id")
  String workflowId;

  @Column(name="name")
  String name;

  @Column(name="shape_id")
  String shapeId;

  @Column(name="task_id")
  String taskId;

  @Column(name="task_name")
  String taskName;

  @Lob
  @Column(name="task_content")
  String taskContent;

  @Column(name="task_file")
  String taskFile;

  @Column(name="task_hadoop")
  String taskHadoop;

  @Column(name="task_type")
  String taskType;

  @Column(name="task_description")
  @Size(max=5000)
  String taskDescription;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getShapeId() {
    return shapeId;
  }

  public void setShapeId(String shapeId) {
    this.shapeId = shapeId;
  }

  public String getTaskId() {
    return taskId;
  }

  public void setTaskId(String taskId) {
    this.taskId = taskId;
  }

  public String getTaskName() {
    return taskName;
  }

  public void setTaskName(String taskName) {
    this.taskName = taskName;
  }

  public String getTaskContent() {
    return taskContent;
  }

  public void setTaskContent(String taskContent) {
    this.taskContent = taskContent;
  }

  public String getTaskFile() {
    return taskFile;
  }

  public void setTaskFile(String taskFile) {
    this.taskFile = taskFile;
  }

  public String getTaskHadoop() {
    return taskHadoop;
  }

  public void setTaskHadoop(String taskHadoop) {
    this.taskHadoop = taskHadoop;
  }

  public String getTaskType() {
    return taskType;
  }

  public void setTaskType(String taskType) {
    this.taskType = taskType;
  }

  public String getTaskDescription() {
    return taskDescription;
  }

  public void setTaskDescription(String taskDescription) {
    this.taskDescription = taskDescription;
  }

  public String getWorkflowId() {
    return workflowId;
  }

  public void setWorkflowId(String workflowId) {
    this.workflowId = workflowId;
  }

  @Override
  public String toString() {
    return "DataLineageWorkFlow{" +
            "id=" + id +
            ", workflowId='" + workflowId + '\'' +
            ", name='" + name + '\'' +
            ", shapeId='" + shapeId + '\'' +
            ", taskId='" + taskId + '\'' +
            ", taskName='" + taskName + '\'' +
            ", taskContent='" + taskContent + '\'' +
            ", taskFile='" + taskFile + '\'' +
            ", taskHadoop='" + taskHadoop + '\'' +
            ", taskType='" + taskType + '\'' +
            ", taskDescription='" + taskDescription + '\'' +
            '}';
  }
}
