/* const cloudinary = require("cloudinary").v2;
const uploadImage=async(path)=>{
    console.log(path)
    try {
        const result = await cloudinary.uploader.upload(path);
        const imageformatted = await cloudinary.url(path, {
          height: 400,
          width: 300,
          crop: "scale",
          class: "card-image-top",
          
        })
       // console.log(imageformatted)
        console.log(result.secure_url)
    }catch{
            console.log("image not uploaded")
        };
}
module.exports=uploadImage */
