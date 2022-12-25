const rx = require("rxjs");
require('dotenv').config();
import { join } from 'path'
import { readFile } from 'fs'
const env = require('process').env;
import { S3 } from 'aws-sdk/clients/s3'
import { StorageBase } from 'ghost-storage-base'; 


/**
 * ## GhostTimeWebStorageAdapterS3
 */
class GhostTimeWebStorageAdapterS3 extends StorageBase {
/**
 * 
 * @param {Object} config
 * @param {String} config.accessKeyId
 * @param {String} config.secretAccessKey
 * @param {String} config.endpoint
 * @param {String} config.s3ForcePathStyle
 * @param {String} config.region
 * @param {String} config.apiVersion
 * @param {String} config.objectKey
 * @param {Module} S3
 */
    constructor( config = {} ) {
        super(config);
    
        const {
            objectKey,
            copyObjectKey,
            accessKeyId,
            secretAccessKey,
            endpoint,
            s3ForcePathStyle,
            region,
            apiVersion,
            S3
        } = config

        this.objectKey = config.objectKey
        this.copyObjectKey = config.copyObjectKey
        this.bucketParams = { Bucket: config.bucket }
        this.uploadParams = { Bucket: this.bucketParams.Bucket, Key: "", Body: "" }
        this.createParams = { Bucket: this.bucketParams.Bucket, Key: this.objectKey, Body: 'test_body123' }
        this.metaParams = { Bucket: this.bucketParams.Bucket, Key: this.objectKey }
        this.copyParams = { Bucket: this.bucketParams.Bucket, CopySource: `${this.bucketParams.Bucket}/${this.objectKey}`, Key: this.copyObjectKey }
        this.accessKeyId = config.accessKeyId,
        this.secretAccessKey = config.secretAccessKey,
        this.endpoint = config.endpoint,
        this.s3ForcePathStyle = config.s3ForcePathStyle,
        this.region = config.region,
        this.apiVersion = config.apiVersion
    }


    /**
     * ## Проверяет есть ли указанный файл в аказанной папке
     * 
     * ## 
     * 
     * @param {*} fileName Название искомого файла
     * @param {*} targetDir Название искомой папки
     * @returns {bool} true или false 
     */
    async exists(fileName, targetDir) {
        try {
            if (fileName == "undefined") {
                throw new Error("Нет названия искомого файла");
            }

            else {
                this.getSanitizedFileName(fileName)
            }

            var resp = await this.s3.listObjects(this.bucketParams).promise();
            resp = resp.$response
            var data = await resp.data;
            var contents = await data.Contents
            var files = new Map();

            contents.forEach((file, idx) => { // обходим в цикле полученный список
                files.set(file.Key.split("/"), idx); // составляем карту файлов и папок  
                }
            );

            

        } catch (e) {
            throw new Error(error);
        }
    }

    async save() {
        return new Promise(
            (resolve) => {
                return;
            },
            (reject) => {
                return;
            }
        );
    }

    async serve() {
        return;
    }

    async delete() {
        return;
    }

    async read() {
        return;
    }
}

async function main() {
    

        const s = new TimeWebStorageAdapter(
            env.accessKeyId,
            env.secretAccessKey,
            env.endpoint,
            env.s3ForcePathStyle,
            env.region,
            env.apiVersion,
            env.objectKey,
            env.copyObjectKey,
            env.bucket,
            env.uploadParams,
            env.metaParams
        )
    
        var ex = s.exists("config.js");
    
        console.log(ex);
    }

main()