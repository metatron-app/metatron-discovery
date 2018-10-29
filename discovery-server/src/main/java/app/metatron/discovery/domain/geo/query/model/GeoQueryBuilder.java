package app.metatron.discovery.domain.geo.query.model;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.domain.geo.query.model.extension.AggregationExtension;
import app.metatron.discovery.domain.geo.query.model.filter.AndOperator;
import app.metatron.discovery.domain.geo.query.model.filter.BBox;
import app.metatron.discovery.domain.geo.query.model.filter.GeoFilter;
import app.metatron.discovery.domain.geo.query.model.filter.OrOperator;
import app.metatron.discovery.domain.geo.query.model.filter.PropertyIsBetween;
import app.metatron.discovery.domain.geo.query.model.filter.PropertyIsEqualTo;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MultiDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.BoundFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.SpatialBboxFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.SpatialFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeAllFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeListFilter;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoBoundaryFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoHashFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoJoinFormat;
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
 */
public class GeoQueryBuilder extends AbstractQueryBuilder {

  String srsName;

  List<PropertyName> propertyNames;

  GeoFilter geoFilter;

  List<Dimension> dimensions = Lists.newArrayList();

  String mainDataSource;

  String boundary;

  Map<String, Object> boundaryJoin;

  Map<String, String> projectionMapper = Maps.newHashMap();

  List<String> minMaxFields = Lists.newArrayList();

  boolean enableExtension = false;

  int limit = 5000;

  public GeoQueryBuilder() {
  }

  public GeoQueryBuilder(DataSource dataSource) {
    super(dataSource);

    // TODO: Deciding where to place the type information of the coordinate system
    srsName = "EPSG:4326";
  }

  public GeoQueryBuilder initVirtualColumns(List<UserDefinedField> userFields) {

    setVirtualColumns(userFields);

    return this;
  }

  public GeoQueryBuilder projections(List<Field> projections) {

    if (propertyNames == null) {
      propertyNames = Lists.newArrayList();
    }

    setMainDataSource(projections);

    boolean needExtension = needExtension(projections);

    int measureCnt = 1;
    int dimensionCnt = 1;
    int geoCnt = 1;
    for (Field field : projections) {

      String fieldName = checkColumnName(field.getColunm());

      // TODO: add user-defined field case.
      if (!metaFieldMap.containsKey(fieldName)) {
        throw new QueryTimeExcetpion("Invalid field name: " + fieldName);
      }

      app.metatron.discovery.domain.datasource.Field datasourceField = metaFieldMap.get(fieldName);
      FieldFormat fieldFormat = field.getFormat();

      if (datasourceField.getRole() == FieldRole.DIMENSION) {
        if (datasourceField.getLogicalType() == LogicalType.GEO_POINT) {

          if (fieldFormat instanceof GeoHashFormat) {
            enableExtension = true;

            GeoHashFormat geoHashFormat = (GeoHashFormat) fieldFormat;

            String dummyDimName = "__s" + dimensionCnt++;
            String geoName = "__g" + geoCnt++;

            virtualColumns.put(dummyDimName, new ExprVirtualColumn(geoHashFormat.toHashExpression(field.getName()), dummyDimName));
            dimensions.add(new DefaultDimension(dummyDimName));
            postAggregations.add(new ExprPostAggregator(geoHashFormat.toWktExpression(dummyDimName, geoName)));

          } else if (fieldFormat instanceof GeoBoundaryFormat) {
            enableExtension = true;

            GeoBoundaryFormat boundaryFormat = (GeoBoundaryFormat) fieldFormat;
            boundary = boundaryFormat.toBoundary();
            boundaryJoin = boundaryFormat.toBoundaryJoin(projectionMapper, geoCnt++, dimensionCnt++);

          } else {
            for (String geoPointKey : LogicalType.GEO_POINT.getGeoPointKeys()) {
              String propName = fieldName + "." + geoPointKey;
              propertyNames.add(new PropertyName(propName));
            }
            //dimensions.add(new DefaultDimension(field.getColunm(), field.getAlias()));
          }
        } else if (datasourceField.getLogicalType() == LogicalType.GEO_POLYGON) {
          if (fieldFormat instanceof GeoJoinFormat) {
            continue;  // ignore
          }
          propertyNames.add(new PropertyName(fieldName));

        } else if (datasourceField.getLogicalType() == LogicalType.GEO_LINE) {
          propertyNames.add(new PropertyName(fieldName));

        } else {  // Case of Normal Dimension
          if (checkIgnore(field.getRef())) {
            continue;
          }
          propertyNames.add(new PropertyName(fieldName));
          dimensions.add(new DefaultDimension(fieldName, field.getAlias()));
          projectionMapper.put(fieldName, field.getAlias());
        }
      } else if (datasourceField.getRole() == FieldRole.MEASURE) {

        if (checkIgnore(field.getRef())) {
          continue;
        }

        if(needExtension) {
          if (postAggregations == null) {
            postAggregations = Lists.newArrayList();
          }
          enableExtension = true;
          addAggregationFunction((MeasureField) field);

          String predefinedMeasure = "__d" + measureCnt++;
          postAggregations.add(new ExprPostAggregator(predefinedMeasure + "=\\\"" + field.getAlias() + "\\\""));
          projectionMapper.put(predefinedMeasure, field.getAlias());
        } else {
          propertyNames.add(new PropertyName(field.getName()));
          projectionMapper.put(field.getName(), field.getAlias());
        }
        minMaxFields.add(field.getAlias());
      }
    }

    return this;
  }

