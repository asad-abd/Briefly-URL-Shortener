const AWS = require("aws-sdk");
require("dotenv").config();
const multer = require("multer");
const multerS3 = require("multer-s3");
const uuid = require("uuid").v4;
const path = require("path");

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const URLS = "short_to_long_url";
const USERS = "dev_keys";

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const getLongUrl = async (short) => {
  const params = {
    TableName: URLS,
    Key: {
      short,
    },
  };
  return await dynamoClient.get(params).promise();
};

const addOrUpdateUrl = async (item) => {
  const params = {
    TableName: URLS,
    Item: item,
  };
  return await dynamoClient.put(params).promise();
};

const deleteUrl = async (short) => {
  const params = {
    TableName: URLS,
    Key: {
      short,
    },
  };
  return await dynamoClient.delete(params).promise();
};

const getUser = async (email) => {
  const params = {
    TableName: USERS,
    Key: {
      email,
    },
  };
  return await dynamoClient.get(params).promise();
};

const addUser = async (item) => {
  const params = {
    TableName: USERS,
    Item: item,
  };
  return await dynamoClient.put(params).promise();
};

// S3 upload function
function fileFilter(req, file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;

  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}
const upload = multer({
  fileFilter: fileFilter,
  storage: multerS3({
    s3,
    bucket: "briefly-bucket",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuid()}${ext}`);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 15, // we are allowing only 15 MB files
  },
});

// delete object from S3
const deleteS3Object = async (key) => {
  const params = {
    Bucket: "briefly-bucket",
    Key: key, // filename
  };
  return await s3.deleteObject(params).promise();
};

module.exports = {
  dynamoClient,
  getLongUrl,
  addOrUpdateUrl,
  deleteUrl,
  getUser,
  addUser,
  upload,
  deleteS3Object,
};
