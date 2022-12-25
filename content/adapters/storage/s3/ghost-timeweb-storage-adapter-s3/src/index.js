const AWS = require('aws-sdk')
const BaseStore = require('ghost-storage-base')
const { join } = require('path')
const { readFile } = require('fs')
require('dotenv').config('.env')

const readFileAsync = fp => new Promise((resolve, reject) => readFile(fp, (err, data) => err ? reject(err) : resolve(data)))
const stripLeadingSlash = s => s.indexOf('/') === 0 ? s.substring(1) : s
const stripEndingSlash = s => s.indexOf('/') === (s.length - 1) ? s.substring(0, s.length - 1) : s

class Store extends BaseStore {
  constructor (config = {}) {
    super(config)

    const {
      accessKeyId,
      // assetHost,
      bucket,
      pathPrefix,
      region,
      secretAccessKey,
      endpoint,
      serverSideEncryption,
      forcePathStyle,
      signatureVersion,
      acl
    } = config

    // Совместимость с переменными среды aws-sdk по умолчанию
    this.accessKeyId = accessKeyId
    this.secretAccessKey = secretAccessKey
    this.region = process.env.AWS_DEFAULT_REGION || region

    this.bucket = process.env.GHOST_STORAGE_ADAPTER_S3_PATH_BUCKET || bucket

    // Дополнительные конфигурации
    this.host = `https://s3.timeweb.com/`
    this.pathPrefix = stripLeadingSlash(process.env.GHOST_STORAGE_ADAPTER_S3_PATH_PREFIX || pathPrefix || '')
    this.endpoint = process.env.GHOST_STORAGE_ADAPTER_S3_ENDPOINT || endpoint || ''
    this.serverSideEncryption = process.env.GHOST_STORAGE_ADAPTER_S3_SSE || serverSideEncryption || ''
    this.s3ForcePathStyle = Boolean(process.env.GHOST_STORAGE_ADAPTER_S3_FORCE_PATH_STYLE) || Boolean(forcePathStyle) || false
    this.signatureVersion = process.env.GHOST_STORAGE_ADAPTER_S3_SIGNATURE_VERSION || signatureVersion || 'v4'
    this.acl = process.env.GHOST_STORAGE_ADAPTER_S3_ACL || acl || 'public-read'
  }

  delete (fileName, targetDir) {
    const directory = targetDir || this.getTargetDir(this.pathPrefix)

    return new Promise((resolve, reject) => {
      this.s3()
        .deleteObject({
          Bucket: this.bucket,
          Key: stripLeadingSlash(join(directory, fileName))
        }, (err) => err ? resolve(false) : resolve(true))
    })
  }

  exists (fileName, targetDir) {
    return new Promise((resolve, reject) => {
      this.s3()
        .getObject({
          Bucket: this.bucket,
          Key: stripLeadingSlash(join(targetDir, fileName))
        }, (err) => err ? resolve(false) : resolve(true))
    })
  }

  s3 () {
    const options = {
      bucket: this.bucket,
      region: this.region,
      signatureVersion: this.signatureVersion,
      s3ForcePathStyle: this.s3ForcePathStyle
    }

    // Установите учетные данные только в том случае, если они предоставлены, и вернитесь к цепочке поставщиков AWS SDK по умолчанию.
    if (this.accessKeyId && this.secretAccessKey) {
      options.credentials = new AWS.Credentials(this.accessKeyId, this.secretAccessKey)
    }

    if (this.endpoint !== '') {
      options.endpoint = this.endpoint
    }
    return new AWS.S3(options)
  }

  save (image, targetDir) {
    const directory = targetDir || this.getTargetDir(this.pathPrefix)

    return new Promise((resolve, reject) => {
      Promise.all([
        this.getUniqueFileName(image, directory),
        readFileAsync(image.path)
      ]).then(([ fileName, file ]) => {
        let config = {
          ACL: this.acl,
          Body: file,
          Bucket: this.bucket,
          CacheControl: `max-age=${30 * 24 * 60 * 60}`,
          ContentType: image.type,
          Key: stripLeadingSlash(fileName)
        }
        if (this.serverSideEncryption !== '') {
          config.ServerSideEncryption = this.serverSideEncryption
        }
        this.s3()
          .putObject(config, (err, data) => err ? reject(err) : resolve(`${this.host}/${fileName}`))
      })
      .catch(err => reject(err))
    })
  }

  serve () {
    return (req, res, next) =>
      this.s3()
        .getObject({
          Bucket: this.bucket,
          Key: stripLeadingSlash(stripEndingSlash(this.pathPrefix) + req.path)
        })
        .on('httpHeaders', (statusCode, headers, response) => res.set(headers))
        .createReadStream()
        .on('error', err => {
          res.status(404)
          next(err)
        })
        .pipe(res)
  }

  read (options) {
    options = options || {}

    return new Promise((resolve, reject) => {
      // удалить завершающие косые черты
      let path = (options.path || '').replace(/\/$|\\$/, '')

      // проверьте, хранится ли путь в s3, обрабатываемом нами
      if (!path.startsWith(this.host)) {
        reject(new Error(`${path} не хранится в s3`))
      }
      path = path.substring(this.host.length)

      this.s3()
        .getObject({
          Bucket: this.bucket,
          Key: stripLeadingSlash(path)
        }, (err, data) => err ? reject(err) : resolve(data.Body))
    })
  }
}

export default Store
