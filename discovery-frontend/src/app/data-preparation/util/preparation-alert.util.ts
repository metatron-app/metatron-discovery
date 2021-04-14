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

import {isUndefined} from 'util';
import {Alert} from '@common/util/alert.util';

export class PreparationException {
  public code: string;
  public details: string;
  public message: string;

  public getErrMsg() {
    let errMsg = null;

    if (false === isUndefined(this.details)) {
      errMsg = this.details;
    }
    if (errMsg == null && false === isUndefined(this.message)) {
      errMsg = this.message;
    }

    return errMsg;
  }
}

export class PreparationAlert {

  private static getMessage(error: any): string {

    let message = null;

    if (null === error) {
      message = null;
    } else if ('string' === typeof error) {
      message = error;
    } else if ('object' === typeof error) {
      if (error.details) {
        message = error.details;
      } else if (error.message) {
        message = error.message;
      } else {
        message = JSON.stringify(error);
      }
    }

    return message;
  }

  public static info(error: any): void {
    const message = this.getMessage(error);
    if (null !== message) {
      Alert.info(message);
    }
  }

  public static success(error: any): void {
    const message = this.getMessage(error);
    if (null !== message) {
      Alert.success(message);
    }
  }

  public static warning(error: any): void {
    const message = this.getMessage(error);
    if (null !== message) {
      Alert.warning(message);
    }
    if (null != error) {
      console.warn(error);
    }
  }

  public static error(error: any): void {
    const message = this.getMessage(error);
    if (null !== message) {
      Alert.error(message);
    }
    if (null != error) {
      console.error(error);
    }
  }

  public static output(error: any, message?: any): void {
    if (error.code && true === error.code.startsWith('PR')) {
      const category = error.code.charAt(2);
      const details = error.details;
      switch (category) {
        case '0':
          Alert.success(details ? details : message);
          break;
        case '1':
          Alert.warning(details ? details : message);
          break;
        case '5':
        case '6':
        case '7':
        default:
          if (!isUndefined(details)) {
            Alert.errorDetail(message, details);
          } else {
            Alert.error(message);
          }
          break;
      }
    } else {
      console.error(error);
      if (!isUndefined(error.details)) {
        Alert.errorDetail(message, error.details);
      } else {
        Alert.error(message);
      }
    }
  }
}