  private boolean checkIgnore(String dataSource) {
    if(StringUtils.isNotEmpty(dataSource)
        && !mainDataSource.equals(dataSource)) {
      return true;
    }

    return false;
  }

  private boolean needExtension(List<Field> fields) {

    for (Field field : fields) {
      if(field.getFormat() instanceof GeoJoinFormat
          || field.getFormat() instanceof GeoBoundaryFormat
          || field.getFormat() instanceof GeoHashFormat) {
        return true;
      }
    }

    return false;
  }

  private void setMainDataSource(List<Field> projections) {
    if (dataSource instanceof MultiDataSource) {
      for (Field field : projections) {
        if (field.getFormat() instanceof GeoFormat
            && !(field.getFormat() instanceof GeoJoinFormat)) {
          mainDataSource = field.getRef();
        }
      }
    } else {
      mainDataSource = dataSource.getName();
    }
  }

  public GeoQueryBuilder limit(Limit limit) {
    if (limit == null) {
      return this;
    }

    this.limit = limit.getLimit();
    return this;
  }

  public GeoQueryBuilder filters(List<Filter> filters) {

    if (geoFilter == null) {
      geoFilter = new GeoFilter();
    }

    if (CollectionUtils.isEmpty(filters)) {
      return this;
    }

    AndOperator andOperator = new AndOperator();

    for (Filter filter : filters) {

      if (checkIgnore(filter.getRef())) {
        continue;
      }

      String name = filter.getField();

      if (filter instanceof InclusionFilter) {
        List<String> values = ((InclusionFilter) filter).getValueList();
        if(CollectionUtils.isEmpty(values)) {
          continue;
        }

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
    if (spatialFilter instanceof SpatialBboxFilter) {
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

    String queryTypeName = GeoQuery.PREFIX_TYPE_NAME + mainDataSource;

    GeoQuery geoQuery = new GeoQuery(queryTypeName, srsName);
    geoQuery.setFilter(geoFilter);

    if (CollectionUtils.isNotEmpty(propertyNames)) {
      geoQuery.addPropertyName(propertyNames.toArray(new PropertyName[propertyNames.size()]));
    }

    if (enableExtension) {
      geoQuery.setExtension(new AggregationExtension(Lists.newArrayList(virtualColumns.values()),
                                                     dimensions, aggregations, postAggregations,
                                                     boundary, boundaryJoin));
    }

    geoQuery.setProjectionMapper(projectionMapper);
    geoQuery.setMinMaxFields(minMaxFields);
    geoQuery.setLimit(limit);

    return geoQuery;
  }
}
