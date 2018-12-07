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

package app.metatron.discovery.domain.dataprep.repository;

import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.hibernate.Hibernate;
import org.hibernate.proxy.HibernateProxy;
import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.FullTextQuery;
import org.hibernate.search.jpa.Search;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import javax.persistence.EntityManager;

public class PrDatasetRepositoryImpl implements PrDatasetRepositoryCustom {

    @Autowired
    private EntityManager entityManager;

    public PrDatasetRepositoryImpl() {
    }

    @Override
    public Page<PrDataset> searchByQuery(String query, Pageable pageable) {
        final FullTextEntityManager fullTextEntityManager = Search.getFullTextEntityManager(entityManager);

        FullTextQuery fullTextQuery;
        try {
            final QueryParser queryParser = new QueryParser("content", fullTextEntityManager.getSearchFactory().getAnalyzer(PrDataset.class));
            fullTextQuery = fullTextEntityManager.createFullTextQuery(queryParser.parse(query), PrDataset.class);

        } catch (ParseException e) {
            e.printStackTrace();
            throw new RuntimeException("Fail to search query : " + e.getMessage());
        }

        fullTextQuery.setFirstResult(pageable.getOffset());
        fullTextQuery.setMaxResults(pageable.getPageSize());

        return new PageImpl<>(fullTextQuery.getResultList(), pageable, fullTextQuery.getResultSize());
    }

    @Override
    public PrDataset findRealOne(PrDataset lazyOne) {
        PrDataset realOne = null;
        Hibernate.initialize(lazyOne);
        if (lazyOne instanceof HibernateProxy) {
            realOne = (PrDataset) ((HibernateProxy) lazyOne).getHibernateLazyInitializer().getImplementation();
        }
        if( realOne == null ) {
            return lazyOne;
        }
        return realOne;
    }
}
