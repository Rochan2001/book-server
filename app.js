const aws = require("aws-sdk");
const config = require("./config.json");
const express = require("express");
const app = express();
const PORT = 3200;
const cors = require("cors");

//middleware
app.use(cors());

//get request to fetch images from AWS s3
app.get("/images", (req, res) => {
  aws.config.setPromisesDependency();
  aws.config.update({
    accessKeyId: config.aws.AccessKey,
    secretAccessKey: config.aws.SecretKey,
    region: "us-east-1",
  });

  const s3 = new aws.S3();
  let imageData = [];

  async function getBookNames() {
    const response = await s3
      .listObjectsV2({
        Bucket: "bookstore-jntu",
      })
      .promise();
    return response;
  }

  getBookNames()
    .then((imageNames) => {
      let images = [];
      for (let i = 0; i < imageNames.Contents.length; i++) {
        images.push(imageNames.Contents[i].Key);
      }
      return images;
    })
    .then(async (imageNames) => {
      for (let i = 0; i < imageNames.length; i++) {
        const data = await s3
          .getObject({
            Bucket: "bookstore-jntu",
            Key: imageNames[i],
          })
          .promise();
        imageData.push(data);
      }
      return imageData;
    })
    .then((imagesData) => {
      let encodedImageData = [];
      for (let i = 0; i < imagesData.length; i++) {
        encodedImageData.push(encode(imagesData[i].Body));
      }
      console.log(encodedImageData.length);
      res.send(encodedImageData);
    })
    .catch((e) => {
      res.send(e);
    });

  function encode(data) {
    let buf = Buffer.from(data);
    let base64 = buf.toString("base64");
    return base64;
  }
});

app.listen(PORT, () => {
  console.log(`Web Server running on port ${PORT}`);
});
