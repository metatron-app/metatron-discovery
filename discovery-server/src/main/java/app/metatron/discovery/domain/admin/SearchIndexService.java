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

import com.google.common.collect.Lists;

import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.Search;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.role.Role;

/**
 * Created by kyungtaak on 2017. 2. 2..
 */
@Component
public class SearchIndexService {

  private static Logger LOGGER = LoggerFactory.getLogger(SearchIndexService.class);

  public static Integer DEFAULT_BATCH_INDEX_SIZE = 25;

  public static List<Class<?>> INDEX_DOMAIN_CLASSES = Lists.newArrayList(DataSource.class, User.class, Role.class);

  @PersistenceContext
  private EntityManager entityManager;

  @Async
  public void reindexAll(int batchSize) {
    LOGGER.info("Start creating search index.");

    if(batchSize <= 0) {
      batchSize = DEFAULT_BATCH_INDEX_SIZE;
    }

    try {
      FullTextEntityManager fullTextEntityManager = Search.getFullTextEntityManager(entityManager);
      fullTextEntityManager.createIndexer(INDEX_DOMAIN_CLASSES.toArray(new Class[0]))
          .typesToIndexInParallel(INDEX_DOMAIN_CLASSES.size())
          .batchSizeToLoadObjects(batchSize)
          .threadsToLoadObjects(5)
          .idFetchSize(150)
          .startAndWait();
      LOGGER.info("Successfully created search index.");
    } catch (InterruptedException e) {
      LOGGER.warn("An error occurred trying to build the search index: {}", e.toString());
    }
  }
}
