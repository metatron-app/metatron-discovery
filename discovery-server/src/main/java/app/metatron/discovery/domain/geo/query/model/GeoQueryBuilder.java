package app.metatron.discovery.domain.geo.query.model;

import com.google.common.collect.Lists;

import org.apache.commons.collections4.CollectionUtils;

import java.util.List;

import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.domain.geo.query.model.filter.AndOperator;
import app.metatron.discovery.domain.geo.query.model.filter.GeoFilter;
import app.metatron.discovery.domain.geo.query.model.filter.OrOperator;
import app.metatron.discovery.domain.geo.query.model.filter.PropertyIsBetween;
import app.metatron.discovery.domain.geo.query.model.filter.PropertyIsEqualTo;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.filter.BoundFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;

import static app.metatron.discovery.domain.datasource.Field.FieldRole;

/**
 * Builder Geo Server WFS Query </br>
 *
 * http://docs.geoserver.org/latest/en/user/services/wfs/reference.html
 *
 */
public class GeoQueryBuilder extends AbstractQueryBuilder {

  String queryTypeName;

  String srsName;

  List<PropertyName> propertyNames;

  GeoFilter geoFilter;

  public GeoQueryBuilder() {
  }

  public GeoQueryBuilder(DataSource dataSource) {
    super(dataSource);

    queryTypeName = GeoQuery.PREFIX_TYPE_NAME + dataSource.getName();

    // TODO: Deciding where to place the type information of the coordinate system
    srsName = "EPSG:4326";
  }

  public GeoQueryBuilder projections(List<Field> projections) {

    if (propertyNames == null) {
      propertyNames = Lists.newArrayList();
    }

    for (Field field : projections) {

      String fieldName = checkColumnName(field.getColunm());

      // TODO: add user-defined field case.
      if(!metaFieldMap.containsKey(fieldName)) {
        throw new QueryTimeExcetpion("Invalid field name: " + fieldName);
      }

      app.metatron.discovery.domain.datasource.Field datasourceField = metaFieldMap.get(fieldName);
      if(datasourceField.getRole() == FieldRole.MEASURE
          && datasourceField.getLogicalType() == LogicalType.GIS) {
        for (String gisStructKey : LogicalType.GIS.getGisStructKeys()) {
          propertyNames.add(new PropertyName(fieldName + "." + gisStructKey));
        }
      } else {
        propertyNames.add(new PropertyName(fieldName));
      }
    }

    return this;
  }

  public GeoQueryBuilder filters(List<Filter> filters) {

    if (geoFilter == null) {
      geoFilter = new GeoFilter();
    }

    if(CollectionUtils.isEmpty(filters)) {
      return this;
    }

    AndOperator andOperator = new AndOperator();

    for (Filter filter : filters) {
      String name = filter.getField();

      if (filter instanceof InclusionFilter) {
        List<String> values = ((InclusionFilter) filter).getValueList();

        OrOperator orOperator = new OrOperator();
        for (String value : values) {
          orOperator.addFilter(new PropertyIsEqualTo(name, value));
        }
        andOperator.addLogicalOperator(orOperator);
      } else if (filter instanceof BoundFilter) {
        BoundFilter boundFilter = (BoundFilter) filter;
        andOperator.addFilter(new PropertyIsBetween(name,
                                                  boundFilter.getMin().toString(),
                                                  boundFilter.getMax().toString()));
      }
      // Support TimeFilter
    }

    geoFilter.addLogicalOperator(andOperator);

    return this;
  }

  public GeoQuery build() {
    GeoQuery geoQuery = new GeoQuery(queryTypeName, srsName);
    geoQuery.setFilter(geoFilter);

    if (CollectionUtils.isNotEmpty(propertyNames)) {
      geoQuery.addPropertyName(propertyNames.toArray(new PropertyName[propertyNames.size()]));
    }

    return geoQuery;
  }
}
