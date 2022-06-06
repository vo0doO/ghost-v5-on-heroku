module.exports = {
  mysqlDatabaseUrl:
    process.env.MYSQL_DATABASE_URL ||
    process.env.JAWSDB_URL ||
    process.env.CLEARDB_DATABASE_URL ||
    process.env.JAWSDB_MARIA_URL,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_ACCESS_SECRET_KEY: process.env.S3_ACCESS_SECRET_KEY,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  S3_BUCKET_REGION: process.env.S3_BUCKET_REGION,
  S3_ASSET_HOST_URL: process.env.S3_ASSET_HOST_URL,
  };