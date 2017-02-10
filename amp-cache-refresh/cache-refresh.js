/**
 * Copyright 2015-2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
const jsrsasign = require('jsrsasign');
const url = require('url');

class CacheRefresh {
  constructor(privateKey) {
    this._privateKey = privateKey;
    this._sig = new jsrsasign.Signature({'alg': 'SHA256withRSA'});
    this._sig.init(this._privateKey);    
  }

  createRefreshUrl(cacheUrl) {
    const parsedUrl = url.parse(cacheUrl);
    // API accepts timestamp as a UNIX Epoch in seconds.
    const timestamp = (Date.now() / 1000) | 0;

    // Create the Cache Refresh URL to be signed.
    const refreshPath = 
        parsedUrl.path + (parsedUrl.query ? '&':'?') + 'amp_action=refresh&amp_ts=' + timestamp;        
    const signature = this._createSignature(refreshPath);

    // Append the signature o the Cache Refresh Url.
    const signedRefreshPath = refreshPath + '&amp_url_signature=' + signature;
    return url.resolve(parsedUrl, signedRefreshPath);
  };

  _createSignature(url) {
    const signed = this._sig.signString(url);
    // Signature is returned as hex. Convert to Base64Url.
    const base64UrlSigned = jsrsasign.hextob64u(signed);
    return base64UrlSigned;
  }  
}

module.exports = CacheRefresh;