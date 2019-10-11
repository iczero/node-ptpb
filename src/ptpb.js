const got = require('got');
const FormData = require('form-data');
const yaml = require('js-yaml');

const DEFAULT_BASE_URL = 'https://pybin.pw';

class Api {
  /**
   * The constructor
   * @param {string} baseUrl Base url of the pb instance
   */
  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl;
    this.client = got.extend({
      throwHttpErrors: false
    });
  }

  /**
   * Internal method to upload content to a url
   * @param {string} method
   * @param {string} endpoint
   * @param {any} content
   * @param {object} [options] Additional options
   * @param {string} [options.fileName] File name to use in form
   * @param {string} [options.contentType] Content type for the content
   * @param {boolean} [options.private] Whether or not the paste should be private
   * @param {number} [options.sunset] Seconds until paste expires
   * @return {object}
   */
  async _uploadContent(method, endpoint, content, options = {}) {
    let form = new FormData();
    form.append('c', content, {
      filename: options.filename,
      contentType: options.contentType
    });
    if (options.private) form.append('p', 1);
    if (options.sunset) form.append('sunset', options.sunset);
    let response = await this.client(this.baseUrl + endpoint, {
      body: form,
      method
    });
    let parsed = yaml.safeLoad(response.body);
    return parsed;
  }

  /**
   * Create a paste
   * @param {any} content Content of the post, can be anything form-data accepts
   * @param {object} [options] Additional options
   * @param {string} [options.label] Optional label
   * @param {string} [options.fileName] File name to use in form
   * @param {string} [options.contentType] Content type for the content
   * @param {boolean} [options.private] Whether or not the paste should be private
   * @param {number} [options.sunset] Seconds until paste expires
   * @return {object}
   */
  async create(content, options) {
    let url = '/';
    if (options.label) url += '~' + options.label;
    return await this._uploadContent('POST', url, content, options);
  }

  /**
   * Get a paste
   * @param {string} id ID of paste to get
   * @return {Buffer}
   */
  async get(id) {
    let response = await this.client(this.baseUrl + '/' + id);
    return response.body;
  }

  /**
   * Update a paste
   * @param {string} uuid uuid of the paste
   * @param {any} content Content of the post, can be anything form-data accepts
   * @param {object} [options] Additional options
   * @param {string} [options.fileName] File name to use in form
   * @param {string} [options.contentType] Content type for the content
   * @param {boolean} [options.private] Whether or not the paste should be private
   * @param {number} [options.sunset] Seconds until paste expires
   * @return {object}
   */
  async update(uuid, content, options) {
    return await this._uploadContent(
      'PUT',
      '/' + uuid,
      content,
      options
    );
  }

  /**
   * Delete a paste
   * @param {string} uuid uuid of the paste
   * @return {object}
   */
  async delete(uuid) {
    let response = await this.client.delete(this.baseUrl + '/' + uuid);
    return yaml.safeLoad(response.body);
  }
}


module.exports = Api;
