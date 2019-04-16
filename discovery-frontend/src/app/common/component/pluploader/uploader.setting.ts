import * as _ from 'lodash';

export class UploaderSetting {
  private _browseButton: string;
  private _chunkSize: number | string;
  private _container: string;
  private _dropElement: string;
  private _fileDataName: string;
  private _filters: uploaderFilters;
  private _flashSwfUrl: string;
  private _headers: object;
  private _httpMethod: 'POST' | 'PUT';
  private _maxRetries: number;
  private _multipart: boolean;
  private _multipartParams: object;
  private _multiSelection: boolean;
  private _requiredFeatures: string | object;
  private _resize: uploaderResize;
  private _runtimes: string;
  private _silverlightXapUrl: string;
  private _sendChunkNumber: boolean;
  private _sendFileName: boolean;
  private _url: string;
  private _uniqueNames: boolean;
  private _init;

  // TODO
  Init(value): UploaderSetting {
    this._init = value;
    return this;
  }
  get init() {
    return this._init;
  }

  /**
   * ID of the DOM element or DOM element itself to use as file dialog trigger
   * 파일 업로더 박스를 사용할 DOM 요소 또는 DOM 요소의 ID
   * @param {string} value
   * @return {UploaderSetting}
   * @constructor
   */
  BrowseButton(value: string): UploaderSetting {
    this._browseButton = value;
    return this;
  }
  get browseButton() {
    return this._browseButton;
  }

  /**
   * Chunk size in bytes to slice the file into. Shorcuts with b, kb, mb, gb, tb suffixes also supported. (default: disabled)
   * 파일을 잘라 넣을 청크 크기(바이트). b, kb, mb, gb, tb 접미사가 있는 쇼커트도 지원된다 (기본값: 사용안함)
   * e.g. 204800 or "204800b" or "200kb"
   * @param {number | string} value
   * @return {UploaderSetting}
   * @constructor
   */
  ChunkSize(value: number | string): UploaderSetting {
    this._chunkSize = value;
    return this;
  }
  get chunkSize() {
    return this._chunkSize;
  }

  /**
   * id of the DOM element or DOM element itself that will be used to wrap uploader structures. Defaults to immediate parent of the browse_button element
   * 업로더 구조에 사용될 DOM 요소 또는 DOM 요소 자체의 ID. Browse_button 요소의 상위
   * @param {string} value
   * @return {UploaderSetting}
   * @constructor
   */
  Container(value: string): UploaderSetting {
    this._container = value;
    return this;
  }
  get container() {
    return this._container;
  }

  /**
   * id of the DOM element or DOM element itself to use as a drop zone for Drag-n-Drop
   * Drag drop 시 업로더 활성화 영역으로 사용할 DOM 요소 또는 DOM 요소의 ID
   * @param {string} value
   * @return {UploaderSetting}
   * @constructor
   */
  DropElement(value: string): UploaderSetting {
    this._dropElement = value;
    return this;
  }
  get dropElement() {
    return this._dropElement;
  }

  /**
   * Name for the file field in Multipart formated message (default: file)
   * Multipart 형식 메시지의 파일 필드 이름 (기본값: file)
   * @param {string} value
   * @return {UploaderSetting}
   * @constructor
   */
  FileDataName(value: string): UploaderSetting {
    this._fileDataName = value;
    return this;
  }
  get fileDataName(): string {
    return this._fileDataName;
  }

  /**
   * Set of file type filters
   * @param {uploaderFilters} value
   * @return {UploaderSetting}
   * @constructor
   */
  Filters(value: uploaderFilters): UploaderSetting {
    this._filters = value;
    return this;
  }
  get filters(): uploaderFilters {
    return this._filters;
  }

  /**
   *
   * @param {object} value
   * @return {UploaderSetting}
   * @constructor
   */
  Headers(value: object): UploaderSetting {
    this._headers = value;
    return this;
  }
  get headers(): object {
    return this._headers;
  }

  /**
   * URL of the Flash swf
   * Flash swf의 URL
   * @param {string} value
   * @return {UploaderSetting}
   * @constructor
   */
  FlashSwfUrl(value: string): UploaderSetting {
    this._flashSwfUrl = value;
    return this;
  }
  get flashSwfUrl(): string {
    return this._flashSwfUrl;
  }

  /**
   * HTTP method to use during upload (only PUT or POST allowed) (default: POST)
   * 업로드하는 동안 사용할 API의 HTTP Method(PUT 또는 POST만 허용) (기본값: POST)
   * @param {"POST" | "PUT"} value
   * @return {UploaderSetting}
   * @constructor
   */
  HttpMethod(value: 'POST' | 'PUT'): UploaderSetting {
    this._httpMethod = value;
    return this;
  }
  get httpMethod(): string {
    return this._httpMethod;
  }

