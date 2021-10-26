"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renameEntry = exports.deleteEntry = exports.registerEntry = void 0;

var _reduxActions = require("redux-actions");

var _actionTypes = _interopRequireDefault(require("../constants/action-types"));

// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 *
 * Add a new kepler.gl instance in `keplerGlReducer`. This action is called under-the-hood when a `KeplerGl` component is **mounted** to the dom.
 * Note that if you dispatch actions such as adding data to a kepler.gl instance before the React component is mounted, the action will not be
 * performed. Instance reducer can only handle actions when it is instantiated.
 * @memberof rootActions
 * @param payload
 * @param payload.id - ***required** The id of the instance
 * @param payload.mint - Whether to use a fresh empty state, when `mint: true` it will *always* load a fresh state when the component is re-mounted.
 * When `mint: false` it will register with existing instance state under the same `id`, when the component is unmounted then mounted again. Default: `true`
 * @param payload.mapboxApiAccessToken - mapboxApiAccessToken to be saved in `map-style` reducer.
 * @param payload.mapboxApiUrl - mapboxApiUrl to be saved in `map-style` reducer.
 * @param payload.mapStylesReplaceDefault - mapStylesReplaceDefault to be saved in `map-style` reducer.
 * @param payload.initialUiState - initial ui state
 * @type {typeof import('./identity-actions').registerEntry}
 * @public
 */
var registerEntry = (0, _reduxActions.createAction)(_actionTypes["default"].REGISTER_ENTRY, function (payload) {
  return payload;
});
/**
 *
 * Delete an instance from `keplerGlReducer`. This action is called under-the-hood when a `KeplerGl` component is **un-mounted** to the dom.
 * If `mint` is set to be `true` in the component prop, the instance state will be deleted from the root reducer. Otherwise, the root reducer will keep
 * the instance state and later transfer it to a newly mounted component with the same `id`
 * @memberof rootActions
 * @param {string} id - the id of the instance to be deleted
 * @public
 */

exports.registerEntry = registerEntry;
var deleteEntry = (0, _reduxActions.createAction)(_actionTypes["default"].DELETE_ENTRY, function (id) {
  return id;
});
/**
 *
 * Rename an instance in the root reducer, keep its entire state
 *
 * @memberof rootActions
 * @param {string} oldId - ***required** old id
 * @param {string} newId - ***required** new id
 * @public
 */

exports.deleteEntry = deleteEntry;
var renameEntry = (0, _reduxActions.createAction)(_actionTypes["default"].RENAME_ENTRY, function (oldId, newId) {
  return {
    oldId: oldId,
    newId: newId
  };
});
/**
 * This declaration is needed to group actions in docs
 */

/**
 * Root actions managers adding and removing instances in root reducer.
 * Under-the-hood, when a `KeplerGl` component is mounted or unmounted,
 * it will automatically calls these actions to add itself to the root reducer.
 * However, sometimes the data is ready before the component is registered in the reducer,
 * in this case, you can manually call these actions or the corresponding updater to add it to the reducer.
 *
 * @public
 */

/* eslint-disable no-unused-vars */
// @ts-ignore

