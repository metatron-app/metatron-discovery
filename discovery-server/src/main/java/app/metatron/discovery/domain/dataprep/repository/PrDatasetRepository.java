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
import app.metatron.discovery.domain.dataprep.entity.PrDatasetProjections;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "preparationdatasets", itemResourceRel = "preparationdataset" , collectionResourceRel = "preparationdatasets"
                          , excerptProjection = PrDatasetProjections.DefaultProjection.class)
public interface PrDatasetRepository extends JpaRepository<PrDataset, String>,PrDatasetRepositoryCustom {

    /*
    @RestResource(path = "preparationdatasets", rel = "findByDsIds")
    @Query("SELECT pd FROM PrDataset pd WHERE pd.dsId IN (:ds_ids)")
    List<PrDataset> findByDsIds(@Param("ds_ids") List<String> dsIds);
    */

    //List<PrDataset> findByDsType(@Param("dsType") PrDataset.DS_TYPE dsType);

    //Page<PrDataset> findByDsNameContainingAndImportType(@Param("dsName") String dsName, @Param("importType") PrDataset.IMPORT_TYPE importType, Pageable pageable);

    List<PrDataset> findByDsName(String dsName);

    Page<PrDataset> findByDsNameContaining(@Param("dsName") String dsName, Pageable pageable);

    Page<PrDataset> findByDsNameContainingAndDsType(@Param("dsName") String dsName, @Param("dsType") PrDataset.DS_TYPE dsType, Pageable pageable);

    Page<PrDataset> findByDsNameContainingAndImportTypeAndDsType(@Param("dsName") String dsName, @Param("importType") PrDataset.IMPORT_TYPE importType, @Param("dsType") PrDataset.DS_TYPE dsType, Pageable pageable);

    @Query("SELECT pd FROM PrDataset pd LEFT JOIN pd.dataflows df WHERE (''=:dsName OR pd.dsName=:dsName) AND pd.dsType=:dsType GROUP BY pd.dsId ORDER BY count(df.dfId)")
    Page<PrDataset> findByDsNameContainingAndDsTypeOrderByRefDfCountAsc(@Param("dsName") String dsName, @Param("dsType") PrDataset.DS_TYPE dsType, Pageable pageable);

    @Query("SELECT pd FROM PrDataset pd LEFT JOIN pd.dataflows df WHERE (''=:dsName OR pd.dsName=:dsName) AND pd.dsType=:dsType GROUP BY pd.dsId ORDER BY count(df.dfId) DESC")
    Page<PrDataset> findByDsNameContainingAndDsTypeOrderByRefDfCountDesc(@Param("dsName") String dsName, @Param("dsType") PrDataset.DS_TYPE dsType, Pageable pageable);

    @Query("SELECT pd FROM PrDataset pd LEFT JOIN pd.dataflows df WHERE (''=:dsName OR pd.dsName=:dsName) GROUP BY pd.dsId ORDER BY count(df.dfId)")
    Page<PrDataset> findByDsNameContainingOrderByRefDfCountAsc(@Param("dsName") String dsName, Pageable pageable);

    @Query("SELECT pd FROM PrDataset pd LEFT JOIN pd.dataflows df WHERE (''=:dsName OR pd.dsName=:dsName) GROUP BY pd.dsId ORDER BY count(df.dfId) DESC")
    Page<PrDataset> findByDsNameContainingOrderByRefDfCountDesc(@Param("dsName") String dsName, Pageable pageable);
}