  /**
   * How many times to retry the chunk or file, before triggering Error event (default: 0)
   * 오류 이벤트를 수행하기 전에 chunk 또는 파일을 업로드를 재시도할 횟수 (기본값: 0)
   * @param {number} value
   * @return {UploaderSetting}
   * @constructor
   */
  MaxRetries(value: number): UploaderSetting {
    this._maxRetries = value;
    return this;
  }
  get maxRetries(): number {
    return this._maxRetries;
  }

  /**
   * Enable Multipart upload
   * Whether to send file and additional parameters as Multipart formated message (default: TRUE)
   * Multipart 형식의 메시지로 파일 및 추가 매개 변수 전송 여부 (기본값: TRUE)
   * @param {boolean} value
   * @return {UploaderSetting}
   * @constructor
   */
  Multipart(value: boolean): UploaderSetting {
    this._multipart = value;
    return this;
  }
  get multipart(): boolean {
    return this._multipart;
  }

  /**
   * Hash of key/value pairs to send with every file upload
   * Multipart 파일 업로드와 함께 보낼 key/value Object
   * @param {object} value
   * @return {UploaderSetting}
   * @constructor
   */
  MultipartParams(value: object): UploaderSetting {
    this._multipartParams = value;
    return this;
  }
  get multipartParams(): object {
    return this._multipartParams;
  }

  /**
   * Enable ability to select multiple files at once in file dialog (default: TRUE)
   * 파일 업로더 상자에서 한 번에 여러 파일을 선택할 수 있는 기능 사용 (기본값: TRUE)
   * @param {boolean} value
   * @return {UploaderSetting}
   * @constructor
   */
  MultiSelection(value: boolean): UploaderSetting {
    this._multiSelection = value;
    return this;
  }
  get multiSelection(): boolean {
    return this._multiSelection;
  }

  /**
   * Either comma-separated list or hash of required features that chosen runtime should absolutely possess
   * @param {string | object} value
   * @return {UploaderSetting}
   * @constructor
   */
  RequiredFeatures(value: string | object): UploaderSetting {
    this._requiredFeatures = value;
    return this;
  }
  get requiredFeatures(): string | object {
    return this._requiredFeatures;
  }

  /**
   * Enable resizng of images on client-side. Applies to image/jpeg and image/png only
   * 이미지 리사이징 사용시 적용
   * e.g. {width : 200, height : 200, quality : 90, crop: true}
   * @param {uploaderResize} value
   * @return {UploaderSetting}
   * @constructor
   */
  Resize(value: uploaderResize): UploaderSetting {
    this._resize = value;
    return this;
  }
  get resize(): uploaderResize {
    return this._resize;
  }

  /**
   * Comma separated list of runtimes, that Plupload will try in turn, moving to the next if previous fails (default: html5,flash,silverlight,html4)
   * Uploader 가능한 클라이언트 목록 (기본값: html5,flash,silverlight,html4)
   * @param {string} value
   * @return {UploaderSetting}
   * @constructor
   */
  Runtimes(value: string): UploaderSetting {
    this._runtimes = value;
    return this;
  }
  get runtimes(): string {
    return this._runtimes;
  }

  /**
   * URL of the Silverlight xap (default: TRUE)
   * Silverlight xap의 URL (기본값: TRUE)
   * @param {string} value
   * @return {UploaderSetting}
   * @constructor
   */
  SilverlightXapUrl(value: string): UploaderSetting {
    this._silverlightXapUrl = value;
    return this;
  }
  get silverlightXapUrl(): string {
    return this._silverlightXapUrl;
  }

  /**
   * Whether to send chunks and chunk numbers, or total and offset bytes (default: TRUE)
   * 청크 및 청크 번호 또는 총 및 오프셋 바이트를 보낼지 여부
   * @param {boolean} value
   * @return {UploaderSetting}585
   *
   * @constructor
   */
  SendChunkNumber(value: boolean): UploaderSetting {
    this._sendChunkNumber = value;
    return this;
  }
  get sendChunkNumber(): boolean {
    return this._sendChunkNumber;
  }

  /**
   * Whether to send file name as additional argument - 'name' (required for chunked uploads and some other cases where file name cannot be sent via normal ways) (default: TRUE)
   * 추가 인수로 파일 이름을 보낼지 여부 - '이름' (청크 업로드 및 일반적인 방법으로 파일 이름을 보낼 수 없는 일부 경우 필요) (기본값: TRUE)
   * @param {boolean} value
   * @return {UploaderSetting}
   * @constructor
   */
  SendFileName(value: boolean): UploaderSetting {
    this._sendFileName = value;
    return this;
  }
  get sendFileName(): boolean {
    return this._sendFileName;
  }

