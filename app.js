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
  let imageNames = [
    "12.png",
    "christ.jpg",
    "devotion.jpg",
    "don.jpeg",
    "either.jpeg",
    "god.png",
    "midnight.jpeg",
    "selfish.jpg",
    "soa.jpeg",
    "stranger.jpeg",
    "war.jpeg",
    "zen.jpeg",
  ];

  const getImages = async (imageNames) => {
    let imageData = [];
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
  };

  getImages(imageNames)
    .then((imagesData) => {
      console.log(imagesData);
      let encodedImageData = [];
      for (let i = 0; i < imagesData.length; i++) {
        encodedImageData.push(encode(imagesData[i].Body));
      }
      console.log(encodedImageData.length);
      res.send(encodedImageData);
    })
    .catch((e) => {
      console.log(e);
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
