package app.metatron.discovery.spec.druid.ingestion.expr;

import com.google.common.collect.Lists;

import org.apache.commons.lang3.StringUtils;

import java.util.List;

public class Struct implements Function {

  String name = "struct";

  List<String> args;

  public Struct(String... columns) {
    this.args = Lists.newArrayList(columns);
  }

  @Override
  public String getName() {
    return name;
  }

  @Override
  public String expr() {
    StringBuilder sb = new StringBuilder();
    sb.append(name).append("(")
      .append(StringUtils.join(args, ","))
      .append(")");
    return sb.toString();
  }
}
