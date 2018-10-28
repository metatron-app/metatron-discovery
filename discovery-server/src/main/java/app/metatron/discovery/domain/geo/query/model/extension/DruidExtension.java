package app.metatron.discovery.domain.geo.query.model.extension;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.io.Serializable;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = AggregationExtension.class, name = "aggregation")
})
public interface DruidExtension extends Serializable {
  String toParamString();
}
