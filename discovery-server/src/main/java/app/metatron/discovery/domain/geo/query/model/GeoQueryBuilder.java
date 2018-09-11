package app.metatron.discovery.domain.geo.query.model;

import com.google.common.collect.Lists;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.domain.geo.query.model.extension.AggregationExtension;
import app.metatron.discovery.domain.geo.query.model.filter.AndOperator;
import app.metatron.discovery.domain.geo.query.model.filter.BBox;
import app.metatron.discovery.domain.geo.query.model.filter.GeoFilter;
import app.metatron.discovery.domain.geo.query.model.filter.OrOperator;
import app.metatron.discovery.domain.geo.query.model.filter.PropertyIsBetween;
import app.metatron.discovery.domain.geo.query.model.filter.PropertyIsEqualTo;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.filter.BoundFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.SpatialBboxFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.SpatialFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeAllFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeListFilter;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoHashFormat;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.dimensions.DefaultDimension;
import app.metatron.discovery.query.druid.postaggregations.ExprPostAggregator;
import app.metatron.discovery.query.druid.virtualcolumns.ExprVirtualColumn;

import static app.metatron.discovery.domain.datasource.Field.FieldRole;
import static app.metatron.discovery.domain.datasource.Field.FieldRole.TIMESTAMP;

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

  List<Dimension> dimensions = Lists.newArrayList();

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

    int measureCnt = 1;
    int dimensionCnt = 1;
    int geoCnt = 1;
    for (Field field : projections) {

      String fieldName = checkColumnName(field.getColunm());

      // TODO: add user-defined field case.
      if(!metaFieldMap.containsKey(fieldName)) {
        throw new QueryTimeExcetpion("Invalid field name: " + fieldName);
      }

      app.metatron.discovery.domain.datasource.Field datasourceField = metaFieldMap.get(fieldName);
      FieldFormat fieldFormat = field.getFormat();

      if(datasourceField.getRole() == FieldRole.DIMENSION) {
        if(datasourceField.getLogicalType() == LogicalType.GEO_POINT) {
          if(fieldFormat != null && fieldFormat instanceof GeoHashFormat) {
            GeoHashFormat geoHashFormat = (GeoHashFormat) fieldFormat;
            String dummyDimName = "__s" + dimensionCnt++;
            String geoName = "__g" + geoCnt++;
            virtualColumns.put(dummyDimName, new ExprVirtualColumn(geoHashFormat.toHashExpression(field.getName()), dummyDimName));
            dimensions.add(new DefaultDimension(dummyDimName));
            postAggregations.add(new ExprPostAggregator(geoHashFormat.toWktExpression(dummyDimName, geoName)));
          } else {
            for (String geoPointKey : LogicalType.GEO_POINT.getGeoPointKeys()) {
              String propName = fieldName + "." + geoPointKey;
              propertyNames.add(new PropertyName(propName));
              dimensions.add(new DefaultDimension(propName));
            }
          }
        } else {
          propertyNames.add(new PropertyName(fieldName));
          dimensions.add(new DefaultDimension(fieldName, field.getAlias()));
        }
      } else if(datasourceField.getRole() == FieldRole.MEASURE) {
        if(postAggregations == null) {
          postAggregations = Lists.newArrayList();
        }
        addAggregationFunction((MeasureField) field);
        postAggregations.add(new ExprPostAggregator("__d" + measureCnt++ + "=\\\"" + field.getAlias() + "\\\""));
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
      } else if (filter instanceof TimeFilter) {
        addTimeFilter(andOperator, (TimeFilter) filter);
      } else if (filter instanceof SpatialFilter) {
        addSpatialFilter(andOperator, (SpatialFilter) filter);
      }
    }

    geoFilter.addLogicalOperator(andOperator);

    return this;
  }

  private void addSpatialFilter(AndOperator andOperator, SpatialFilter spatialFilter) {
    if(spatialFilter instanceof SpatialBboxFilter) {
      SpatialBboxFilter bboxFilter = (SpatialBboxFilter) spatialFilter;
      andOperator.addFilter(new BBox(spatialFilter.getColumn(), bboxFilter.getLowerCorner(), bboxFilter.getUpperCorner()));
    }
  }

  private void addTimeFilter(AndOperator andOperator, TimeFilter timeFilter) {

    if (timeFilter instanceof TimeAllFilter) {
      return;
    }

    String columnName = timeFilter.getColumn();
    app.metatron.discovery.domain.datasource.Field datasourceField = this.metaFieldMap.get(columnName);

    if (datasourceField.getRole() == TIMESTAMP && !(timeFilter instanceof TimeListFilter)) {
      OrOperator orOperator = new OrOperator();
      for (String engineInterval : timeFilter.getEngineIntervals()) {
        String[] splitedTimes = StringUtils.split(engineInterval, "/");
        orOperator.addFilter(new PropertyIsBetween("__time", splitedTimes[0], splitedTimes[1]));
      }
      andOperator.addLogicalOperator(orOperator);
    } else {
      // TODO : Support TimeFilter
    }

  }

  public GeoQuery build() {
    GeoQuery geoQuery = new GeoQuery(queryTypeName, srsName);
    geoQuery.setFilter(geoFilter);

    if (CollectionUtils.isNotEmpty(propertyNames)) {
      geoQuery.addPropertyName(propertyNames.toArray(new PropertyName[propertyNames.size()]));
    }

    geoQuery.setExtension(new AggregationExtension(Lists.newArrayList(virtualColumns.values()),
                                                   dimensions, aggregations, postAggregations,
                                                   null, null));

    return geoQuery;
  }
}
