package app.metatron.discovery.domain.datasource.ingestion;

import com.google.common.collect.Lists;

import org.apache.commons.collections4.MapUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class IngestionOptionService {

  @Autowired
  IngestionOptionRepository ingestionOptionRepository;

  public List<IngestionOption> findIngestionOptions(IngestionOption.OptionType optionEnumType,
                                                    IngestionOption.IngestionType ingestionEnumType) {
    Iterable<IngestionOption> resultOptions = ingestionOptionRepository.findAll(
        IngestionOptionPredicate.searchList(optionEnumType, ingestionEnumType)
    );

    return Lists.newArrayList(resultOptions);

  }

  public Map<String, Object> findTuningOptionMap(IngestionOption.IngestionType ingestionEnumType,
                                                 Map<String, Object> overrideOptions) {

    Map<String, Object> tuningOptions = findIngestionOptions(IngestionOption.OptionType.TUNING, ingestionEnumType)
        .stream().collect(Collectors.toMap(k -> k.getName(), v -> v.defaultValueByType()));

    if (MapUtils.isEmpty(overrideOptions)) {
      return tuningOptions;
    }

    for (String key : overrideOptions.keySet()) {
      tuningOptions.put(key, overrideOptions.get(key));
    }

    return tuningOptions;

  }

  public Map<String, Object> findJobOptionMap(IngestionOption.IngestionType ingestionEnumType,
                                              Map<String, Object> overrideOptions) {

    Map<String, Object> jobOptions = findIngestionOptions(IngestionOption.OptionType.JOB, ingestionEnumType)
        .stream().collect(Collectors.toMap(k -> k.getName(), v -> v.defaultValueByType()));

    if (MapUtils.isEmpty(overrideOptions)) {
      return jobOptions;
    }

    for (String key : overrideOptions.keySet()) {
      jobOptions.put(key, overrideOptions.get(key));
    }

    return jobOptions;

  }
}
