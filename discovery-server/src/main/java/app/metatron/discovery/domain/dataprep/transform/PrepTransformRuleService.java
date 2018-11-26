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

package app.metatron.discovery.domain.dataprep.transform;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.PrepDataset;
import app.metatron.discovery.domain.dataprep.PrepDatasetRepository;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.CannotSerializeIntoJsonException;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.apache.parquet.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PrepTransformRuleService {
  private static Logger LOGGER = LoggerFactory.getLogger(PrepTransformRuleService.class);

  @Autowired
  private PrepDatasetRepository datasetRepository;

  public PrepTransformRuleService() { }

  public static final String CREATE_RULE_PREFIX = "create with: ";

  private RuleVisitorParser ruleVisitorParser = null;

  public String getCreateRuleString(String dsId) {
    return CREATE_RULE_PREFIX + dsId;
  }

  public String getUpstreamDsIdFromCreateRule(String ruleString) {
    return ruleString.substring(CREATE_RULE_PREFIX.length());
  }

  public String getCreateJsonRuleString(String ruleString) {
    Map<String, Object> map = new HashMap();
    String jsonRuleString = null;

    map.put("name", "create");
    map.put("with", ruleString.substring(CREATE_RULE_PREFIX.length()));

    try {
      jsonRuleString = GlobalObjectMapper.getDefaultMapper().writeValueAsString(map);
    } catch (JsonProcessingException e) {
      e.printStackTrace();
    }

    return jsonRuleString;
  }

  public String jsonizeRuleString(String ruleString) throws CannotSerializeIntoJsonException {
    String jsonRuleString;

    if (ruleString.startsWith(CREATE_RULE_PREFIX)) {
      return getCreateJsonRuleString(ruleString);
    }

    if (ruleVisitorParser == null) {
      ruleVisitorParser = new RuleVisitorParser();
    }

    Rule rule = ruleVisitorParser.parse(ruleString);

    try {
      jsonRuleString = GlobalObjectMapper.getDefaultMapper().writeValueAsString(rule);
    } catch (JsonProcessingException e) {
      throw new CannotSerializeIntoJsonException(e.getMessage());
    }

    return jsonRuleString;
  }

  // Expression -> String (especially for numeric binary operations and functions
  private String nodeToString(Object node) {
    if (node instanceof Map) {
      Map map = (Map) node;
      Object op = map.get("op");
      if (op != null) {
        return String.format("%s %s %s", nodeToString(map.get("left")), op, nodeToString(map.get("right")));
      }

      Object name = map.get("name");
      if (name != null) {
        assert map.containsKey("args");
        return String.format("%s(%s)", name, nodeToString(map.get("args")));
      }

      Object val = map.get("value");
      if (val instanceof List) {
        return Strings.join((List) val, ", ");
      }

      Object func = map.get("functions");
      if(func instanceof List) {
        return nodeToString(func);
      }

      return map.get("value").toString();
    }

    if (node instanceof List) {
      List list = (List) node;
      List<String> strElem = new ArrayList();

      for (Object elem : list) {
        strElem.add(nodeToString(elem));
      }

      return Strings.join(strElem, ", ");
    }

    return node.toString();
  }

  /**
   * Returns a string that represents the column list
   *
   * @param node  String or List<String> that contains the column list
   * @return String: the column name like "column1"
   *         List with 2 elements: column name list like "column1, column2"
   *         List with N (>2) elements: "N columns"
   */
  private String shortenColumnList(Object node) {
    if (node instanceof List) {
      List<Object> cols = (List<Object>) node;
      if (cols.size() >= 3) {
        return cols.size() + " columns";
      }
    }

    return nodeToString(node);
  }

  /**
   * Returns a string that represents the dataset
   *
   * @param node  String or List<String> that contains the dsId list
   * @return String: the dsName like "sales (CSV)"
   *         List with 2 elements: dsName list like "lineitem, customer"
   *         List with N (>2) elements: "N datasets"
   */
  private String shortenDatasetList(Object node) {
    assert node instanceof Map : node;
    Map map = (Map) node;

    if (map.containsKey("escapedValue")) {
      String dsId = (String) ((Map) node).get("escapedValue");
      PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
      return dataset.getDsName();
    }

    List<String> dsIds = (List<String>) map.get("value");
    List<String> dsNames = new ArrayList();

    if (dsIds.size() >= 3) {
      return dsIds.size() + " datasets";
    }

    for (String dsId : dsIds) {
      PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId.replace("'", "")));  // Currently, map contains '
      dsNames.add(dataset.getDsName());
    }

    return Strings.join(dsNames, ", ");
  }

  private String combineCountAndUnit(int count, String unit) {
    assert count > 0 : unit;

    if (count == 1) {
      return String.format("%d %s", count, unit);
    }
    return String.format("%d %ss", count, unit);
  }

  private final String FMTSTR_CREATE       = "create with %s";                          // with
  private final String FMTSTR_HEADER       = "Convert row %d to header";                // rownum
  private final String FMTSTR_KEEP         = "Keep rows where %s";                      // row
  private final String FMTSTR_RENAME       = "Rename %s to %s";                         // col, to
  private final String FMTSTR_RENAMES      = "Rename %s";                               // col
  private final String FMTSTR_NEST         = "Convert %s into %s";                      // col, into
  private final String FMTSTR_UNNEST       = "Create a new column from %s";             // col
  private final String FMTSTR_SETTYPE      = "set type %s to %s";                       // col, type
  private final String FMTSTR_SETFORMAT    = "set format %s to %s";                     // col, format
  private final String FMTSTR_DERIVE       = "Create %s from %s";                       // as, value
  private final String FMTSTR_DELETE       = "Delete rows where %s";                    // row
  private final String FMTSTR_SET          = "Set %s to %s";                            // col, value
  private final String FMTSTR_SPLIT        = "Split %s into %s on %s";                  // col, limit, on
  private final String FMTSTR_EXTRACT      = "Extract %s %s from %s";                   // on, limit, col
  private final String FMTSTR_FLATTEN      = "Convert arrays in %s to rows";            // col
  private final String FMTSTR_COUNTPATTERN = "Count occurrences of %s in %s";           // value, col
  private final String FMTSTR_SORT         = "Sort rows by %s %s";                      // order, type
  private final String FMTSTR_REPLACE      = "Replace %s from %s with %s";              // on, col, with
  private final String FMTSTR_REPLACES     = "Replace %s";                              // col
  private final String FMTSTR_MERGE        = "Concatenate %s separated by %s";          // col, with
  private final String FMTSTR_AGGREGATE    = "Aggregate with %s grouped by %s";         // value, group
  private final String FMTSTR_MOVE         = "Move %s %s";                              // col, before/after
  private final String FMTSTR_JOIN_UNION   = "%s with %s";                              // command, strDsNames
  private final String FMTSTR_PIVOT        = "Pivot %s and compute %s grouped by %s";   // col, value, group
  private final String FMTSTR_UNPIVOT      = "Convert %s into rows";                    // col
  private final String FMTSTR_DROP         = "Drop %s";                                 // col
  private final String FMTSTR_WINDOW       = "Create %s from %s%s%s";                   // N columns, value, order, group

  public String shortenRuleString(String jsonRuleString) {
    Map<String, Object> mapRule = null;
    Object col, to, on, val, order, type, with, group;
    String before, after, strCount, dsId, dsName;
    int limit;

    try {
      mapRule = (Map<String, Object>) GlobalObjectMapper.getDefaultMapper().readValue(jsonRuleString, Map.class);
    } catch (IOException e) {
      e.printStackTrace();
      // suppressed. this is impossible because the input is just from a JSON writer.
    }

    String ruleCommand = (String) mapRule.get("name");
    String shortRuleString;

    switch (ruleCommand) {
      case "create":
        dsId = (String) mapRule.get("with");
        dsName = datasetRepository.findRealOne(datasetRepository.findOne(dsId)).getDsName();
        shortRuleString = String.format(FMTSTR_CREATE, dsName);
        break;
      case "header":
        shortRuleString = String.format(FMTSTR_HEADER, mapRule.get("rownum"));
        break;
      case "keep":
        shortRuleString = String.format(FMTSTR_KEEP, nodeToString(mapRule.get("row")));
        break;
      case "rename":
        col = ((Map) mapRule.get("col")).get("value");
        to = ((Map) mapRule.get("to")).get("value");

        if (col instanceof List && ((List<Object>) col).size() >= 3) {
          shortRuleString = String.format(FMTSTR_RENAMES, shortenColumnList(col));
        } else {
          shortRuleString = String.format(FMTSTR_RENAME, shortenColumnList(col), nodeToString(to));
        }
        break;
      case "nest":
        col = ((Map) mapRule.get("col")).get("value");
        shortRuleString = String.format(FMTSTR_NEST, shortenColumnList(col), mapRule.get("into"));
        break;
      case "unnest":
        shortRuleString = String.format(FMTSTR_UNNEST, mapRule.get("col"));
        break;
      case "settype":
        col = ((Map) mapRule.get("col")).get("value");
        shortRuleString = String.format(FMTSTR_SETTYPE, shortenColumnList(col), mapRule.get("type"));
        break;
      case "setformat":
        col = ((Map) mapRule.get("col")).get("value");
        shortRuleString = String.format(FMTSTR_SETFORMAT, shortenColumnList(col), mapRule.get("format"));
        break;
      case "derive":
        shortRuleString = String.format(FMTSTR_DERIVE, mapRule.get("as"), nodeToString(mapRule.get("value")));
        break;
      case "delete":
        shortRuleString = String.format(FMTSTR_DELETE, nodeToString(mapRule.get("row")));
        break;
      case "set":
        col = ((Map) mapRule.get("col")).get("value");
        val = mapRule.get("value");
        shortRuleString = String.format(FMTSTR_SET, shortenColumnList(col), nodeToString(val));
        break;
      case "split":
        on = ((Map) mapRule.get("on")).get("value");
        limit = ((Integer) (mapRule.get("limit"))).intValue();
        strCount = combineCountAndUnit(limit + 1, "column");      // split N times, produces N + 1 columns
        shortRuleString = String.format(FMTSTR_SPLIT, mapRule.get("col"), strCount, nodeToString(on));
        break;
      case "extract":
        on = ((Map) mapRule.get("on")).get("value");
        limit = ((Integer) (mapRule.get("limit"))).intValue();
        strCount = combineCountAndUnit(limit, "time");            // extract N times, produces just N columns
        shortRuleString = String.format(FMTSTR_EXTRACT, nodeToString(on), strCount, mapRule.get("col"));
        break;
      case "flatten":
        shortRuleString = String.format(FMTSTR_FLATTEN, mapRule.get("col"));
        break;
      case "countpattern":
        col = ((Map) mapRule.get("col")).get("value");
        on = ((Map) mapRule.get("on")).get("value");
        shortRuleString = String.format(FMTSTR_COUNTPATTERN, nodeToString(on), shortenColumnList(col));
        break;
      case "sort":
        order = ((Map) mapRule.get("order")).get("value");
        String sortType = "ASC";
        type = mapRule.get("type");
        if (type != null) {
          if ((((Map) type).get("escapedValue")).toString().equalsIgnoreCase("DESC")) {
            sortType = "DESC";
          }
        }
        shortRuleString = String.format(FMTSTR_SORT, nodeToString(order), sortType);
        break;
      case "replace":
        on = ((Map) mapRule.get("on")).get("value");
        col = ((Map) mapRule.get("col")).get("value");
        with = ((Map) mapRule.get("with")).get("value");

        if (col instanceof List && ((List<Object>) col).size() >= 3) {
          shortRuleString = String.format(FMTSTR_REPLACES, shortenColumnList(col));
        } else {
          shortRuleString = String.format(FMTSTR_REPLACE, nodeToString(on), shortenColumnList(col), nodeToString(with));
        }
        break;
      case "merge":
        col = ((Map) mapRule.get("col")).get("value");
        shortRuleString = String.format(FMTSTR_MERGE, shortenColumnList(col), mapRule.get("with"));
        break;
      case "aggregate":
        group = ((Map) mapRule.get("group")).get("value");
        shortRuleString = String.format(FMTSTR_AGGREGATE, nodeToString(mapRule.get("value")), shortenColumnList(group));
        break;
      case "move":
        col = ((Map) mapRule.get("col")).get("value");
        before = (String) mapRule.get("before");
        after = (String) mapRule.get("after");
        String strTo = (before != null) ? "before " + before : "after " + after;
        shortRuleString = String.format(FMTSTR_MOVE, shortenColumnList(col), strTo);
        break;
      case "union":
      case "join":
        String strDsNames = shortenDatasetList(mapRule.get("dataset2"));
        shortRuleString = String.format(FMTSTR_JOIN_UNION, ruleCommand, strDsNames);
        break;
      case "pivot":
        col = ((Map) mapRule.get("col")).get("value");
        group = ((Map) mapRule.get("group")).get("value");
        shortRuleString = String.format(FMTSTR_PIVOT, shortenColumnList(col), nodeToString(mapRule.get("value")), shortenColumnList(group));
        break;
      case "unpivot":
        col = ((Map) mapRule.get("col")).get("value");
        shortRuleString = String.format(FMTSTR_UNPIVOT, shortenColumnList(col));
        break;
      case "drop":
        col = ((Map) mapRule.get("col")).get("value");
        shortRuleString = String.format(FMTSTR_DROP, shortenColumnList(col));
        break;
      case "window":
        // value
        val = mapRule.get("value");

        // N columns
        String strColumns = "a new column";
        if (((Map) val).size() == 1) {
          List functions = (List) ((Map) val).get("functions");
          strColumns = functions.size() + " columns";
        }

        // order
        order = mapRule.get("order");
        String strOrder = (order == null) ? "" : " ordered by " + nodeToString(((Map) order).get("value"));

        // group
        group = mapRule.get("group");
        String strGroup = (group == null) ? "" : " grouped by " + nodeToString(((Map) group).get("value"));

        shortRuleString = String.format(FMTSTR_WINDOW, strColumns, nodeToString(val), strOrder, strGroup);
        break;

      default:
        shortRuleString = "Unknown rule command: " + ruleCommand;
    }

    LOGGER.debug("shortRuleString: {}", shortRuleString);
    return shortRuleString;
  }
}
