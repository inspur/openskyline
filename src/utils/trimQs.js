/**
 * 去掉 query string
 * @param  {String} url
 * @return {String}
 */
export default function trimQs (url) {
  return url ? url.split('?')[0] : '';
}