  /**
   * URL of the server-side upload handler
   * 파일을 업로드할 URL 주소
   * @param {string} value
   * @return {UploaderSetting}
   * @constructor
   */
  Url(value: string): UploaderSetting {
    this._browseButton = value;
    return this;
  }
  get url() {
    return this._url;
  }

  /**
   * If true will generate unique filenames for uploaded files (default: FALSE)
   * 이 옵션이 TRUE라면 업로드된 파일에 대한 고유한 파일 이름이 생성 (기본값: FALSE)
   * @param {boolean} value
   * @return {UploaderSetting}
   * @constructor
   */
  UniqueNames(value: boolean): UploaderSetting {
    this._uniqueNames = value;
    return this;
  }
  get uniqueNames(): boolean {
    return this._uniqueNames;
  }

  build(): uploaderSetting {
    return new uploaderSetting(this);
  }
}

export class uploaderSetting {
  private browse_button: string;
  private chunk_size: number | string;
  private container: string;
  private drop_element: string;
  private file_data_name: string;
  private filters: uploaderFilters;
  private flash_swf_url: string;
  private headers;
  private http_method: string;
  private max_retries: number;
  private multipart: boolean;
  private multipart_params;
  private multi_selection: boolean;
  private required_features: string | object;
  private resize: uploaderResize;
  private runtimes: string;
  private silverlight_xap_url: string;
  private send_chunk_number: boolean;
  private send_file_name: boolean;
  private url: string;
  private unique_names: boolean;
  private init;

  constructor(builder: UploaderSetting) {
    if (!_.isNil(builder.browseButton)) {
      this.browse_button = builder.browseButton;
    }
    if (!_.isNil(builder.chunkSize)) {
      this.chunk_size = builder.chunkSize;
    }
    if (!_.isNil(builder.container)) {
      this.container = builder.container;
    }
    if (!_.isNil(builder.dropElement)) {
      this.drop_element = builder.dropElement;
    }
    if (!_.isNil(builder.fileDataName)) {
      this.file_data_name = builder.fileDataName;
    }
    if (!_.isNil(builder.filters)) {
      this.filters = builder.filters;
    }
    if (!_.isNil(builder.flashSwfUrl)) {
      this.flash_swf_url = builder.flashSwfUrl;
    }
    if (!_.isNil(builder.headers)) {
      this.headers = builder.headers;
    }
    if (!_.isNil(builder.httpMethod)) {
      this.http_method = builder.httpMethod;
    }
    if (!_.isNil(builder.maxRetries)) {
      this.max_retries = builder.maxRetries;
    }
    if (!_.isNil(builder.multipart)) {
      this.multipart = builder.multipart;
    }
    if (!_.isNil(builder.multipartParams)) {
      this.multipart_params = builder.multipartParams;
    }
    if (!_.isNil(builder.multiSelection)) {
      this.multi_selection = builder.multiSelection;
    }
    if (!_.isNil(builder.requiredFeatures)) {
      this.required_features = builder.requiredFeatures;
    }
    if (!_.isNil(builder.resize)) {
      this.resize = builder.resize;
    }
    if (!_.isNil(builder.runtimes)) {
      this.runtimes = builder.runtimes;
    }
    if (!_.isNil(builder.silverlightXapUrl)) {
      this.silverlight_xap_url = builder.silverlightXapUrl;
    }
    if (!_.isNil(builder.sendChunkNumber)) {
      this.send_chunk_number = builder.sendChunkNumber;
    }
    if (!_.isNil(builder.sendFileName)) {
      this.send_file_name = builder.sendFileName;
    }
    if (!_.isNil(builder.url)) {
      this.url = builder.url;
    }
    if (!_.isNil(builder.uniqueNames)) {
      this.unique_names = builder.uniqueNames;
    }
    if (!_.isNil(builder.init)) {
      this.init = builder.init;
    }
  }
}

// Enable resizng of images on client-side. Applies to image/jpeg and image/png only
export class uploaderResize {
  // If image is bigger, it will be resized
  width: number;
  // If image is bigger, it will be resized
  height: number;
  // Compression quality for jpegs (1-100)
  quality: number = 90;
  // Whether to crop images to exact dimensions. By default they will be resized proportionally
  crop: boolean = false;
}

// Set of file type filters
export class uploaderFilters {
  // Maximum file size that the user can pick, in bytes. Optionally supports b, kb, mb, gb, tb suffixes
  max_file_size: number | string = 0;
  // List of file types to accept, each one defined by title and list of extensions
  // e.g. {title : "Image files", extensions : "jpg,jpeg,gif,png"}
  mime_types = [];
  // Do not let duplicates into the queue
  prevent_duplicates: boolean = false;
}
