# Check in using Image recognition

The `check-in-app-frontend` holds the entire front-end code. That can be directly uploaded to S3.
The website can  hen be served through S3 static website functionality or use Cloudfront distribution for an HTTPS protected endpoint.

After uploading the files in S3, simply go to the Cloudfront UI
1. Create distribution
2. Choose the S3 bucket name endpoint as the origin domain
3. Use Origin access control settings for Origin access, and create a new OAC with signing behaviour as `Sign requests`



image-rekognition-checkin-image-store s3 bucket
create collection
create dynamodb table with face_id as partition key
doppelganger_image_to_rekognition_dynamodb lambda needs S3 trigger and access to S3 read, rekogniton and dynamodb


- [ ] s3
- [ ] cloudfront
- [ ] lambdas - 2 funcs
- [ ] lambda roles
- [ ] dynamodb
- [ ] collection
