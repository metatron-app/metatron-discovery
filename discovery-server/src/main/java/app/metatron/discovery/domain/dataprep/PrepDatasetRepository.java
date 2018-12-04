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

package app.metatron.discovery.domain.dataprep;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "preparationdatasets", itemResourceRel = "preparationdataset" , collectionResourceRel = "preparationdatasets",
        excerptProjection = PrepDatasetProjections.DefaultProjection.class)
public interface PrepDatasetRepository extends JpaRepository<PrepDataset, String>,PrepDatasetRepositoryCustom {

    /*
    @RestResource(path = "preparationdatasets", rel = "findByDsIds")
    @Query("SELECT pd FROM PrepDataset pd WHERE pd.dsId IN (:ds_ids)")
    List<PrepDataset> findByDsIds(@Param("ds_ids") List<String> dsIds);
    */

    //List<PrepDataset> findByDsType(@Param("dsType") PrepDataset.DS_TYPE dsType);

    //Page<PrepDataset> findByDsNameContainingAndImportType(@Param("dsName") String dsName, @Param("importType") PrepDataset.IMPORT_TYPE importType, Pageable pageable);

    Page<PrepDataset> findByDsNameContaining(@Param("dsName") String dsName, Pageable pageable);

    Page<PrepDataset> findByDsNameContainingAndDsType(@Param("dsName") String dsName, @Param("dsType") PrepDataset.DS_TYPE dsType, Pageable pageable);

    Page<PrepDataset> findByDsNameContainingAndImportTypeAndDsType(@Param("dsName") String dsName, @Param("importType") PrepDataset.IMPORT_TYPE importType, @Param("dsType") PrepDataset.DS_TYPE dsType, Pageable pageable);

    @Query("SELECT pd FROM PrepDataset pd LEFT JOIN pd.dataflows df WHERE (''=:dsName OR UPPER(pd.dsName) LIKE UPPER(CONCAT('%',:dsName, '%'))) AND pd.dsType=:dsType GROUP BY pd.dsId ORDER BY count(df.dfId)")
    Page<PrepDataset> findByDsNameContainingAndDsTypeOrderByRefDfCountAsc(@Param("dsName") String dsName, @Param("dsType") PrepDataset.DS_TYPE dsType, Pageable pageable);

    @Query("SELECT pd FROM PrepDataset pd LEFT JOIN pd.dataflows df WHERE (''=:dsName OR UPPER(pd.dsName) LIKE UPPER(CONCAT('%',:dsName, '%'))) AND pd.dsType=:dsType GROUP BY pd.dsId ORDER BY count(df.dfId) DESC")
    Page<PrepDataset> findByDsNameContainingAndDsTypeOrderByRefDfCountDesc(@Param("dsName") String dsName, @Param("dsType") PrepDataset.DS_TYPE dsType, Pageable pageable);

    @Query("SELECT pd FROM PrepDataset pd LEFT JOIN pd.dataflows df WHERE (''=:dsName OR UPPER(pd.dsName) LIKE UPPER(CONCAT('%',:dsName, '%'))) GROUP BY pd.dsId ORDER BY count(df.dfId)")
    Page<PrepDataset> findByDsNameContainingOrderByRefDfCountAsc(@Param("dsName") String dsName, Pageable pageable);

    @Query("SELECT pd FROM PrepDataset pd LEFT JOIN pd.dataflows df WHERE (''=:dsName OR UPPER(pd.dsName) LIKE UPPER(CONCAT('%',:dsName, '%'))) GROUP BY pd.dsId ORDER BY count(df.dfId) DESC")
    Page<PrepDataset> findByDsNameContainingOrderByRefDfCountDesc(@Param("dsName") String dsName, Pageable pageable);
}
