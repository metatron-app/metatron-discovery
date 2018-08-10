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

import com.google.common.collect.Maps;

import org.infinispan.spring.provider.SpringEmbeddedCacheManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Created by kyungtaak on 2017. 3. 14..
 */
@RestController
@RequestMapping("/api/admin")
public class CacheAdminController {

  @Autowired
  CacheManager cacheManager;

  @RequestMapping(value = "/caches", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> getAllCacheNames() {

    return ResponseEntity.ok(cacheManager.getCacheNames());
  }

  @RequestMapping(value = "/caches/status", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> getCacheStatus() {

    return ResponseEntity.ok(((SpringEmbeddedCacheManager) cacheManager).getNativeCacheManager().getStats());
  }

  @RequestMapping(value = "/caches/{cacheName}", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> getAllCacheData(@PathVariable("cacheName") String cacheName) {

    Cache cache = cacheManager.getCache(cacheName);
    if(cache == null) {
      throw new ResourceNotFoundException("Cache( " + cacheName + " ) not found.");
    }

    Map<String, Object> entries = Maps.newHashMap();
    ((SpringEmbeddedCacheManager) cacheManager).getCache(cacheName).getNativeCache().forEach(
        (o, o2) -> entries.put(String.valueOf(o), o2)
    );

    return ResponseEntity.ok(entries);
  }

}
