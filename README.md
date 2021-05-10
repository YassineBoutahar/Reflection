# Reflection - Shopify Backend Intern Challenge

The project can be viewed at https://reflection.boutahar.dev/ or https://reflection-images.netlify.app/

I leveraged a combination of AWS Lambdas, API Gateway, S3 and DynamoDB for a serverless implementation of an image repository. The lambda handlers along with their corresponding tests can be found in the /lambdas/ folder.

To run the backend tests, you can run `yarn test` from the source folder. To check out the frontend from a local build, you can run `yarn add` then `yarn start`, but I removed my API Gateway URL, so most functions will not work. If you would like the URL, please let me know.

**Repository features:**
- Add and upload one or many images
- Edit image metadata
- Upload private images
- Delete images (only works if you are the uploader)
- Search for images based on image metadata
    
*Thanks for taking a look :)*
