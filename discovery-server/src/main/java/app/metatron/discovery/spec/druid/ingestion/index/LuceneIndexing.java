package app.metatron.discovery.spec.druid.ingestion.index;

import com.google.common.collect.Lists;

import java.util.List;

public class LuceneIndexing implements SecondaryIndexing {

  List<LuceneIndexStrategy> strategies;

  public LuceneIndexing(LuceneIndexStrategy... strategies) {
    this.strategies = Lists.newArrayList(strategies);
  }

  public LuceneIndexing(List<LuceneIndexStrategy> strategies) {
    this.strategies = strategies;
  }

  public List<LuceneIndexStrategy> getStrategies() {
    return strategies;
  }

}
