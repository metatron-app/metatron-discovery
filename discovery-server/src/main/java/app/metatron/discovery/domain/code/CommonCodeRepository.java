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

package app.metatron.discovery.domain.code;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;

/**
 * @date        : 2016.04.22
 * @description : CommonCodeRepository
 * @author      : lKJ
 */
@RepositoryRestResource(path = "commoncodes")
public interface CommonCodeRepository extends JpaRepository<CommonCode, String>{
    /**
     * CategoryCode 로 코드 전체 리스트 찾기
     * @param CategoryCode
     * @return
     */
    @RestResource(path = "categorycode", rel = "findByCategoryCode")
    List<CommonCode> findByCategoryCode(@Param("CategoryCode") String CategoryCode);

    /**
     * CategoryCode 로 코드 전체 리스트 찾기
     * @param CategoryCode
     * @return
     */
    @RestResource(path = "code", rel = "findByCategoryCodeAndCommonCode")
    List<CommonCode>  findByCategoryCodeAndCommonCode(@Param("CategoryCode") String CategoryCode, @Param("CommonCode") String CommonCode);
}

