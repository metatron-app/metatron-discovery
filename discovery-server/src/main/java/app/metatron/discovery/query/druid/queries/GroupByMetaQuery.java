package app.metatron.discovery.query.druid.queries;

import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.query.druid.Query;

@JsonTypeName("groupBy.meta")
public class GroupByMetaQuery extends Query {

  Query query;

  public GroupByMetaQuery(Query query) {
    ((GroupByQuery) query).setGroupingSets(null);
    this.query = query;
  }

  public Query getQuery() {
    return query;
  }

  public void setQuery(Query query) {
    this.query = query;
  }
}
