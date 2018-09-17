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

package app.metatron.discovery.domain.datasource.data.result;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

import org.apache.commons.lang3.BooleanUtils;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;

/**
 * Created by kyungtaak on 2016. 7. 4..
 */
@JsonTypeName("graph")
public class GraphResultFormat extends SearchResultFormat {

  Boolean useLinkCount;

  Boolean mergeNode;

  public GraphResultFormat() {
  }

  @JsonCreator
  public GraphResultFormat(@JsonProperty("useLinkCount") Boolean useLinkCount,
                           @JsonProperty("mergeNode") Boolean mergeNode) {
    this.useLinkCount = BooleanUtils.isTrue(useLinkCount);
    this.mergeNode = BooleanUtils.isTrue(mergeNode);
  }

  @Override
  public Object makeResult(JsonNode node) {

    if (!(node.has("links") && node.has("nodes"))) {
      return node;
    }

    ArrayNode nodes = (ArrayNode) node.get("nodes");

    List<Node> graphNodes = Lists.newArrayList();
    List<String> dimNames = Lists.newArrayList();
    String measureName = null;
    for (Field field : request.getProjections()) {
      if (field instanceof DimensionField) {
        dimNames.add(field.getAlias());
      } else if (field instanceof MeasureField) {
        measureName = field.getAlias();
      }
    }

    Map<String, Node> nodeMap = Maps.newLinkedHashMap();
    for (JsonNode jsonNode : nodes) {
      String nodeName = null;
      String nodeValue = null;
      for (String dimName : dimNames) {
        if (jsonNode.hasNonNull(dimName)) {
          nodeName = dimName;
          nodeValue = jsonNode.get(dimName).asText();
          break;
        }
      }

      if(mergeNode) {
        if(nodeMap.containsKey(nodeValue)) {
          nodeMap.get(nodeValue).mergeNode(nodeName, jsonNode.get(measureName).numberValue());
        } else {
          nodeMap.put(nodeValue, new Node(Lists.newArrayList(nodeName), nodeValue, jsonNode.get(measureName).numberValue()));
        }
      } else {
        graphNodes.add(new Node(nodeName, nodeValue, jsonNode.get(measureName).numberValue()));
      }
    }

    if(!nodeMap.isEmpty()) {
      graphNodes.addAll(nodeMap.values());
    }

    ArrayNode linkNodes = (ArrayNode) node.get("links");
    List<Link> links = Lists.newArrayList();
    for (JsonNode jsonNode : linkNodes) {
      links.add(new Link(
          jsonNode.get("sourceField").asText(),
          jsonNode.get("source").asText(),
          jsonNode.get("targetField").asText(),
          jsonNode.get("target").asText(),
          jsonNode.get("value").numberValue()));
    }

    return new GraphResponse(graphNodes, links);
  }

  public Boolean getUseLinkCount() {
    return useLinkCount;
  }

  public Boolean getMergeNode() {
    return mergeNode;
  }

  public static class GraphResponse implements Serializable {

    List<Node> nodes;

    List<Link> links;

    public GraphResponse() {
    }

    public GraphResponse(List<Node> nodes, List<Link> links) {
      this.nodes = nodes;
      this.links = links;
    }

    public List<Node> getNodes() {
      return nodes;
    }

    public void setNodes(List<Node> nodes) {
      this.nodes = nodes;
    }

    public List<Link> getLinks() {
      return links;
    }

    public void setLinks(List<Link> links) {
      this.links = links;
    }
  }

  public static class Link implements Serializable {

    String sourceField;

    String source;

    String targetField;

    String target;

    Number value;

    public Link() {
    }

    public Link(String sourceField, String source, String targetField, String target, Number value) {
      this.sourceField = sourceField;
      this.source = source;
      this.targetField = targetField;
      this.target = target;
      this.value = value;
    }

    public Link(String source, String target, Number value) {
      this.source = source;
      this.target = target;
      this.value = value;
    }

    public String getSource() {
      return source;
    }

    public void setSource(String source) {
      this.source = source;
    }

    public String getTarget() {
      return target;
    }

    public void setTarget(String target) {
      this.target = target;
    }

    public String getSourceField() {
      return sourceField;
    }

    public void setSourceField(String sourceField) {
      this.sourceField = sourceField;
    }

    public String getTargetField() {
      return targetField;
    }

    public void setTargetField(String targetField) {
      this.targetField = targetField;
    }

    public Number getValue() {
      return value;
    }

    public void setValue(Number value) {
      this.value = value;
    }
  }

  public static class Node implements Serializable {

    String field;

    List<String> fields;

    String name;

    Number value;

    public Node() {
    }

    public Node(String field, String name, Number value) {
      this.field = field;
      this.name = name;
      this.value = value;
    }

    public Node(List<String> fields, String name, Number value) {
      this.fields = fields;
      this.name = name;
      this.value = value;
    }

    public void mergeNode(String field, Number value) {
      if(this.fields == null) {
        this.fields = Lists.newArrayList();
      }

      this.fields.add(field);
      this.value = this.value.doubleValue() + value.doubleValue();
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getField() {
      return field;
    }

    public void setField(String field) {
      this.field = field;
    }

    public List<String> getFields() {
      return fields;
    }

    public void setFields(List<String> fields) {
      this.fields = fields;
    }

    public Number getValue() {
      return value;
    }

    public void setValue(Number value) {
      this.value = value;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Node node = (Node) o;

      if (field != null ? !field.equals(node.field) : node.field != null) return false;
      return name.equals(node.name);
    }

    @Override
    public int hashCode() {
      int result = field != null ? field.hashCode() : 0;
      result = 31 * result + name.hashCode();
      return result;
    }
  }
}
