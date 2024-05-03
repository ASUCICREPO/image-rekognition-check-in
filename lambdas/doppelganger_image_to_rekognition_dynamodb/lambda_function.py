import boto3

s3_client = boto3.client('s3', region_name='us-west-2')
rekognition_client = boto3.client('rekognition', region_name='us-west-2')
dynamodb_client = boto3.client('dynamodb', region_name='us-west-2')

COLLECTION_ID = 'doppelganger-checkin-collection'
BUCKET_NAME = 'image-rekognition-checkin-image-store'
TABLE_NAME = 'rekognition_checkin_match'

# Upload the face_id, name, and s3_url to the Dynamo table 
def upload_to_dynamo(face_id, asurite):

    
    # Add item to the Dynamo DB table
    dynamodb_client.put_item(
        TableName=TABLE_NAME,
        Item={
            'face_id': {
                "S": face_id
            },
            'asurite': {
                "S": asurite
            }
        }
    )
    
# Adds new face to celebrity rekognition collection
# Takes s3 image key
def add_face_to_collection(key):
    
    response = rekognition_client.index_faces(CollectionId=COLLECTION_ID,
                                  Image={'S3Object': {'Bucket': BUCKET_NAME, 'Name': key}},
                                  ExternalImageId=key.split('.')[0],
                                  MaxFaces=1,
                                  QualityFilter="AUTO",
                                  DetectionAttributes=['ALL'])
                                  
    print ('Results for ' , key) 	
    print('Faces indexed: ', 'None' if not response['FaceRecords'] else '')						
    for faceRecord in response['FaceRecords']:
        print('  Face ID: ' + faceRecord['Face']['FaceId'])
        print('  Location: {}'.format(faceRecord['Face']['BoundingBox']))
        print('  Confidence: {}'.format(faceRecord['Face']['Confidence']))
        return faceRecord['Face']['FaceId']

    print('Faces not indexed: ', 'None' if not response['UnindexedFaces'] else '')
    for unindexedFace in response['UnindexedFaces']:
        print(' Location: {}'.format(unindexedFace['FaceDetail']['BoundingBox']))
        print(' Reasons:')
        for reason in unindexedFace['Reasons']:
            print('   ' + reason)
     
def lambda_handler(event, context):
    
    # Iterate through each uploaded image
    for record in event['Records']:
        
        # Get image information
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']
        
        print('bucket: ', bucket)
        print('key: ', key)
        print(BUCKET_NAME, bucket, key)

        # Grab each piece of the name
        asurite = key.split('.')[0]
        print('asurite: ', asurite)
        
        # Add face to the celebrity collection
        face_id = add_face_to_collection(key)

        # Ensure the call to rekognition returns a face_id (i.e. the call was successful)
        # And upload the face_id, s3_url, and name to Dynamo DB
        if face_id:
            upload_to_dynamo(face_id, asurite)
        else:
            print('No face_id  returned from add_face_to_collection')
            return 'Error: no face_id to returned from rekognition'
    
    return "Success"
