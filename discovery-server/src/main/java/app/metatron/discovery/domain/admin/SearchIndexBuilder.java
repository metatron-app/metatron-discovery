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

package app.metatron.discovery.domain.admin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Created by kyungtaak on 2017. 1. 4..
 */
@Component
@Profile("initial")
public class SearchIndexBuilder implements ApplicationListener<ApplicationReadyEvent> {

  private static Logger LOGGER = LoggerFactory.getLogger(SearchIndexBuilder.class);

  @Autowired
  SearchIndexService searchIndexService;

  /**
   * Create an initial Lucene index for the data already present in the
   * database.
   * This method is called when Spring's startup.
   */
  @Override
  public void onApplicationEvent(final ApplicationReadyEvent event) {
    searchIndexService.reindexAll(25);
  }
}
