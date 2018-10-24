package app.metatron.discovery.spec.druid.ingestion.parser;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use=JsonTypeInfo.Id.NAME,
    include= JsonTypeInfo.As.EXTERNAL_PROPERTY, property="type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = JsonFlattenField.RootFlattenField.class, name = "root"),
    @JsonSubTypes.Type(value = JsonFlattenField.PathFlattenField.class, name = "path"),
    @JsonSubTypes.Type(value = JsonFlattenField.JQFlattenField.class, name = "jq")
})
public interface JsonFlattenField {

  String getName();

  String getExpr();

  class RootFlattenField implements JsonFlattenField {

    String name;

    @JsonCreator
    public RootFlattenField(@JsonProperty("name") String name) {
      this.name = name;
    }

    @Override
    public String getName() {
      return name;
    }

    @Override
    public String getExpr() {
      return null;
    }
  }

  class PathFlattenField implements JsonFlattenField {

    String name;

    String expr;

    @JsonCreator
    public PathFlattenField(@JsonProperty("name") String name,
                            @JsonProperty("expr") String expr) {
      this.name = name;
      this.expr = expr;
    }

    @Override
    public String getName() {
      return name;
    }

    @Override
    public String getExpr() {
      return expr;
    }
  }

  class JQFlattenField extends PathFlattenField implements JsonFlattenField {

    @JsonCreator
    public JQFlattenField(@JsonProperty("name") String name,
                          @JsonProperty("expr") String expr) {
      super(name, expr);
    }

  }
}
