const catchAsyncError = require("../middleware/catchAsyncError");
const Product=require("../models/productModel");
const Apifeatures = require("../utils/apifeatures");
const ErrorHandler = require("../utils/errorhandler");
const cloudinary=require("cloudinary").v2;

//create Product --admin route
exports.createProduct=catchAsyncError(async(req,res,next)=>{
   console.log("error1"); 
   cloudinary.config({
        cloud_name: 'daequ7ofa',
        api_key: '762768164935239',
        api_secret: 'po-dxhHi3sYDqG4VvB32bDYANMg'
      });

    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  
    const imagesLinks = [];
  console.log("error");
  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

   
   // req.body.images = imagesLinks;
    req.body.user=req.user.id;
    const product=await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    });
});



//get product

exports.getAllProduct=catchAsyncError(async (req,res,next)=>{
  
     resultPerPage=8;
     const productCount= await Product.countDocuments();
    const apiFeatures=new Apifeatures(Product.find(),req.query).search().filter()

   // const products=await apiFeatures.query;

    //let filteredProductsCount=products.length;

     apiFeatures.pagination(resultPerPage)
    

   const product=await apiFeatures.query;
   
   //console.log(filteredProductsCount)
    res.status(200).json({
    
        success:true,
        product,
        productCount,
        resultPerPage,
     
    })

});

//GetAllProduct By Admin

exports.getAdminProduct=catchAsyncError(async (req,res,next)=>{
  
 const product=await Product.find()
   res.status(200).json({
   
       success:true,
       product,
       
   })

});

// get single product details

exports.getProductDetails=catchAsyncError( async(req,res,next)=>{
    let product=await Product.findById(req.params.id);
    if(!product){
      return next(new ErrorHandler("product not found",404))
     /*return res.status(404).json({
        success:false,
        message:"not found"
     })*/    
    }
    res.status(200).json({
        success:true,
        product
        })

})

// update product

exports.updateProduct=catchAsyncError( async(req,res,next)=>{

    let product=await Product.findById(req.params.id);
    if(!product){
        return  next(new ErrorHandler("product not found",404)) 
    }

      // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  

product=await Product.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true,
    useFindAndModify:false
})
res.status(200).json({
success:true,
product
})
});

//deleteproduct

exports.deleteProduct= catchAsyncError(  async(req,res,next)=>{

  console.log("Error Server one");
    let product=await Product.findById(req.params.id);
  console.log("Error Server 2");
  
    if(!product){
        return  next(new ErrorHandler("product not found",404)) 
    }

    console.log("Error server 3");
   //Deleteting images from cloudinary

   cloudinary.config({
    cloud_name: 'daequ7ofa',
    api_key: '762768164935239',
    api_secret: 'po-dxhHi3sYDqG4VvB32bDYANMg'
  });
  console.log("Server error 4");

  for(let i=0;i<product.images.length;i++){
    await cloudinary.uploader.destroy(product.images[i].public_id);
  }


  console.log("Server error5");



    await product.remove();
    console.log("Server error6");
    res.status(200).json({
        success:true,
        message:"product delete"
        })   
});

//create new review or update the review
exports.createProductReview=catchAsyncError(async(req,res,next)=>{
    const {rating,comment,productId}=req.body;
    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    }
    console.log("error1")
    const product=await Product.findById(productId);
    const IsReviewd=product.reviews.find((rev)=>rev.user.toString()===req.user._id.toString())
    console.log(product)
    if(IsReviewd){
        console.log("Inner reviewd");
       product.reviews.forEach((rev) => {
        if(rev.user.toString()===req.user._id.toString())
           (rev.rating=rating),(rev.comment=comment);
       });
    }else{
        console.log("error3");
        product.reviews.push(review)
        console.log("error4")
        product.numofReviews=product.reviews.length;
    }
    console.log("error5");
    let avg=0;
    product.reviews.forEach((rev)=>{
        avg+=rev.rating;
        console.log(rev.rating)
    })/product.reviews.length
    product.ratings=avg;
    await product.save({validateBeforeSave:false})
    res.status(200).json({
        success:true
    })
})

//to see the all reviews of single product
exports.getProductReviews=catchAsyncError(async(req,res,next)=>{
    const product=await Product.findById(req.query.id);

    if(!product){
        res.status(404).json({
            message:"Product not found"
        })
    }
    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
})


//to delete the review
exports.deleteProductReviews=catchAsyncError(async(req,res,next)=>{
    const product=await Product.findById(req.query.productId);
    console.log(product)
    if(!product){
        res.status(404).json({
            message:"Product not found"
        })
    }

    const reviews=product.reviews.filter(
        (rev)=>rev._id.toString() !== req.query.id.toString(),
        console.log("p")
    )
    console.log("p1")
    let avg=0;
    reviews.forEach((rev)=>{
        avg+=rev.ratings;
    });
    console.log(
        "P2"
    )

    const ratings=avg/reviews.length;
    console.log("p3")
    const numOfReviews=reviews.length;
    console.log(numOfReviews);
    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numofReviews,
        
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

   console.log("error5")
    res.status(200).json({
        success:true,
        
    })
})
// Delete Review
/*exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
  
    if (!product) {
     // return next(new ErrorHander("Product not found", 404));
     res.status(404).json({
        message:"Product not found"
    })
    }
  
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
  
    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    let ratings = 0;
  
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
  
    const numOfReviews = reviews.length;
  
    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  
    res.status(200).json({
      success: true,
    });
  });
  */