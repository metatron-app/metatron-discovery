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

package app.metatron.discovery.domain.images;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.List;

import app.metatron.discovery.common.exception.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class ImageService {

  private static final Logger LOGGER = LoggerFactory.getLogger(ImageService.class);

  @Autowired
  ImageRepository imageRepository;

  /**
   * 내부적으로 정의된 metatron Images URL 을 통해 Image 객체를 로드힙니다.
   *
   * @param url
   * @return
   */
  public Image loadImageByImageUrl(String url) {

    // URL Sample : metatron://images/{domain}/{itemId}/thumbnail
    URI uri = null;
    try {
      uri = URI.create(url);
    } catch (IllegalArgumentException e) {
      LOGGER.error("Invalid url - schema : {}", url);
      throw new IllegalArgumentException("Invalid url - schema");
    }

    if(!"images".equals(uri.getHost())) {
      LOGGER.error("Invalid url - images(host) : {}", url);
      throw new IllegalArgumentException("Invalid url - images(host)");
    }

    String[] values = StringUtils.split(uri.getPath(), "/");
    int length = values.length;
    if(length < 2 && length > 3) {
      LOGGER.error("Invalid url - type of images : {}", url);
      throw new IllegalArgumentException("Invalid url - type of images");
    }

    Image image = imageRepository.findByDomainAndItemIdAndEnabled(values[0], values[1], true);
    if(image == null) {
      LOGGER.error("Image resource not found. : {}", url);
      throw  new ResourceNotFoundException(url);
    }

    return image;
  }

  @Transactional
  public Image copyByUrl(String targetDomainId, String url) {

    Image image = null;
    try {
      image = loadImageByImageUrl(url);
    } catch (Exception e) {
      LOGGER.warn("Fail to copy image entity. Caused by " + e.getMessage());
      return null;
    }

    Image copiedImage = image.copyOf();
    if(StringUtils.isNotEmpty(targetDomainId)) {
      copiedImage.setItemId(targetDomainId);
    }

    return imageRepository.save(copiedImage);
  }

  public void deleteImage(String domain, String id) {

    List<Image> targetImages = imageRepository.findByDomainAndItemIdOrderByModifiedTimeDesc(domain, id);

    if(CollectionUtils.isEmpty(targetImages)) {
      return;
    }

    imageRepository.delete(targetImages);
  }
}
