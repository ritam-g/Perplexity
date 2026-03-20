import ImageKit from "imagekit";
import 'dotenv/config'
/*
  👉 Create ImageKit instance
  (You get these from ImageKit dashboard)
*/
export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_END_URL, // base URL
});