exports.renameEntry = renameEntry;
var rootActions = null;
/* eslint-enable no-unused-vars */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hY3Rpb25zL2lkZW50aXR5LWFjdGlvbnMuanMiXSwibmFtZXMiOlsicmVnaXN0ZXJFbnRyeSIsIkFjdGlvblR5cGVzIiwiUkVHSVNURVJfRU5UUlkiLCJwYXlsb2FkIiwiZGVsZXRlRW50cnkiLCJERUxFVEVfRU5UUlkiLCJpZCIsInJlbmFtZUVudHJ5IiwiUkVOQU1FX0VOVFJZIiwib2xkSWQiLCJuZXdJZCIsInJvb3RBY3Rpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUtBOzs7Ozs7Ozs7Ozs7Ozs7OztBQWlCTyxJQUFNQSxhQUFhLEdBQUcsZ0NBQWFDLHdCQUFZQyxjQUF6QixFQUF5QyxVQUFBQyxPQUFPO0FBQUEsU0FBSUEsT0FBSjtBQUFBLENBQWhELENBQXRCO0FBRVA7Ozs7Ozs7Ozs7O0FBU08sSUFBTUMsV0FBVyxHQUFHLGdDQUFhSCx3QkFBWUksWUFBekIsRUFBdUMsVUFBQUMsRUFBRTtBQUFBLFNBQUlBLEVBQUo7QUFBQSxDQUF6QyxDQUFwQjtBQUVQOzs7Ozs7Ozs7OztBQVNPLElBQU1DLFdBQVcsR0FBRyxnQ0FBYU4sd0JBQVlPLFlBQXpCLEVBQXVDLFVBQUNDLEtBQUQsRUFBUUMsS0FBUjtBQUFBLFNBQW1CO0FBQ25GRCxJQUFBQSxLQUFLLEVBQUxBLEtBRG1GO0FBRW5GQyxJQUFBQSxLQUFLLEVBQUxBO0FBRm1GLEdBQW5CO0FBQUEsQ0FBdkMsQ0FBcEI7QUFLUDs7OztBQUdBOzs7Ozs7Ozs7O0FBU0E7QUFDQTs7O0FBQ0EsSUFBTUMsV0FBVyxHQUFHLElBQXBCO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMjAgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge2NyZWF0ZUFjdGlvbn0gZnJvbSAncmVkdXgtYWN0aW9ucyc7XG5pbXBvcnQgQWN0aW9uVHlwZXMgZnJvbSAnY29uc3RhbnRzL2FjdGlvbi10eXBlcyc7XG5cbi8qKlxuICpcbiAqIEFkZCBhIG5ldyBrZXBsZXIuZ2wgaW5zdGFuY2UgaW4gYGtlcGxlckdsUmVkdWNlcmAuIFRoaXMgYWN0aW9uIGlzIGNhbGxlZCB1bmRlci10aGUtaG9vZCB3aGVuIGEgYEtlcGxlckdsYCBjb21wb25lbnQgaXMgKiptb3VudGVkKiogdG8gdGhlIGRvbS5cbiAqIE5vdGUgdGhhdCBpZiB5b3UgZGlzcGF0Y2ggYWN0aW9ucyBzdWNoIGFzIGFkZGluZyBkYXRhIHRvIGEga2VwbGVyLmdsIGluc3RhbmNlIGJlZm9yZSB0aGUgUmVhY3QgY29tcG9uZW50IGlzIG1vdW50ZWQsIHRoZSBhY3Rpb24gd2lsbCBub3QgYmVcbiAqIHBlcmZvcm1lZC4gSW5zdGFuY2UgcmVkdWNlciBjYW4gb25seSBoYW5kbGUgYWN0aW9ucyB3aGVuIGl0IGlzIGluc3RhbnRpYXRlZC5cbiAqIEBtZW1iZXJvZiByb290QWN0aW9uc1xuICogQHBhcmFtIHBheWxvYWRcbiAqIEBwYXJhbSBwYXlsb2FkLmlkIC0gKioqcmVxdWlyZWQqKiBUaGUgaWQgb2YgdGhlIGluc3RhbmNlXG4gKiBAcGFyYW0gcGF5bG9hZC5taW50IC0gV2hldGhlciB0byB1c2UgYSBmcmVzaCBlbXB0eSBzdGF0ZSwgd2hlbiBgbWludDogdHJ1ZWAgaXQgd2lsbCAqYWx3YXlzKiBsb2FkIGEgZnJlc2ggc3RhdGUgd2hlbiB0aGUgY29tcG9uZW50IGlzIHJlLW1vdW50ZWQuXG4gKiBXaGVuIGBtaW50OiBmYWxzZWAgaXQgd2lsbCByZWdpc3RlciB3aXRoIGV4aXN0aW5nIGluc3RhbmNlIHN0YXRlIHVuZGVyIHRoZSBzYW1lIGBpZGAsIHdoZW4gdGhlIGNvbXBvbmVudCBpcyB1bm1vdW50ZWQgdGhlbiBtb3VudGVkIGFnYWluLiBEZWZhdWx0OiBgdHJ1ZWBcbiAqIEBwYXJhbSBwYXlsb2FkLm1hcGJveEFwaUFjY2Vzc1Rva2VuIC0gbWFwYm94QXBpQWNjZXNzVG9rZW4gdG8gYmUgc2F2ZWQgaW4gYG1hcC1zdHlsZWAgcmVkdWNlci5cbiAqIEBwYXJhbSBwYXlsb2FkLm1hcGJveEFwaVVybCAtIG1hcGJveEFwaVVybCB0byBiZSBzYXZlZCBpbiBgbWFwLXN0eWxlYCByZWR1Y2VyLlxuICogQHBhcmFtIHBheWxvYWQubWFwU3R5bGVzUmVwbGFjZURlZmF1bHQgLSBtYXBTdHlsZXNSZXBsYWNlRGVmYXVsdCB0byBiZSBzYXZlZCBpbiBgbWFwLXN0eWxlYCByZWR1Y2VyLlxuICogQHBhcmFtIHBheWxvYWQuaW5pdGlhbFVpU3RhdGUgLSBpbml0aWFsIHVpIHN0YXRlXG4gKiBAdHlwZSB7dHlwZW9mIGltcG9ydCgnLi9pZGVudGl0eS1hY3Rpb25zJykucmVnaXN0ZXJFbnRyeX1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyRW50cnkgPSBjcmVhdGVBY3Rpb24oQWN0aW9uVHlwZXMuUkVHSVNURVJfRU5UUlksIHBheWxvYWQgPT4gcGF5bG9hZCk7XG5cbi8qKlxuICpcbiAqIERlbGV0ZSBhbiBpbnN0YW5jZSBmcm9tIGBrZXBsZXJHbFJlZHVjZXJgLiBUaGlzIGFjdGlvbiBpcyBjYWxsZWQgdW5kZXItdGhlLWhvb2Qgd2hlbiBhIGBLZXBsZXJHbGAgY29tcG9uZW50IGlzICoqdW4tbW91bnRlZCoqIHRvIHRoZSBkb20uXG4gKiBJZiBgbWludGAgaXMgc2V0IHRvIGJlIGB0cnVlYCBpbiB0aGUgY29tcG9uZW50IHByb3AsIHRoZSBpbnN0YW5jZSBzdGF0ZSB3aWxsIGJlIGRlbGV0ZWQgZnJvbSB0aGUgcm9vdCByZWR1Y2VyLiBPdGhlcndpc2UsIHRoZSByb290IHJlZHVjZXIgd2lsbCBrZWVwXG4gKiB0aGUgaW5zdGFuY2Ugc3RhdGUgYW5kIGxhdGVyIHRyYW5zZmVyIGl0IHRvIGEgbmV3bHkgbW91bnRlZCBjb21wb25lbnQgd2l0aCB0aGUgc2FtZSBgaWRgXG4gKiBAbWVtYmVyb2Ygcm9vdEFjdGlvbnNcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIHRoZSBpZCBvZiB0aGUgaW5zdGFuY2UgdG8gYmUgZGVsZXRlZFxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgZGVsZXRlRW50cnkgPSBjcmVhdGVBY3Rpb24oQWN0aW9uVHlwZXMuREVMRVRFX0VOVFJZLCBpZCA9PiBpZCk7XG5cbi8qKlxuICpcbiAqIFJlbmFtZSBhbiBpbnN0YW5jZSBpbiB0aGUgcm9vdCByZWR1Y2VyLCBrZWVwIGl0cyBlbnRpcmUgc3RhdGVcbiAqXG4gKiBAbWVtYmVyb2Ygcm9vdEFjdGlvbnNcbiAqIEBwYXJhbSB7c3RyaW5nfSBvbGRJZCAtICoqKnJlcXVpcmVkKiogb2xkIGlkXG4gKiBAcGFyYW0ge3N0cmluZ30gbmV3SWQgLSAqKipyZXF1aXJlZCoqIG5ldyBpZFxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgcmVuYW1lRW50cnkgPSBjcmVhdGVBY3Rpb24oQWN0aW9uVHlwZXMuUkVOQU1FX0VOVFJZLCAob2xkSWQsIG5ld0lkKSA9PiAoe1xuICBvbGRJZCxcbiAgbmV3SWRcbn0pKTtcblxuLyoqXG4gKiBUaGlzIGRlY2xhcmF0aW9uIGlzIG5lZWRlZCB0byBncm91cCBhY3Rpb25zIGluIGRvY3NcbiAqL1xuLyoqXG4gKiBSb290IGFjdGlvbnMgbWFuYWdlcnMgYWRkaW5nIGFuZCByZW1vdmluZyBpbnN0YW5jZXMgaW4gcm9vdCByZWR1Y2VyLlxuICogVW5kZXItdGhlLWhvb2QsIHdoZW4gYSBgS2VwbGVyR2xgIGNvbXBvbmVudCBpcyBtb3VudGVkIG9yIHVubW91bnRlZCxcbiAqIGl0IHdpbGwgYXV0b21hdGljYWxseSBjYWxscyB0aGVzZSBhY3Rpb25zIHRvIGFkZCBpdHNlbGYgdG8gdGhlIHJvb3QgcmVkdWNlci5cbiAqIEhvd2V2ZXIsIHNvbWV0aW1lcyB0aGUgZGF0YSBpcyByZWFkeSBiZWZvcmUgdGhlIGNvbXBvbmVudCBpcyByZWdpc3RlcmVkIGluIHRoZSByZWR1Y2VyLFxuICogaW4gdGhpcyBjYXNlLCB5b3UgY2FuIG1hbnVhbGx5IGNhbGwgdGhlc2UgYWN0aW9ucyBvciB0aGUgY29ycmVzcG9uZGluZyB1cGRhdGVyIHRvIGFkZCBpdCB0byB0aGUgcmVkdWNlci5cbiAqXG4gKiBAcHVibGljXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4vLyBAdHMtaWdub3JlXG5jb25zdCByb290QWN0aW9ucyA9IG51bGw7XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG4iXX0=